import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import CategorySection from '@/components/home/CategorySection';
import FeaturedTailors from '@/components/home/FeaturedTailors';
import HowItWorks from '@/components/home/HowItWorks';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <CategorySection />
        <FeaturedTailors />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
