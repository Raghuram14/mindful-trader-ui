import { Quote } from 'lucide-react';

const testimonials = [
  {
    quote: "I finally understand why I was exiting trades early. It wasn't the market — it was me. Now I have the awareness to change.",
    author: "Raj M.",
    role: "Day Trader, 3 years",
  },
  {
    quote: "The risk comfort feature changed everything. Knowing my limit upfront keeps me calm during volatile moves.",
    author: "Priya S.",
    role: "Swing Trader",
  },
  {
    quote: "No noise, no signals, no hype. Just honest reflection on my decisions. Exactly what I needed.",
    author: "Amit K.",
    role: "Options Trader",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground mb-4">
            What Traders Are Saying
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real feedback from traders focused on self-improvement.
          </p>
        </div>
        
        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((item, index) => (
            <div 
              key={index}
              className="relative p-6 sm:p-8 rounded-2xl bg-card border border-border"
            >
              {/* Quote Icon */}
              <Quote className="w-8 h-8 text-primary/30 mb-4" />
              
              {/* Quote Text */}
              <p className="text-foreground leading-relaxed mb-6">
                "{item.quote}"
              </p>
              
              {/* Author */}
              <div className="pt-4 border-t border-border">
                <p className="font-medium text-foreground">{item.author}</p>
                <p className="text-sm text-muted-foreground">{item.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
