import { PlusCircle, Target, Lightbulb } from 'lucide-react';

const steps = [
  {
    icon: PlusCircle,
    step: '01',
    title: 'Add Your Trade',
    description: 'Log your intent, confidence level, and risk comfort before you trade. Takes less than 10 seconds.',
  },
  {
    icon: Target,
    step: '02',
    title: 'Trade Your Plan',
    description: 'Stay aware during the trade. Track emotions if you want — or just let the plan guide you.',
  },
  {
    icon: Lightbulb,
    step: '03',
    title: 'Learn & Improve',
    description: 'Get weekly behavioral insights. See patterns, understand triggers, and build lasting discipline.',
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-20 sm:py-28 px-4 sm:px-6 bg-muted/30">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-primary text-sm font-medium tracking-wider uppercase mb-4 block">
            Simple Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Three simple steps to better trading behavior. No complexity, no overwhelm.
          </p>
        </div>
        
        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
          {steps.map((item, index) => (
            <div 
              key={item.step}
              className="relative text-center md:text-left"
            >
              {/* Connector line for desktop */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-border to-transparent" />
              )}
              
              {/* Icon with step number */}
              <div className="relative inline-flex items-center justify-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center">
                  <item.icon className="w-7 h-7 text-primary" />
                </div>
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center">
                  {item.step}
                </span>
              </div>
              
              {/* Content */}
              <h3 className="text-xl font-medium text-foreground mb-3">
                {item.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
