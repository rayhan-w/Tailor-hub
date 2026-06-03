import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, CheckCircle } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type GarmentType = Database['public']['Enums']['garment_type'];

interface Tailor {
  id: string;
  shop_name: string;
  city: string | null;
}

const BookTailor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [tailor, setTailor] = useState<Tailor | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    garmentName: '',
    garmentType: 'traditional' as GarmentType,
    description: '',
  });

  const garmentTypes: { id: GarmentType; label: string }[] = [
    { id: 'traditional', label: t('traditional') },
    { id: 'western_formal', label: t('westernFormal') },
    { id: 'bridal_wedding', label: t('bridalWedding') },
    { id: 'alterations', label: t('alterations') },
  ];

  useEffect(() => {
    const fetchTailor = async () => {
      if (!id) return;
      
      const { data } = await supabase
        .from('tailors')
        .select('id, shop_name, city')
        .eq('id', id)
        .maybeSingle();

      if (data) {
        setTailor(data);
      }
      setLoading(false);
    };

    fetchTailor();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Error',
        description: t('login'),
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    if (!tailor || !formData.garmentName.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.from('orders').insert({
      customer_id: user.id,
      tailor_id: tailor.id,
      garment_name: formData.garmentName,
      garment_type: formData.garmentType,
      description: formData.description || null,
      status: 'pending',
    });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to place order',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success!',
        description: t('placeOrder'),
      });
      navigate('/customer/dashboard');
    }

    setIsSubmitting(false);
  };

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

  if (!tailor) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <Card className="max-w-md w-full text-center">
            <CardContent className="py-12">
              <h2 className="text-xl font-semibold mb-2">{t('noResults')}</h2>
              <Button asChild className="mt-4">
                <a href="/tailors">{t('findTailors')}</a>
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
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('cancel')}
          </Button>

          {/* Tailor Info */}
          <Card className="mb-6">
            <CardContent className="flex items-center gap-4 py-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">{tailor.shop_name}</h2>
                {tailor.city && <p className="text-muted-foreground">{tailor.city}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Order Form */}
          <Card>
            <CardHeader>
              <CardTitle>{t('placeOrder')}</CardTitle>
              <CardDescription>{t('placeOrderDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Garment Name */}
                <div className="space-y-2">
                  <Label htmlFor="garmentName">Garment Name *</Label>
                  <Input
                    id="garmentName"
                    placeholder="e.g., Shirt, Panjabi, Saree Blouse"
                    value={formData.garmentName}
                    onChange={(e) => setFormData({ ...formData, garmentName: e.target.value })}
                    required
                  />
                </div>

                {/* Garment Type */}
                <div className="space-y-3">
                  <Label>Garment Type *</Label>
                  <RadioGroup
                    value={formData.garmentType}
                    onValueChange={(value) => setFormData({ ...formData, garmentType: value as GarmentType })}
                    className="grid grid-cols-2 gap-3"
                  >
                    {garmentTypes.map((type) => (
                      <div key={type.id} className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50">
                        <RadioGroupItem value={type.id} id={type.id} />
                        <Label htmlFor={type.id} className="cursor-pointer flex-1">
                          {type.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">{t('description')}</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your requirements, fabric preferences, design details..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                  />
                </div>

                {/* Design Upload Placeholder */}
                <div className="space-y-2">
                  <Label>Design Images (Optional)</Label>
                  <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/50 cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">Click to upload design images</p>
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? t('loading') : t('placeOrder')}
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

export default BookTailor;