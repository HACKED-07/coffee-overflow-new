import { Button } from "@/components/ui/button";
import { ArrowRight, PlayCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import heroImage from "@/assets/hero-nature.jpg";

export const HeroSection = () => {
  const { signIn } = useAuth();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-background/40" />
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 animate-leaf-fall opacity-60">
        <div className="w-4 h-4 bg-primary rounded-full" />
      </div>
      <div className="absolute top-40 right-20 animate-leaf-fall opacity-40" style={{ animationDelay: '1s' }}>
        <div className="w-3 h-3 bg-primary-glow rounded-full" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        <div className="animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
            Protect Our
            <span className="block bg-gradient-nature bg-clip-text text-transparent animate-nature-float">
              Beautiful Planet
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Join millions of eco-warriors in the fight against climate change. 
            Track your carbon footprint, discover sustainable practices, and make a real impact.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Button 
              size="lg"
              onClick={() => signIn()}
              className="bg-gradient-nature hover-glow text-lg px-8 py-6 shadow-nature"
            >
              Start Your Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button 
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 hover-lift border-primary/30 hover:bg-primary/10"
            >
              <PlayCircle className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 animate-scale-in">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">2.5M+</div>
            <div className="text-muted-foreground">Trees Planted</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">180K</div>
            <div className="text-muted-foreground">Active Members</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">95%</div>
            <div className="text-muted-foreground">CO2 Reduction</div>
          </div>
        </div>
      </div>
    </section>
  );
};