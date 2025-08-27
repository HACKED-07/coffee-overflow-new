import { Moon, Sun, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useNavigate, useLocation } from "react-router-dom";

export const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center space-x-2 cursor-pointer hover-lift"
            onClick={() => navigate('/')}
          >
            <Leaf className="h-8 w-8 text-primary animate-nature-float" />
            <span className="text-2xl font-bold bg-gradient-nature bg-clip-text text-transparent">
              EcoVision
            </span>
          </div>

          <div className="flex items-center space-x-6">
            {location.pathname === '/' && (
              <div className="hidden md:flex items-center space-x-6">
                <a href="#features" className="nature-link text-foreground hover:text-primary transition-nature">
                  Features
                </a>
                <a href="#about" className="nature-link text-foreground hover:text-primary transition-nature">
                  About
                </a>
                <a href="#contact" className="nature-link text-foreground hover:text-primary transition-nature">
                  Contact
                </a>
              </div>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="hover-glow"
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>

            {location.pathname === '/' && (
              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/login')}
                  className="hover-lift"
                >
                  Login
                </Button>
                <Button 
                  onClick={() => navigate('/register')}
                  className="bg-gradient-nature hover-glow"
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};