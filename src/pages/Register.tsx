import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Github, Chrome, Camera, ArrowLeft, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";

export const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    // Simulate registration
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Welcome to EcoVision!",
        description: "Your account has been created successfully.",
      });
      navigate('/dashboard');
    }, 2000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSocialRegister = (provider: string) => {
    toast({
      title: `${provider} Registration`,
      description: `Redirecting to ${provider} authentication...`,
    });
    setTimeout(() => navigate('/dashboard'), 1500);
  };

  const handleFaceRecognition = () => {
    toast({
      title: "Face Recognition Setup",
      description: "Initializing camera for face recognition setup...",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-sky">
      <Navbar />
      
      <div className="pt-24 pb-12 flex items-center justify-center px-6">
        <Card className="w-full max-w-md shadow-earth hover-lift">
          <CardHeader className="space-y-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="self-start"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            
            <CardTitle className="text-2xl text-center">
              Join EcoVision
              <div className="text-sm text-muted-foreground font-normal mt-2">
                Create your account and start making a difference
              </div>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Social Registration Options */}
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full hover-lift"
                onClick={() => handleSocialRegister('Google')}
              >
                <Chrome className="h-4 w-4 mr-2" />
                Sign up with Google
              </Button>
              
              <Button
                variant="outline"
                className="w-full hover-lift"
                onClick={() => handleSocialRegister('GitHub')}
              >
                <Github className="h-4 w-4 mr-2" />
                Sign up with GitHub
              </Button>
              
              <Button
                variant="outline"
                className="w-full hover-lift border-primary/30"
                onClick={handleFaceRecognition}
              >
                <Camera className="h-4 w-4 mr-2" />
                Set up Face Recognition
              </Button>
            </div>

            <div className="relative">
              <Separator />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-card px-4 text-sm text-muted-foreground">
                  or create account with email
                </span>
              </div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  name="name"
                  placeholder="Full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="pl-10 transition-nature"
                />
              </div>
              
              <div>
                <Input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="transition-nature"
                />
              </div>
              
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Create password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="pr-10 transition-nature"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <div>
                <Input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="transition-nature"
                />
              </div>

              <div className="text-sm">
                <label className="flex items-start space-x-2 cursor-pointer">
                  <input type="checkbox" className="mt-0.5 rounded border-border" required />
                  <span>
                    I agree to the{" "}
                    <Button variant="link" className="p-0 h-auto nature-link text-sm">
                      Terms of Service
                    </Button>
                    {" "}and{" "}
                    <Button variant="link" className="p-0 h-auto nature-link text-sm">
                      Privacy Policy
                    </Button>
                  </span>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-nature hover-glow"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>

            <div className="text-center text-sm">
              Already have an account?{" "}
              <Button
                variant="link"
                className="p-0 h-auto nature-link"
                onClick={() => navigate('/login')}
              >
                Sign in here
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;