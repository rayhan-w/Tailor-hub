import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Users, Scissors, ShoppingBag, Star, ShieldCheck, ShieldOff, Trash2, CheckCircle2, XCircle } from 'lucide-react';

const AdminDashboard = () => {
  const { user, hasRole, roles: authRoles, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ users: 0, tailors: 0, orders: 0, reviews: 0 });
  const [profiles, setProfiles] = useState<any[]>([]);
  const [userRolesData, setUserRolesData] = useState<any[]>([]);
  const [tailors, setTailors] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);

  const loadAll = async () => {
    setLoading(true);
    const [{ data: p }, { data: r }, { data: t }, { data: o }, { data: rv }] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('user_roles').select('*'),
      supabase.from('tailors').select('*').order('created_at', { ascending: false }),
      supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(100),
      supabase.from('reviews').select('*').order('created_at', { ascending: false }).limit(100),
    ]);
    setProfiles(p || []);
    setUserRolesData(r || []);
    setTailors(t || []);
    setOrders(o || []);
    setReviews(rv || []);
    setStats({
      users: (p || []).length,
      tailors: (t || []).length,
      orders: (o || []).length,
      reviews: (rv || []).length,
    });
    setLoading(false);
  };

  useEffect(() => {
    if (user && hasRole('admin')) loadAll();
  }, [user, authRoles]);

  // Wait for both auth and roles to be resolved before deciding
  if (authLoading || (user && authRoles.length === 0)) {
    return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (!hasRole('admin')) return <Navigate to="/" replace />;

  const getUserRoles = (userId: string) =>
    userRolesData.filter((r) => r.user_id === userId).map((r) => r.role);

  const toggleAdminRole = async (userId: string, isAdmin: boolean) => {
    if (isAdmin) {
      const { error } = await supabase.from('user_roles').delete().eq('user_id', userId).eq('role', 'admin');
      if (error) return toast({ title: 'Error', description: error.message, variant: 'destructive' });
      toast({ title: 'Admin role removed' });
    } else {
      const { error } = await supabase.from('user_roles').insert({ user_id: userId, role: 'admin' });
      if (error) return toast({ title: 'Error', description: error.message, variant: 'destructive' });
      toast({ title: 'Admin role granted' });
    }
    loadAll();
  };

  const toggleVerified = async (tailorId: string, current: boolean) => {
    const { error } = await supabase.from('tailors').update({ is_verified: !current }).eq('id', tailorId);
    if (error) return toast({ title: 'Error', description: error.message, variant: 'destructive' });
    toast({ title: !current ? 'Tailor verified' : 'Verification removed' });
    loadAll();
  };

  const deleteReview = async (id: string) => {
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (error) return toast({ title: 'Error', description: error.message, variant: 'destructive' });
    toast({ title: 'Review deleted' });
    loadAll();
  };

  const updateOrderStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('orders').update({ status: status as any }).eq('id', id);
    if (error) return toast({ title: 'Error', description: error.message, variant: 'destructive' });
    toast({ title: 'Order updated' });
    loadAll();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold text-gradient-primary">Admin Panel</h1>
          <p className="text-muted-foreground mt-2">Manage users, tailors, orders, and reviews.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Users} label="Users" value={stats.users} />
          <StatCard icon={Scissors} label="Tailors" value={stats.tailors} />
          <StatCard icon={ShoppingBag} label="Orders" value={stats.orders} />
          <StatCard icon={Star} label="Reviews" value={stats.reviews} />
        </div>

        <Tabs defaultValue="users">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="tailors">Tailors</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader><CardTitle>All Users</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Roles</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={5}>Loading…</TableCell></TableRow>
                    ) : profiles.map((p) => {
                      const userRoles = getUserRoles(p.user_id);
                      const isAdmin = userRoles.includes('admin');
                      return (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">{p.full_name || '—'}</TableCell>
                          <TableCell>{p.email || '—'}</TableCell>
                          <TableCell>{p.phone || '—'}</TableCell>
                          <TableCell>
                            <div className="flex gap-1 flex-wrap">
                              {userRoles.map((r) => (
                                <Badge key={r} variant={r === 'admin' ? 'default' : 'secondary'}>{r}</Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant={isAdmin ? 'destructive' : 'outline'}
                              onClick={() => toggleAdminRole(p.user_id, isAdmin)}
                              disabled={p.user_id === user.id}
                            >
                              {isAdmin ? <><ShieldOff className="h-4 w-4 mr-1" />Revoke Admin</> : <><ShieldCheck className="h-4 w-4 mr-1" />Make Admin</>}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tailors">
            <Card>
              <CardHeader><CardTitle>Tailor Shops</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Shop</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={6}>Loading…</TableCell></TableRow>
                    ) : tailors.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="font-medium">{t.shop_name}</TableCell>
                        <TableCell>{t.city || '—'}</TableCell>
                        <TableCell>{t.phone || '—'}</TableCell>
                        <TableCell>{Number(t.rating || 0).toFixed(1)} ({t.total_reviews || 0})</TableCell>
                        <TableCell>
                          {t.is_verified ? (
                            <Badge className="bg-green-600"><CheckCircle2 className="h-3 w-3 mr-1" />Verified</Badge>
                          ) : (
                            <Badge variant="secondary"><XCircle className="h-3 w-3 mr-1" />Unverified</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" onClick={() => toggleVerified(t.id, !!t.is_verified)}>
                            {t.is_verified ? 'Unverify' : 'Verify'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader><CardTitle>Recent Orders</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Garment</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={6}>Loading…</TableCell></TableRow>
                    ) : orders.map((o) => (
                      <TableRow key={o.id}>
                        <TableCell className="font-medium">{o.garment_name}</TableCell>
                        <TableCell>{o.garment_type}</TableCell>
                        <TableCell>{o.price ? `৳${o.price}` : '—'}</TableCell>
                        <TableCell><Badge variant="outline">{o.status}</Badge></TableCell>
                        <TableCell>{new Date(o.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          {o.status !== 'cancelled' && (
                            <Button size="sm" variant="destructive" onClick={() => updateOrderStatus(o.id, 'cancelled')}>
                              Cancel
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card>
              <CardHeader><CardTitle>Reviews</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rating</TableHead>
                      <TableHead>Comment</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={4}>Loading…</TableCell></TableRow>
                    ) : reviews.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-accent text-accent" />
                            {r.rating}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-md truncate">{r.comment || '—'}</TableCell>
                        <TableCell>{new Date(r.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="destructive" onClick={() => deleteReview(r.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value }: { icon: any; label: string; value: number }) => (
  <Card className="hover-lift">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
          <Icon className="h-6 w-6 text-primary-foreground" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default AdminDashboard;