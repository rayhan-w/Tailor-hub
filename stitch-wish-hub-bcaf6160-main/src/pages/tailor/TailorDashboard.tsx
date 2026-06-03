import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, Settings, Image, DollarSign, Tag, 
  CheckCircle, Clock, Truck, Eye, MapPin, Phone, Mail
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Order {
  id: string;
  garment_name: string;
  garment_type: string;
  status: string;
  price: number | null;
  created_at: string;
  estimated_delivery: string | null;
  customer_id: string;
  description: string | null;
}

interface TailorProfile {
  id: string;
  shop_name: string;
  description: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  is_available: boolean | null;
  specialties: string[] | null;
  rating: number | null;
  total_reviews: number | null;
}

const TailorDashboard = () => {
  const { t } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [tailorProfile, setTailorProfile] = useState<TailorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<TailorProfile>>({});

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      // Avoid infinite loading skeleton when logged out
      setLoading(false);
      return;
    }

    fetchData();
  }, [user, authLoading]);

  const fetchData = async () => {
    if (!user) return;

    setLoading(true);

    // Fetch tailor profile
    const { data: tailorData } = await supabase
      .from('tailors')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (tailorData) {
      setTailorProfile(tailorData);
      setEditedProfile(tailorData);

      // Fetch orders for this tailor
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .eq('tailor_id', tailorData.id)
        .order('created_at', { ascending: false });

      setOrders(ordersData || []);
    }

    setLoading(false);
  };

  const handleUpdateProfile = async () => {
    if (!tailorProfile) return;

    const { error } = await supabase
      .from('tailors')
      .update({
        shop_name: editedProfile.shop_name,
        description: editedProfile.description,
        phone: editedProfile.phone,
        email: editedProfile.email,
        address: editedProfile.address,
        city: editedProfile.city,
      })
      .eq('id', tailorProfile.id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Profile updated successfully!',
      });
      setIsEditing(false);
      fetchData();
    }
  };

  const handleToggleAvailability = async () => {
    if (!tailorProfile) return;

    const newAvailability = !tailorProfile.is_available;
    
    const { error } = await supabase
      .from('tailors')
      .update({ is_available: newAvailability })
      .eq('id', tailorProfile.id);

    if (!error) {
      setTailorProfile(prev => prev ? { ...prev, is_available: newAvailability } : null);
      toast({
        title: newAvailability ? t('available') : t('busy'),
        description: newAvailability ? t('availableNow') : t('notAvailable'),
      });
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: 'accepted' | 'in_progress' | 'ready' | 'delivered') => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
    } else {
      // Send notification to customer
      const order = orders.find(o => o.id === orderId);
      if (order) {
        await supabase.from('notifications').insert({
          user_id: order.customer_id,
          title: t('orderUpdate'),
          message: `${t('orderStatusUpdated')}: ${t(newStatus)}`,
          type: 'order',
        });
      }

      toast({
        title: 'Success',
        description: 'Order status updated!',
      });
      fetchData();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'accepted':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'in_progress':
        return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'ready':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'delivered':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'cancelled':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getNextStatus = (currentStatus: string): 'accepted' | 'in_progress' | 'ready' | 'delivered' | null => {
    const statusFlow: Record<string, 'accepted' | 'in_progress' | 'ready' | 'delivered'> = {
      pending: 'accepted',
      accepted: 'in_progress',
      in_progress: 'ready',
      ready: 'delivered',
    };
    return statusFlow[currentStatus] || null;
  };

  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const activeOrders = orders.filter(o => ['accepted', 'in_progress'].includes(o.status)).length;
  const completedOrders = orders.filter(o => o.status === 'delivered').length;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Settings className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('login')}</h3>
              <p className="text-muted-foreground mb-4">{t('welcomeBack')}</p>
              <Button asChild>
                <Link to="/auth">{t('login')}</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (!tailorProfile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Settings className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('shopSetup')}</h3>
              <p className="text-muted-foreground mb-4">{t('shopSetupDesc')}</p>
              <Button asChild>
                <Link to="/tailor/setup">{t('startSetup')}</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header with Availability Toggle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">{tailorProfile.shop_name}</h1>
            <p className="text-muted-foreground">{t('tailorDashboard')}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="availability">
                {tailorProfile.is_available ? t('available') : t('busy')}
              </Label>
              <Switch
                id="availability"
                checked={tailorProfile.is_available || false}
                onCheckedChange={handleToggleAvailability}
              />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 rounded-full bg-yellow-500/10">
                <Clock className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingOrders}</p>
                <p className="text-sm text-muted-foreground">{t('pendingOrders')}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 rounded-full bg-blue-500/10">
                <Package className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeOrders}</p>
                <p className="text-sm text-muted-foreground">{t('activeOrders')}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 rounded-full bg-green-500/10">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedOrders}</p>
                <p className="text-sm text-muted-foreground">{t('completedOrders')}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 rounded-full bg-primary/10">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  ৳{orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + (o.price || 0), 0)}
                </p>
                <p className="text-sm text-muted-foreground">{t('totalEarnings')}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              {t('orders')}
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              {t('profile')}
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              {t('portfolio')}
            </TabsTrigger>
            <TabsTrigger value="pricing" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              {t('pricing')}
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders">
            {orders.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{t('noOrdersYet')}</h3>
                  <p className="text-muted-foreground">{t('noOrdersReceived')}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{order.garment_name}</h3>
                            <Badge className={getStatusColor(order.status)}>
                              {t(order.status)}
                            </Badge>
                          </div>
                          {order.description && (
                            <p className="text-sm text-muted-foreground mb-2">{order.description}</p>
                          )}
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span>{t('orderDate')}: {new Date(order.created_at).toLocaleDateString()}</span>
                            {order.price && <span>{t('price')}: ৳{order.price}</span>}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/tailor/order/${order.id}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              {t('details')}
                            </Link>
                          </Button>
                          {getNextStatus(order.status) && (
                            <Button
                              size="sm"
                              onClick={() => handleUpdateOrderStatus(order.id, getNextStatus(order.status)!)}
                            >
                              {order.status === 'ready' ? (
                                <>
                                  <Truck className="h-4 w-4 mr-1" />
                                  {t('delivery')}
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  {t(getNextStatus(order.status)!)}
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{t('shopInfo')}</CardTitle>
                <Button
                  variant={isEditing ? 'default' : 'outline'}
                  onClick={() => {
                    if (isEditing) {
                      handleUpdateProfile();
                    } else {
                      setIsEditing(true);
                    }
                  }}
                >
                  {isEditing ? t('save') : t('edit')}
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('shopName')}</Label>
                    {isEditing ? (
                      <Input
                        value={editedProfile.shop_name || ''}
                        onChange={(e) => setEditedProfile({ ...editedProfile, shop_name: e.target.value })}
                      />
                    ) : (
                      <p className="text-foreground">{tailorProfile.shop_name}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>{t('city')}</Label>
                    {isEditing ? (
                      <Input
                        value={editedProfile.city || ''}
                        onChange={(e) => setEditedProfile({ ...editedProfile, city: e.target.value })}
                      />
                    ) : (
                      <p className="flex items-center gap-1 text-foreground">
                        <MapPin className="h-4 w-4" />
                        {tailorProfile.city || t('notSet')}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>{t('phone')}</Label>
                    {isEditing ? (
                      <Input
                        value={editedProfile.phone || ''}
                        onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                      />
                    ) : (
                      <p className="flex items-center gap-1 text-foreground">
                        <Phone className="h-4 w-4" />
                        {tailorProfile.phone || t('notSet')}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>{t('email')}</Label>
                    {isEditing ? (
                      <Input
                        value={editedProfile.email || ''}
                        onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                      />
                    ) : (
                      <p className="flex items-center gap-1 text-foreground">
                        <Mail className="h-4 w-4" />
                        {tailorProfile.email || t('notSet')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t('address')}</Label>
                  {isEditing ? (
                    <Input
                      value={editedProfile.address || ''}
                      onChange={(e) => setEditedProfile({ ...editedProfile, address: e.target.value })}
                    />
                  ) : (
                    <p className="text-foreground">{tailorProfile.address || t('notSet')}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>{t('description')}</Label>
                  {isEditing ? (
                    <Textarea
                      value={editedProfile.description || ''}
                      onChange={(e) => setEditedProfile({ ...editedProfile, description: e.target.value })}
                      rows={4}
                    />
                  ) : (
                    <p className="text-foreground">{tailorProfile.description || t('notSet')}</p>
                  )}
                </div>

                {/* Rating Display */}
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">{t('rating')}</p>
                      <p className="text-2xl font-bold">{tailorProfile.rating?.toFixed(1) || '0.0'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t('reviews')}</p>
                      <p className="text-2xl font-bold">{tailorProfile.total_reviews || 0}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{t('portfolio')}</CardTitle>
                <Button>
                  <Image className="h-4 w-4 mr-2" />
                  {t('addPhoto')}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t('noPortfolioYet')}</p>
                  <p className="text-sm">{t('uploadWorkPhotos')}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{t('pricing')}</CardTitle>
                <Button>
                  <Tag className="h-4 w-4 mr-2" />
                  {t('addPrice')}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t('noPricingYet')}</p>
                  <p className="text-sm">{t('addGarmentPrices')}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default TailorDashboard;
