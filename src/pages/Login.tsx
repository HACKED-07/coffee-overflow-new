import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Github, Chrome, Camera, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";

export const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate login
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      navigate('/dashboard');
    }, 2000);
  };

  const handleSocialLogin = (provider: string) => {
    toast({
      title: `${provider} Login`,
      description: `Redirecting to ${provider} authentication...`,
    });
    // Simulate social login
    setTimeout(() => navigate('/dashboard'), 1500);
  };

  const handleFaceRecognition = () => {
    toast({
      title: "Face Recognition",
      description: "Initializing camera for face recognition...",
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
              Welcome Back
              <div className="text-sm text-muted-foreground font-normal mt-2">
                Sign in to your EcoVision account
              </div>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Social Login Options */}
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full hover-lift"
                onClick={() => handleSocialLogin('Google')}
              >
                <Chrome className="h-4 w-4 mr-2" />
                Continue with Google
              </Button>
              
              <Button
                variant="outline"
                className="w-full hover-lift"
                onClick={() => handleSocialLogin('GitHub')}
              >
                <Github className="h-4 w-4 mr-2" />
                Continue with GitHub
              </Button>
              
              <Button
                variant="outline"
                className="w-full hover-lift border-primary/30"
                onClick={handleFaceRecognition}
              >
                <Camera className="h-4 w-4 mr-2" />
                Face Recognition Login
              </Button>
            </div>

            <div className="relative">
              <Separator />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-card px-4 text-sm text-muted-foreground">
                  or continue with email
                </span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="transition-nature"
                />
              </div>
              
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-border" />
                  <span>Remember me</span>
                </label>
                <Button variant="link" className="p-0 h-auto nature-link">
                  Forgot password?
                </Button>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-nature hover-glow"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="text-center text-sm">
              Don't have an account?{" "}
              <Button
                variant="link"
                className="p-0 h-auto nature-link"
                onClick={() => navigate('/register')}
              >
                Sign up here
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;