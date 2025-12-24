import { Button } from '@/components/ui/button';
import { ArrowRight, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center px-4 sm:px-6 overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/50 border border-border mb-8 animate-fade-in">
          <Brain className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground">Behavioral Intelligence for Traders</span>
        </div>
        
        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground mb-6 leading-tight animate-fade-in" style={{ animationDelay: '0.1s' }}>
          Build Better Trading Discipline
          <span className="block text-primary mt-2">With Behavioral Intelligence</span>
        </h1>
        
        {/* Sub-headline */}
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
          Understand your decision patterns, pre-commit to risk comfort, and trade with clarity — without relying on signals.
        </p>
        
        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <Button asChild size="lg" className="w-full sm:w-auto text-base px-8 py-6 glow-primary">
            <Link to="/auth">
              Get Started
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto text-base px-8 py-6 border-border hover:bg-accent">
            <a href="#how-it-works">
              Learn More
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
