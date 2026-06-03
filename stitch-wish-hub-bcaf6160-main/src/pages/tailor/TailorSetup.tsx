import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Scissors, MapPin, Phone, Mail, Store } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import LocationInputWithMap from '@/components/location/LocationInputWithMap';
import type { Database } from '@/integrations/supabase/types';

type GarmentType = Database['public']['Enums']['garment_type'];

const TailorSetup = () => {
  const { t } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    shopName: '',
    description: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    specialties: [] as GarmentType[],
    latitude: null as number | null,
    longitude: null as number | null,
  });

  const specialtyOptions: { id: GarmentType; label: string }[] = [
    { id: 'traditional', label: t('traditional') },
    { id: 'western_formal', label: t('westernFormal') },
    { id: 'bridal_wedding', label: t('bridalWedding') },
    { id: 'alterations', label: t('alterations') },
  ];

  const handleSpecialtyChange = (specialty: GarmentType, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      specialties: checked
        ? [...prev.specialties, specialty]
        : prev.specialties.filter(s => s !== specialty),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.shopName.trim()) {
      toast({
        title: 'Error',
        description: t('shopNameRequired'),
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.from('tailors').insert({
      user_id: user.id,
      shop_name: formData.shopName,
      description: formData.description || null,
      phone: formData.phone || null,
      email: formData.email || null,
      address: formData.address || null,
      city: formData.city || null,
      specialties: formData.specialties.length > 0 ? formData.specialties : null,
      latitude: formData.latitude,
      longitude: formData.longitude,
      is_available: true,
    });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to create tailor profile',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success!',
        description: t('shopCreated'),
      });
      navigate('/tailor/dashboard');
    }

    setIsSubmitting(false);
  };

  const handleLocationPick = (lat: number, lng: number, label: string) => {
    setFormData((prev) => ({
      ...prev,
      city: label,
      latitude: lat,
      longitude: lng,
    }));
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4 max-w-2xl mx-auto">
            <div className="h-8 bg-muted rounded w-1/3"></div>
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
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Scissors className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t('login')}</h3>
                <p className="text-muted-foreground mb-4">{t('welcomeBack')}</p>
                <Button asChild>
                  <Link to="/auth">{t('login')}</Link>
                </Button>
              </CardContent>
            </Card>
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
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
              <Scissors className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">{t('shopSetup')}</h1>
            <p className="text-muted-foreground">{t('shopInfoDesc')}</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                {t('shopInfo')}
              </CardTitle>
              <CardDescription>
                {t('shopInfoDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Shop Name */}
                <div className="space-y-2">
                  <Label htmlFor="shopName">{t('shopName')} *</Label>
                  <Input
                    id="shopName"
                    placeholder={t('yourShopName')}
                    value={formData.shopName}
                    onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">{t('description')}</Label>
                  <Textarea
                    id="description"
                    placeholder={t('writeAboutShop')}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                  />
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {t('phone')}
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="01XXXXXXXXX"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {t('email')}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {t('city')}
                    </Label>
                    <LocationInputWithMap
                      value={formData.city}
                      onChange={(next) => setFormData((prev) => ({ ...prev, city: next }))}
                      placeholder={t('cityArea')}
                      onPickCoordinates={handleLocationPick}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">{t('address')}</Label>
                    <Input
                      id="address"
                      placeholder={t('fullAddress')}
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                </div>

                {/* Specialties */}
                <div className="space-y-3">
                  <Label>{t('specialties')}</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {specialtyOptions.map((specialty) => (
                      <div
                        key={specialty.id}
                        className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50"
                      >
                        <Checkbox
                          id={specialty.id}
                          checked={formData.specialties.includes(specialty.id)}
                          onCheckedChange={(checked) =>
                            handleSpecialtyChange(specialty.id, checked as boolean)
                          }
                        />
                        <Label htmlFor={specialty.id} className="cursor-pointer">
                          {specialty.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? t('loading') : t('createShop')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TailorSetup;
