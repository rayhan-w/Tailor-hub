import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

const categories = [
  { key: 'traditional',   icon: '👘', tint: 'from-amber-500/15 to-rose-500/15'  },
  { key: 'westernFormal', icon: '👔', tint: 'from-indigo-500/15 to-sky-500/15'  },
  { key: 'bridalWedding', icon: '👗', tint: 'from-pink-500/15 to-fuchsia-500/15' },
  { key: 'alterations',   icon: '✂️', tint: 'from-emerald-500/15 to-teal-500/15' },
];

const CategorySection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-sm font-semibold tracking-widest uppercase text-accent">Explore</span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mt-2">
            Browse by <span className="text-gradient-primary">Category</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6">
          {categories.map((category, i) => (
            <Link
              key={category.key}
              to={`/tailors?category=${category.key}`}
              className={`group relative p-7 md:p-9 rounded-2xl bg-gradient-to-br ${category.tint} border border-border/50 bg-card hover-lift overflow-hidden`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-primary/5 blur-2xl group-hover:bg-primary/15 transition-smooth" />
              <div className="relative">
                <div className="text-5xl md:text-6xl mb-5 transition-bounce group-hover:scale-110 group-hover:-rotate-6 inline-block">
                  {category.icon}
                </div>
                <h3 className="font-display text-lg md:text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                  {t(category.key)}
                </h3>
                <div className="mt-3 h-0.5 w-8 bg-accent rounded-full group-hover:w-16 transition-smooth" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
