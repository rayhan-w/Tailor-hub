import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

interface Tailor {
  id: string;
  shop_name: string;
  description: string | null;
  city: string | null;
  rating: number | null;
  total_reviews: number | null;
  is_available: boolean | null;
  is_verified: boolean | null;
  specialties: string[] | null;
}

const FeaturedTailors = () => {
  const [tailors, setTailors] = useState<Tailor[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchTailors = async () => {
      const { data, error } = await supabase
        .from('tailors')
        .select('*')
        .order('rating', { ascending: false })
        .limit(6);

      if (error) {
        console.error('Error fetching tailors:', error);
      } else {
        setTailors(data || []);
      }
      setLoading(false);
    };

    fetchTailors();
  }, []);

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
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">{t('featuredTailors')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-xl p-6 animate-pulse">
                <div className="h-40 bg-muted rounded-lg mb-4"></div>
                <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (tailors.length === 0) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">{t('featuredTailors')}</h2>
          <p className="text-muted-foreground mb-8">{t('noTailorsYet')}</p>
          <Button asChild>
            <Link to="/auth?tab=signup&role=tailor">{t('registerAsTailor')}</Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-b from-muted/40 via-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-12 gap-4 flex-wrap">
          <div>
            <span className="text-sm font-semibold tracking-widest uppercase text-accent">Top Rated</span>
            <h2 className="font-display text-3xl md:text-5xl font-bold mt-2">
              {t('featuredTailors')}
            </h2>
          </div>
          <Button variant="outline" asChild className="rounded-full border-primary/30 hover:bg-primary hover:text-primary-foreground transition-smooth">
            <Link to="/tailors">{t('viewAll')} →</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tailors.map((tailor) => (
            <div
              key={tailor.id}
              className="bg-gradient-card rounded-2xl border border-border/60 overflow-hidden hover-lift group"
            >
              {/* Image Placeholder */}
              <div className="h-44 bg-gradient-primary relative overflow-hidden">
                <div className="absolute inset-0 opacity-30" style={{
                  backgroundImage: 'radial-gradient(circle at 30% 30%, hsl(var(--accent) / 0.6), transparent 60%)',
                }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-display text-6xl text-primary-foreground/30 group-hover:scale-110 transition-bounce">
                    {tailor.shop_name?.charAt(0) || 'T'}
                  </span>
                </div>
                {tailor.is_verified && (
                  <Badge className="absolute top-3 right-3 bg-emerald-500/95 border-0 shadow-soft">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {t('verified')}
                  </Badge>
                )}
                {!tailor.is_available && (
                  <Badge variant="secondary" className="absolute top-3 left-3 backdrop-blur">
                    {t('busy')}
                  </Badge>
                )}
              </div>

              <div className="p-6">
                <h3 className="font-display font-semibold text-xl mb-2 group-hover:text-primary transition-colors">
                  {tailor.shop_name}
                </h3>

                {tailor.city && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                    <MapPin className="h-4 w-4" />
                    {tailor.city}
                  </div>
                )}

                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/15">
                    <Star className="h-4 w-4 fill-accent text-accent" />
                    <span className="font-semibold text-sm">{tailor.rating?.toFixed(1) || '0.0'}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({tailor.total_reviews || 0} {t('reviews')})
                  </span>
                </div>

                {tailor.specialties && tailor.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {tailor.specialties.slice(0, 2).map((specialty) => (
                      <Badge key={specialty} variant="outline" className="text-xs">
                        {getSpecialtyLabel(specialty)}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" asChild className="flex-1 rounded-full">
                    <Link to={`/tailor/${tailor.id}`}>{t('viewProfile')}</Link>
                  </Button>
                  <Button asChild className="flex-1 rounded-full bg-gradient-primary hover:opacity-95 shadow-soft">
                    <Link to={`/book/${tailor.id}`}>{t('bookNow')}</Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedTailors;
