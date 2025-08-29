import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, MessageCircle, Leaf, TrendingUp, Award, Users, Target, Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { PageLoading } from "@/components/ui/loading";

export const Dashboard = () => {
  const [notifications] = useState(3);
  const [showChat, setShowChat] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Get user initials for avatar fallback
  const getUserInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const stats = [
    { title: "Carbon Saved", value: "2.4 tons", icon: Leaf, color: "text-primary" },
    { title: "Eco Score", value: "850", icon: TrendingUp, color: "text-blue-500" },
    { title: "Achievements", value: "12", icon: Award, color: "text-yellow-500" },
    { title: "Community", value: "1.2k", icon: Users, color: "text-purple-500" },
  ];

  const recentActivities = [
    { action: "Planted 5 trees", points: "+50", time: "2 hours ago" },
    { action: "Used public transport", points: "+20", time: "1 day ago" },
    { action: "Recycled 10kg waste", points: "+30", time: "2 days ago" },
    { action: "Solar energy usage", points: "+40", time: "3 days ago" },
  ];

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-sky">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Leaf className="h-8 w-8 text-primary animate-nature-float" />
                <span className="text-2xl font-bold bg-gradient-nature bg-clip-text text-transparent">
                  EcoVision
                </span>
              </div>
              <Separator orientation="vertical" className="h-8" />
              <h1 className="text-xl font-semibold">Dashboard</h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <Button
                variant="ghost"
                size="icon"
                className="relative hover-glow"
              >
                <Bell className="h-5 w-5" />
                {notifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs p-0 flex items-center justify-center">
                    {notifications}
                  </Badge>
                )}
              </Button>

              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="hover-glow"
              >
                {theme === 'light' ? (
                  <span className="text-lg">🌙</span>
                ) : (
                  <span className="text-lg">☀️</span>
                )}
              </Button>

              {/* Profile */}
              <div className="flex items-center space-x-3">
                <Avatar className="hover-lift cursor-pointer">
                  <AvatarImage src={user.image || undefined} />
                  <AvatarFallback className="bg-gradient-nature text-white">
                    {getUserInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium">{user.name || user.email}</p>
                  <p className="text-xs text-muted-foreground">Eco Warrior</p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                className="hover-glow"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {user.name?.split(' ')[0] || 'Eco Warrior'}! 🌱</h2>
          <p className="text-muted-foreground">
            You've saved 2.4 tons of CO2 this month. Keep up the great work!
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="hover-lift shadow-nature">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <Icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Goals Card */}
          <Card className="hover-lift shadow-earth">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-primary" />
                <span>Monthly Goals</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Carbon Reduction</span>
                  <span>2.4 / 3.0 tons</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-gradient-nature h-2 rounded-full transition-all duration-500" style={{ width: '80%' }} />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Trees Planted</span>
                  <span>15 / 20</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-gradient-earth h-2 rounded-full transition-all duration-500" style={{ width: '75%' }} />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Eco Actions</span>
                  <span>28 / 30</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-gradient-ocean h-2 rounded-full transition-all duration-500" style={{ width: '93%' }} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card className="hover-lift shadow-earth">
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      {activity.points}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Floating Chatbot */}
      <Button
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-nature hover-glow shadow-glow"
        size="icon"
        onClick={() => setShowChat(!showChat)}
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Chat Window */}
      {showChat && (
        <Card className="fixed bottom-24 right-6 w-80 h-96 shadow-earth animate-slide-in-right">
          <CardHeader className="bg-gradient-nature text-white rounded-t-lg">
            <CardTitle className="text-lg">EcoAssistant</CardTitle>
          </CardHeader>
          <CardContent className="p-4 h-full">
            <div className="h-full flex flex-col">
              <div className="flex-1 space-y-3 overflow-y-auto mb-4">
                <div className="bg-muted p-3 rounded-lg text-sm">
                  Hello! I'm your EcoAssistant. How can I help you reduce your carbon footprint today?
                </div>
                <div className="bg-primary/10 p-3 rounded-lg text-sm ml-8">
                  What's the best way to save energy at home?
                </div>
                <div className="bg-muted p-3 rounded-lg text-sm">
                  Great question! Here are some tips: Use LED bulbs, unplug devices when not in use, and consider a smart thermostat.
                </div>
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border rounded-lg text-sm"
                />
                <Button size="sm" className="bg-gradient-nature">
                  Send
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;