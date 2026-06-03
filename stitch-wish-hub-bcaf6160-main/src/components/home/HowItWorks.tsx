import { Search, Ruler, ShoppingBag, Star } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const HowItWorks = () => {
  const { t } = useLanguage();

  const steps = [
    {
      icon: Search,
      titleKey: 'findTailor',
      descKey: 'findTailorDesc',
    },
    {
      icon: Ruler,
      titleKey: 'shareMeasurements',
      descKey: 'shareMeasurementsDesc',
    },
    {
      icon: ShoppingBag,
      titleKey: 'placeOrder',
      descKey: 'placeOrderDesc',
    },
    {
      icon: Star,
      titleKey: 'rateReview',
      descKey: 'rateReviewDesc',
    },
  ];

  return (
    <section className="py-20 bg-background relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--accent)/0.06),transparent_60%)]" />
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-14">
          <span className="text-sm font-semibold tracking-widest uppercase text-accent">Process</span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mt-2">
            {t('howItWorks')}
          </h2>
          <p className="text-muted-foreground text-base md:text-lg mt-4 max-w-2xl mx-auto">
            {t('howItWorksSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((step, index) => (
            <div key={index} className="text-center group relative">
              <div className="relative mb-6">
                <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-primary flex items-center justify-center shadow-elegant group-hover:scale-110 group-hover:rotate-3 transition-bounce">
                  <step.icon className="h-10 w-10 text-primary-foreground" />
                </div>
                <div className="absolute -top-2 -right-2 md:right-[calc(50%-3rem)] md:-translate-x-1/2 md:translate-x-12 w-8 h-8 rounded-full bg-accent text-accent-foreground font-display font-bold flex items-center justify-center shadow-gold">
                  {index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-[62%] w-[calc(100%-30px)] h-0.5 bg-gradient-to-r from-accent/60 to-transparent" />
                )}
              </div>
              <h3 className="font-display font-semibold text-xl mb-2">
                {t(step.titleKey)}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {t(step.descKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
