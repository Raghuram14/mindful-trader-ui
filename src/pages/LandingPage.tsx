import HeroSection from '@/components/landing/HeroSection';
import DifferentiatorsSection from '@/components/landing/DifferentiatorsSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import FooterCTA from '@/components/landing/FooterCTA';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <DifferentiatorsSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <FooterCTA />
    </div>
  );
};

export default LandingPage;
