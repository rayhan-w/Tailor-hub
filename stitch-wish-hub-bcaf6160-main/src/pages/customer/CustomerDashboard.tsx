import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Ruler, Bell, Star, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import BodyMeasurement from '@/components/measurements/BodyMeasurement';
import { useToast } from '@/hooks/use-toast';

interface Order {
  id: string;
  garment_name: string;
  garment_type: string;
  status: string;
  price: number | null;
  created_at: string;
  estimated_delivery: string | null;
  tailor_id: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  type: string | null;
}

interface Measurement {
  id: string;
  measurement_name: string;
  chest: number | null;
  waist: number | null;
  hips: number | null;
  shoulder_width: number | null;
  arm_length: number | null;
  inseam: number | null;
  neck: number | null;
  thigh: number | null;
}

const CustomerDashboard = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [measurements, setMeasurements] = useState<Measurement | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    setLoading(true);

    // Fetch orders
    const { data: ordersData } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false });

    // Fetch notifications
    const { data: notificationsData } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    // Fetch measurements
    const { data: measurementsData } = await supabase
      .from('customer_measurements')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    setOrders(ordersData || []);
    setNotifications(notificationsData || []);
    setMeasurements(measurementsData);
    setLoading(false);
  };

  const handleSaveMeasurements = async (data: any) => {
    if (!user) return;

    const measurementData = {
      user_id: user.id,
      measurement_name: 'Default',
      chest: parseFloat(data.chest) || null,
      waist: parseFloat(data.waist) || null,
      hips: parseFloat(data.hips) || null,
      shoulder_width: parseFloat(data.shoulderWidth) || null,
      arm_length: parseFloat(data.armLength) || null,
      inseam: parseFloat(data.inseam) || null,
      neck: parseFloat(data.neck) || null,
      thigh: parseFloat(data.thigh) || null,
    };

    let result;
    if (measurements) {
      result = await supabase
        .from('customer_measurements')
        .update(measurementData)
        .eq('id', measurements.id);
    } else {
      result = await supabase
        .from('customer_measurements')
        .insert(measurementData);
    }

    if (result.error) {
      toast({
        title: 'Error',
        description: 'Failed to save measurements',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Measurements saved successfully!',
      });
      fetchData();
    }
  };

  const markNotificationRead = async (id: string) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
    
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'accepted':
      case 'in_progress':
        return <Package className="h-4 w-4" />;
      case 'ready':
        return <CheckCircle className="h-4 w-4" />;
      case 'delivered':
        return <Truck className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
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

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{t('dashboard')}</h1>
          <p className="text-muted-foreground">{t('welcomeDashboard')}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 rounded-full bg-primary/10">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{orders.length}</p>
                <p className="text-sm text-muted-foreground">{t('orders')}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 rounded-full bg-green-500/10">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {orders.filter(o => o.status === 'delivered').length}
                </p>
                <p className="text-sm text-muted-foreground">{t('delivered')}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 rounded-full bg-yellow-500/10">
                <Bell className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{unreadCount}</p>
                <p className="text-sm text-muted-foreground">{t('newNotifications')}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              {t('orders')}
            </TabsTrigger>
            <TabsTrigger value="measurements" className="flex items-center gap-2">
              <Ruler className="h-4 w-4" />
              {t('myMeasurements')}
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              {t('notifications')}
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders">
            {orders.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{t('noOrders')}</h3>
                  <p className="text-muted-foreground mb-4">{t('noOrdersDesc')}</p>
                  <Button asChild>
                    <Link to="/tailors">{t('findTailors')}</Link>
                  </Button>
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
                              {getStatusIcon(order.status)}
                              <span className="ml-1">{t(order.status)}</span>
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span>{t('orderDate')}: {new Date(order.created_at).toLocaleDateString()}</span>
                            {order.estimated_delivery && (
                              <span>{t('deliveryDate')}: {new Date(order.estimated_delivery).toLocaleDateString()}</span>
                            )}
                            {order.price && <span>{t('price')}: ৳{order.price}</span>}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/order/${order.id}`}>{t('details')}</Link>
                          </Button>
                          {order.status === 'delivered' && (
                            <Button size="sm" asChild>
                              <Link to={`/review/${order.id}`}>
                                <Star className="h-4 w-4 mr-1" />
                                {t('giveReview')}
                              </Link>
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

          {/* Measurements Tab */}
          <TabsContent value="measurements">
            <BodyMeasurement
              initialData={measurements ? {
                chest: measurements.chest?.toString() || '',
                waist: measurements.waist?.toString() || '',
                hips: measurements.hips?.toString() || '',
                shoulderWidth: measurements.shoulder_width?.toString() || '',
                armLength: measurements.arm_length?.toString() || '',
                inseam: measurements.inseam?.toString() || '',
                neck: measurements.neck?.toString() || '',
                thigh: measurements.thigh?.toString() || '',
              } : undefined}
              onSave={handleSaveMeasurements}
              isEditable={true}
            />
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            {notifications.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{t('noNotifications')}</h3>
                  <p className="text-muted-foreground">{t('noNotificationsDesc')}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={`cursor-pointer transition-colors ${
                      !notification.is_read ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => markNotificationRead(notification.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${
                          notification.type === 'order' ? 'bg-primary/10' : 'bg-muted'
                        }`}>
                          <Bell className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{notification.title}</h4>
                            {!notification.is_read && (
                              <Badge variant="default" className="text-xs">{t('new')}</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(notification.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default CustomerDashboard;
