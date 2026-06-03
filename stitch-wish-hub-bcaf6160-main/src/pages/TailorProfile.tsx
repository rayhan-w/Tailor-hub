import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, MapPin, Phone, Mail, CheckCircle, PhoneCall } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

interface Tailor {
  id: string;
  shop_name: string;
  description: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  rating: number | null;
  total_reviews: number | null;
  is_available: boolean | null;
  is_verified: boolean | null;
  specialties: string[] | null;
}

const TailorProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const [tailor, setTailor] = useState<Tailor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTailor = async () => {
      if (!id) return;
      
      const { data, error } = await supabase
        .from('tailors')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (!error && data) {
        setTailor(data);
      }
      setLoading(false);
    };

    fetchTailor();
  }, [id]);

  const getSpecialtyLabel = (specialty: string) => {
    const map: Record<string, string> = {
      traditional: t('traditional'),
      western_formal: t('westernFormal'),
      bridal_wedding: t('bridalWedding'),
      alterations: t('alterations'),
    };
    return map[specialty] || specialty;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-48 bg-muted rounded-lg"></div>
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!tailor) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <Card className="max-w-md w-full text-center">
            <CardContent className="py-12">
              <h2 className="text-xl font-semibold mb-2">{t('noResults')}</h2>
              <Button asChild className="mt-4">
                <Link to="/tailors">{t('findTailors')}</Link>
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
        {/* Header */}
        <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{tailor.shop_name}</h1>
                {tailor.is_verified && (
                  <Badge className="bg-green-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {t('verified')}
                  </Badge>
                )}
              </div>
              
              {tailor.city && (
                <div className="flex items-center gap-1 text-muted-foreground mb-4">
                  <MapPin className="h-4 w-4" />
                  {tailor.city}
                  {tailor.address && `, ${tailor.address}`}
                </div>
              )}

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-lg">{tailor.rating?.toFixed(1) || '0.0'}</span>
                  <span className="text-muted-foreground">({tailor.total_reviews || 0} {t('reviews')})</span>
                </div>
                <Badge variant={tailor.is_available ? 'default' : 'secondary'}>
                  {tailor.is_available ? t('available') : t('busy')}
                </Badge>
              </div>
            </div>

            <div className="flex gap-3">
              {tailor.phone && (
                <Button variant="outline" size="lg" asChild>
                  <a href={`tel:${tailor.phone}`}>
                    <PhoneCall className="h-4 w-4 mr-2" />
                    {t('callNow')}
                  </a>
                </Button>
              )}
              <Button variant="outline" size="lg" asChild>
                <Link to={`/messages/${tailor.id}`}>{t('messages')}</Link>
              </Button>
              <Button size="lg" asChild>
                <Link to={`/book/${tailor.id}`}>{t('bookNow')}</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {tailor.description && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('description')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{tailor.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Specialties */}
            {tailor.specialties && tailor.specialties.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('specialties')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {tailor.specialties.map((specialty) => (
                      <Badge key={specialty} variant="outline" className="text-sm py-1 px-3">
                        {getSpecialtyLabel(specialty)}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Portfolio Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>{t('portfolio')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                      <span className="text-muted-foreground text-sm">{t('noPortfolioYet')}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>{t('contactUs')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {tailor.phone && (
                  <a
                    href={`tel:${tailor.phone}`}
                    className="flex items-center gap-3 text-foreground hover:text-primary transition-colors"
                  >
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <span className="underline-offset-2 hover:underline">{tailor.phone}</span>
                  </a>
                )}
                {tailor.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <span>{tailor.email}</span>
                  </div>
                )}
                {tailor.city && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <span>{tailor.city}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Book */}
            <Card>
              <CardContent className="py-6">
                <Button className="w-full" size="lg" asChild>
                  <Link to={`/book/${tailor.id}`}>{t('bookNow')}</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TailorProfile;