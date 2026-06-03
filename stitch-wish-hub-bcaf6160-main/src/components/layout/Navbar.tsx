import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Scissors, Globe, User, LogOut, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { user, signOut, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getDashboardPath = () => {
    if (hasRole('admin')) return '/admin';
    if (hasRole('tailor')) return '/tailor/dashboard';
    return '/customer/dashboard';
  };

  return (
    <nav className="glass border-b border-border/60 sticky top-0 z-50 shadow-soft">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-soft group-hover:shadow-glow transition-smooth">
              <Scissors className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-gradient-primary">TailorHub</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-foreground/80 hover:text-primary transition-colors">
              {t('home')}
            </Link>
            <Link to="/tailors" className="text-foreground/80 hover:text-primary transition-colors">
              {t('tailors')}
            </Link>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
              className="text-foreground/80 hover:text-primary"
            >
              <Globe className="h-5 w-5" />
              <span className="ml-1 text-sm">{language.toUpperCase()}</span>
            </Button>

            {user ? (
              <>
                {/* Notifications */}
                <Button variant="ghost" size="icon" asChild>
                  <Link to="/notifications">
                    <Bell className="h-5 w-5" />
                  </Link>
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link to={getDashboardPath()} className="w-full">
                        {t('dashboard')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="w-full">
                        {t('profile')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/messages" className="w-full">
                        {t('messages')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                      <LogOut className="h-4 w-4 mr-2" />
                      {t('logout')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/auth">{t('login')}</Link>
                </Button>
                <Button asChild>
                  <Link to="/auth?tab=signup">{t('signup')}</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              <Link
                to="/"
                className="text-foreground/80 hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {t('home')}
              </Link>
              <Link
                to="/tailors"
                className="text-foreground/80 hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {t('tailors')}
              </Link>
              
              <div className="flex items-center gap-2 pt-4 border-t border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
                >
                  <Globe className="h-4 w-4 mr-1" />
                  {language === 'en' ? 'বাংলা' : 'English'}
                </Button>
              </div>

              {user ? (
                <div className="flex flex-col gap-2 pt-4 border-t border-border">
                  <Link
                    to={getDashboardPath()}
                    className="text-foreground/80 hover:text-primary"
                    onClick={() => setIsOpen(false)}
                  >
                    {t('dashboard')}
                  </Link>
                  <Link
                    to="/profile"
                    className="text-foreground/80 hover:text-primary"
                    onClick={() => setIsOpen(false)}
                  >
                    {t('profile')}
                  </Link>
                  <Button
                    variant="ghost"
                    className="justify-start text-destructive"
                    onClick={() => {
                      handleSignOut();
                      setIsOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {t('logout')}
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2 pt-4 border-t border-border">
                  <Button variant="outline" asChild className="flex-1">
                    <Link to="/auth" onClick={() => setIsOpen(false)}>{t('login')}</Link>
                  </Button>
                  <Button asChild className="flex-1">
                    <Link to="/auth?tab=signup" onClick={() => setIsOpen(false)}>{t('signup')}</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
