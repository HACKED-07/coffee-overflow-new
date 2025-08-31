import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useEthereum } from "@/contexts/EthereumContext";
import { 
  Factory, 
  Shield, 
  ShoppingCart, 
  Eye, 
  User,
  Lock,
  ArrowRight,
  Wallet
} from "lucide-react";

interface LoginProps {
  onLogin: (role: string, credentials: any) => void;
}

interface RoleConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  credentials: {
    username: string;
    password: string;
    walletAddress: string;
  };
}

const ROLES: RoleConfig[] = [
  {
    id: 'producer',
    name: 'Producer',
    description: 'Green hydrogen producers who generate and submit credit applications',
    icon: <Factory className="h-8 w-8" />,
    color: 'bg-green-500',
    credentials: {
      username: 'producer1',
      password: 'producer123',
      walletAddress: '0x1234567890123456789012345678901234567890'
    }
  },
  {
    id: 'validator',
    name: 'Validator',
    description: 'Regulatory authorities who review and approve credit applications',
    icon: <Shield className="h-8 w-8" />,
    color: 'bg-blue-500',
    credentials: {
      username: 'validator1',
      password: 'validator123',
      walletAddress: '0x2345678901234567890123456789012345678901'
    }
  },
  {
    id: 'buyer',
    name: 'Buyer',
    description: 'Industry buyers who purchase green hydrogen credits',
    icon: <ShoppingCart className="h-8 w-8" />,
    color: 'bg-purple-500',
    credentials: {
      username: 'buyer1',
      password: 'buyer123',
      walletAddress: '0x3456789012345678901234567890123456789012'
    }
  },
  {
    id: 'auditor',
    name: 'Auditor',
    description: 'Compliance auditors who monitor and report on system activities',
    icon: <Eye className="h-8 w-8" />,
    color: 'bg-orange-500',
    credentials: {
      username: 'auditor1',
      password: 'auditor123',
      walletAddress: '0x4567890123456789012345678901234567890123'
    }
  }
];

export default function Login({ onLogin }: LoginProps) {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { isConnected, connect, account, network } = useEthereum();

  const handleRoleSelect = (role: RoleConfig) => {
    setSelectedRole(role.id);
    setUsername(role.credentials.username);
    setPassword(role.credentials.password);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRole) {
      toast({
        title: "Role Not Selected",
        description: "Please select a role to continue",
        variant: "destructive"
      });
      return;
    }

    if (!username || !password) {
      toast({
        title: "Missing Credentials",
        description: "Please enter both username and password",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Simulate authentication delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const role = ROLES.find(r => r.id === selectedRole);
      if (!role) {
        throw new Error('Invalid role selected');
      }

      // Validate credentials
      if (username === role.credentials.username && password === role.credentials.password) {
        toast({
          title: "Login Successful",
          description: `Welcome, ${role.name}!`,
        });

        // Pass role and credentials to parent component
        onLogin(selectedRole, {
          ...role.credentials,
          role: selectedRole,
          roleName: role.name
        });
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Authentication failed",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (role: RoleConfig) => {
    setSelectedRole(role.id);
    setUsername(role.credentials.username);
    setPassword(role.credentials.password);
    
    // Auto-login after a short delay
    setTimeout(() => {
      onLogin(role.id, {
        ...role.credentials,
        role: role.id,
        roleName: role.name
      });
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Terra Spark Net
          </h1>
          <p className="text-xl text-gray-600">
            Green Hydrogen Credit Management System
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Role Selection */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Select Your Role
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ROLES.map((role) => (
                <Card 
                  key={role.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    selectedRole === role.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handleRoleSelect(role)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${role.color} text-white`}>
                        {role.icon}
                      </div>
                                       <div className="flex-1">
                   <h3 className="font-semibold text-gray-800">{role.name}</h3>
                   <p className="text-sm text-gray-600">{role.description}</p>
                   {(role.id === 'validator' || role.id === 'buyer') && (
                     <p className="text-xs text-blue-600 mt-1">
                       ⚡ Requires wallet connection for blockchain transactions
                     </p>
                   )}
                 </div>
                    </div>
                    
                    {/* Quick Login Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickLogin(role);
                      }}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Quick Login
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Login Form */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="h-5 w-5" />
                <span>Login</span>
                {selectedRole && (
                  <Badge variant="secondary" className="ml-2">
                    {ROLES.find(r => r.id === selectedRole)?.name}
                  </Badge>
                )}
              </CardTitle>
              <p className="text-sm text-gray-600">
                {selectedRole 
                  ? `Sign in as ${ROLES.find(r => r.id === selectedRole)?.name}`
                  : 'Select a role to continue'
                }
              </p>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    disabled={!selectedRole}
                  />
                </div>
                
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    disabled={!selectedRole}
                  />
                </div>

                {selectedRole && (
                  <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                    <strong>Demo Credentials:</strong><br />
                    Username: {ROLES.find(r => r.id === selectedRole)?.credentials.username}<br />
                    Password: {ROLES.find(r => r.id === selectedRole)?.credentials.password}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={!selectedRole || isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Logging in...
                    </>
                  ) : (
                    <>
                      Login
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>This is a demonstration system. All data is for testing purposes only.</p>
        </div>

        {/* Wallet Connection Info */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-2 p-4 bg-gray-50 rounded-lg">
            <Wallet className="h-5 w-5 text-gray-600" />
            <span className="text-gray-600">
              {isConnected ? (
                <>
                  Wallet Connected: {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'MetaMask'}
                  {network && ` • Network: ${network.name}`}
                </>
              ) : (
                <>
                  Connect MetaMask to interact with the blockchain
                  <Button 
                    onClick={connect} 
                    variant="link" 
                    className="ml-2 text-blue-600 hover:text-blue-700 p-0 h-auto"
                  >
                    Connect Now
                  </Button>
                </>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
