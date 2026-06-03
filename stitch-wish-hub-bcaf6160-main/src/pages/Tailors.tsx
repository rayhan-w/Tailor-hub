import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, MapPin, Filter, Star, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import LocationInputWithMap from '@/components/location/LocationInputWithMap';

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

type SortOption = 'rating' | 'reviews' | 'name';

const Tailors = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();

  const [tailors, setTailors] = useState<Tailor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [locationQuery, setLocationQuery] = useState(searchParams.get('location') || '');
  const [sortBy, setSortBy] = useState<SortOption>('rating');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get('category')?.split(',').filter(Boolean) || []
  );
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  const categories = [
    { key: 'traditional', label: t('traditional') },
    { key: 'western_formal', label: t('westernFormal') },
    { key: 'bridal_wedding', label: t('bridalWedding') },
    { key: 'alterations', label: t('alterations') },
  ];

  useEffect(() => {
    const fetchTailors = async () => {
      setLoading(true);

      let query = supabase.from('tailors').select('*');

      // Apply search filter
      if (searchQuery) {
        query = query.or(`shop_name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      // Apply location filter
      if (locationQuery) {
        query = query.ilike('city', `%${locationQuery}%`);
      }

      // Apply availability filter
      if (showAvailableOnly) {
        query = query.eq('is_available', true);
      }

      // Apply specialty filter
      if (selectedCategories.length > 0) {
        query = query.overlaps('specialties', selectedCategories);
      }

      // Apply sorting
      switch (sortBy) {
        case 'rating':
          query = query.order('rating', { ascending: false });
          break;
        case 'reviews':
          query = query.order('total_reviews', { ascending: false });
          break;
        case 'name':
          query = query.order('shop_name', { ascending: true });
          break;
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching tailors:', error);
      } else {
        setTailors(data || []);
      }

      setLoading(false);
    };

    fetchTailors();
  }, [searchQuery, locationQuery, sortBy, selectedCategories, showAvailableOnly]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (locationQuery) params.set('location', locationQuery);
    if (selectedCategories.length > 0) params.set('category', selectedCategories.join(','));
    setSearchParams(params);
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const getSpecialtyLabel = (specialty: string) => {
    const map: Record<string, string> = {
      traditional: t('traditional'),
      western_formal: t('westernFormal'),
      bridal_wedding: t('bridalWedding'),
      alterations: t('alterations'),
    };
    return map[specialty] || specialty;
  };

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">{t('specialties')}</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category.key} className="flex items-center space-x-2">
              <Checkbox
                id={category.key}
                checked={selectedCategories.includes(category.key)}
                onCheckedChange={() => toggleCategory(category.key)}
              />
              <Label htmlFor={category.key} className="cursor-pointer">
                {category.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Availability</h3>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="available"
            checked={showAvailableOnly}
            onCheckedChange={(checked) => setShowAvailableOnly(checked as boolean)}
          />
          <Label htmlFor="available" className="cursor-pointer">
            Show available only
          </Label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="bg-card rounded-xl p-4 mb-8 border border-border shadow-sm">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex-1">
                <LocationInputWithMap
                  value={locationQuery}
                  onChange={setLocationQuery}
                  placeholder={t('location')}
                />
              </div>
              <Button type="submit">
                {t('search')}
              </Button>
            </div>
          </form>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Desktop Filters */}
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="bg-card rounded-xl p-6 border border-border sticky top-24">
                <h2 className="font-semibold text-lg mb-4">{t('filter')}</h2>
                <FilterContent />
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">
                  {t('tailors')} {tailors.length > 0 && `(${tailors.length})`}
                </h1>

                <div className="flex items-center gap-4">
                  {/* Mobile Filter */}
                  <Sheet>
                    <SheetTrigger asChild className="lg:hidden">
                      <Button variant="outline" size="icon">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left">
                      <SheetHeader>
                        <SheetTitle>{t('filter')}</SheetTitle>
                      </SheetHeader>
                      <div className="mt-6">
                        <FilterContent />
                      </div>
                    </SheetContent>
                  </Sheet>

                  {/* Sort */}
                  <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder={t('sortBy')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rating">{t('topRated')}</SelectItem>
                      <SelectItem value="reviews">Most Reviews</SelectItem>
                      <SelectItem value="name">Name (A-Z)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Results */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-card rounded-xl p-6 animate-pulse border border-border">
                      <div className="h-40 bg-muted rounded-lg mb-4"></div>
                      <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : tailors.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">{t('noResults')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {tailors.map((tailor) => (
                    <div
                      key={tailor.id}
                      className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow group"
                    >
                      <div className="h-40 bg-gradient-to-br from-primary/20 to-secondary/20 relative">
                        {tailor.is_verified && (
                          <Badge className="absolute top-3 right-3 bg-green-500">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                        {!tailor.is_available && (
                          <Badge variant="secondary" className="absolute top-3 left-3">
                            {t('busy')}
                          </Badge>
                        )}
                      </div>

                      <div className="p-5">
                        <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                          {tailor.shop_name}
                        </h3>

                        {tailor.city && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                            <MapPin className="h-4 w-4" />
                            {tailor.city}
                          </div>
                        )}

                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{tailor.rating?.toFixed(1) || '0.0'}</span>
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
                          <Button variant="outline" asChild className="flex-1">
                            <Link to={`/tailor/${tailor.id}`}>{t('viewProfile')}</Link>
                          </Button>
                          <Button asChild className="flex-1">
                            <Link to={`/book/${tailor.id}`}>{t('bookNow')}</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Tailors;
