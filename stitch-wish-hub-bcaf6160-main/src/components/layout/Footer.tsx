import { Link } from 'react-router-dom';
import { Scissors, Facebook, Instagram, Twitter } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/50 border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <Scissors className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">TailorHub</span>
            </Link>
            <p className="text-muted-foreground text-sm">
              Connecting you with skilled tailors for custom clothing that fits perfectly.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">{t('home')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/tailors" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('tailors')}
                </Link>
              </li>
              <li>
                <Link to="/tailors?category=traditional" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('traditional')}
                </Link>
              </li>
              <li>
                <Link to="/tailors?category=bridal" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('bridalWedding')}
                </Link>
              </li>
            </ul>
          </div>

          {/* For Tailors */}
          <div>
            <h3 className="font-semibold mb-4">For Tailors</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/auth?tab=signup&role=tailor" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('registerAsTailor')}
                </Link>
              </li>
              <li>
                <Link to="/tailor/dashboard" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('dashboard')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('aboutUs')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('contactUs')}
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('privacyPolicy')}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('termsOfService')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© {currentYear} TailorHub. {t('allRightsReserved')}.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
