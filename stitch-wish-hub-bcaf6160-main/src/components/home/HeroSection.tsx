import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, Scissors } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import LocationInputWithMap from '@/components/location/LocationInputWithMap';
import { supabase } from '@/integrations/supabase/client';

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [stats, setStats] = useState({ tailors: 0, reviews: 0, rating: 0 });

  useEffect(() => {
    const load = async () => {
      const [{ count: tailorsCount }, { count: reviewsCount }, { data: ratingRows }] = await Promise.all([
        supabase.from('tailors').select('*', { count: 'exact', head: true }),
        supabase.from('reviews').select('*', { count: 'exact', head: true }),
        supabase.from('tailors').select('rating'),
      ]);
      const rated = (ratingRows || []).filter((r: any) => Number(r.rating) > 0);
      const avg = rated.length
        ? rated.reduce((s: number, r: any) => s + Number(r.rating), 0) / rated.length
        : 0;
      setStats({
        tailors: tailorsCount || 0,
        reviews: reviewsCount || 0,
        rating: Number(avg.toFixed(1)),
      });
    };
    load();

    const channel = supabase
      .channel('hero-stats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tailors' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, load)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const formatCount = (n: number) => {
    if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K+`;
    if (n >= 10) return `${Math.floor(n / 10) * 10}+`;
    return `${n}`;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (location) params.set('location', location);
    navigate(`/tailors?${params.toString()}`);
  };

  return (
    <section className="relative bg-gradient-hero py-24 md:py-36 overflow-hidden">
      {/* Decorative orbs */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/20 blur-3xl animate-float" />
      <div className="pointer-events-none absolute -bottom-32 -right-20 w-96 h-96 rounded-full bg-accent/25 blur-3xl animate-float" style={{ animationDelay: '2s' }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card/80 backdrop-blur border border-border shadow-soft mb-6">
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium text-foreground">Crafted with care, stitched to perfection</span>
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 leading-[1.05]">
            <span className="text-gradient-primary">{t('heroTitle')}</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            {t('heroSubtitle')}
          </p>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="glass rounded-2xl shadow-elegant p-3 md:p-4 animate-scale-in"
          >
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 h-12 border-0 bg-background/60 focus-visible:ring-2 focus-visible:ring-primary/40"
                />
              </div>
              <LocationInputWithMap
                value={location}
                onChange={setLocation}
                placeholder={t('location')}
                className="h-12"
              />
              <Button
                type="submit"
                size="lg"
                className="h-12 px-8 bg-gradient-primary hover:opacity-95 shadow-glow transition-smooth"
              >
                <Scissors className="h-4 w-4 mr-2" />
                {t('search')}
              </Button>
            </div>
          </form>

          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-10 md:gap-16 mt-14">
            {[
              { v: formatCount(stats.tailors), k: 'tailors' },
              { v: formatCount(stats.reviews), k: 'reviews' },
              { v: stats.rating ? stats.rating.toFixed(1) : '—', k: 'rating' },
            ].map((s) => (
              <div key={s.k} className="text-center">
                <div className="font-display text-4xl md:text-5xl font-bold text-gradient-warm">
                  {s.v}
                </div>
                <div className="text-sm text-muted-foreground mt-1 uppercase tracking-wider">
                  {t(s.k)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
