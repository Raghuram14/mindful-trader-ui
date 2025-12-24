import { Button } from '@/components/ui/button';
import { ArrowRight, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';

const FooterCTA = () => {
  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* CTA Card */}
        <div className="relative rounded-3xl bg-gradient-to-br from-accent via-card to-card border border-border p-8 sm:p-12 lg:p-16 text-center overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10">
            <Brain className="w-12 h-12 text-primary mx-auto mb-6" />
            
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground mb-4">
              Start Building Better Discipline Today
            </h2>
            
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
              Join traders who are focused on understanding themselves, not chasing signals.
            </p>
            
            <Button asChild size="lg" className="text-base px-10 py-6 glow-primary">
              <Link to="/auth">
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Footer Links */}
        <div className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            <span className="font-medium text-foreground">MindfulTrade</span>
          </div>
          
          <p>© {new Date().getFullYear()} MindfulTrade. Behavior-first trading intelligence.</p>
        </div>
      </div>
    </section>
  );
};

export default FooterCTA;
