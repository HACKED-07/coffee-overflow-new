import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, Users, BarChart3, Shield, Zap, Globe } from "lucide-react";

export const FeaturesSection = () => {
  const features = [
    {
      icon: Leaf,
      title: "Carbon Tracking",
      description: "Monitor your daily carbon footprint with precision and get personalized recommendations for reduction.",
      gradient: "bg-gradient-nature"
    },
    {
      icon: Users,
      title: "Community Impact",
      description: "Connect with eco-warriors worldwide and participate in global environmental initiatives.",
      gradient: "bg-gradient-earth"
    },
    {
      icon: BarChart3,
      title: "Smart Analytics",
      description: "Advanced AI-powered insights help you understand and optimize your environmental impact.",
      gradient: "bg-gradient-ocean"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your environmental data is protected with enterprise-grade security and privacy controls.",
      gradient: "bg-gradient-forest"
    },
    {
      icon: Zap,
      title: "Real-time Updates",
      description: "Get instant notifications about your eco-achievements and environmental news that matters.",
      gradient: "bg-gradient-nature"
    },
    {
      icon: Globe,
      title: "Global Network",
      description: "Be part of a worldwide movement making measurable impact on climate change.",
      gradient: "bg-gradient-earth"
    }
  ];

  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Powerful Features for
            <span className="block bg-gradient-nature bg-clip-text text-transparent">
              Environmental Impact
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to track, improve, and maximize your positive impact on the environment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="hover-lift shadow-nature transition-nature group">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${feature.gradient} flex items-center justify-center mb-4 group-hover:shadow-glow transition-nature`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};