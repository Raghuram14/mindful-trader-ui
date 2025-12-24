import { Shield, TrendingUp, MessageSquare, Eye } from 'lucide-react';

const differentiators = [
  {
    icon: Shield,
    title: 'Pre-Commit to Risk Comfort',
    description: 'Define what you can comfortably lose before entering a trade. Reduce emotional exits by knowing your limits upfront.',
  },
  {
    icon: TrendingUp,
    title: 'Behavior Pattern Insights',
    description: 'Discover when you exit early, overtrade, or break your plan. See your patterns clearly — no judgment, just awareness.',
  },
  {
    icon: MessageSquare,
    title: 'Weekly Coaching Nudges',
    description: 'Receive calm, actionable insights each week. Small adjustments that compound into lasting behavioral change.',
  },
  {
    icon: Eye,
    title: 'Calm, Focused Design',
    description: 'A minimal interface designed for clarity. No noise, no distractions — just you and your trading decisions.',
  },
];

const DifferentiatorsSection = () => {
  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground mb-4">
            Why Traders Choose MindfulTrade
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tools that help you understand yourself — not predict the market.
          </p>
        </div>
        
        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {differentiators.map((item, index) => (
            <div 
              key={item.title}
              className="group relative p-6 sm:p-8 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors duration-300">
                <item.icon className="w-6 h-6 text-primary" />
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

export default DifferentiatorsSection;
