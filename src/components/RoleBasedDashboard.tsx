import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useEthereum } from "@/contexts/EthereumContext";
import { ApiService } from "@/services/api";
import { 
  LogOut, 
  User, 
  Wallet,
  Settings,
  Bell
} from "lucide-react";

// Import existing dashboard components
import ProducerDashboard from './ProducerDashboard';
import ValidatorDashboard from './ValidatorDashboard';
import BuyerDashboard from './BuyerDashboard';
import AuditorDashboard from './AuditorDashboard';

interface UserCredentials {
  username: string;
  password: string;
  walletAddress: string;
  role: string;
  roleName: string;
}

interface RoleBasedDashboardProps {
  userCredentials: UserCredentials;
  onLogout: () => void;
}

interface Credit {
  id: string;
  creditType?: string;
  amount: number;
  productionDate: string;
  producerId: string;
  facilityId: string;
  renewableSource: string;
  isValidated: boolean;
  validatedBy?: string;
  validatedAt?: string;
  isRetired: boolean;
  ownerId: string;
  price: number;
  status: 'pending' | 'validated' | 'issued' | 'retired';
  createdAt?: string;
  description?: string;
  supportingDocuments?: string;
  blockchainId?: number;
}

interface Facility {
  id: string;
  name: string;
  location: string;
  renewableSource: string;
  capacity: number;
  producerId: string;
  isActive: boolean;
  certificationStatus: 'pending' | 'certified' | 'suspended';
}

export default function RoleBasedDashboard({ userCredentials, onLogout }: RoleBasedDashboardProps) {
  const [credits, setCredits] = useState<Credit[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isDataReady, setIsDataReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [complianceData, setComplianceData] = useState<any>(null);

  const { toast } = useToast();
  const { isConnected, account, network, connect } = useEthereum();

  // Fetch data from API
  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching data from API...');
      
      // Fetch all necessary data
      const [dbCredits, dbFacilities] = await Promise.all([
        ApiService.getAllCredits(),
        ApiService.getAllFacilities(),
      ]);
      
      console.log('📊 Fetched data:', {
        credits: dbCredits.length,
        facilities: dbFacilities.length,
      });
      
      setCredits(dbCredits || []);
      setFacilities(dbFacilities || []);
      
      setIsDataReady(true);
      console.log('Data loaded successfully');
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast({
        title: "Data Loading Error",
        description: "Failed to load system data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    fetchData();
  };

  const handleTransaction = (transaction: any) => {
    setTransactions(prev => [transaction, ...prev]);
  };

  const renderDashboard = () => {
    if (!isDataReady) {
      return (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      );
    }

    switch (userCredentials.role) {
      case 'producer':
        return (
          <ProducerDashboard
            credits={credits.filter(c => c.producerId === userCredentials.username)}
            facilities={facilities.filter(f => f.producerId === userCredentials.username)}
            producerId={userCredentials.username}
            onCreditsUpdate={setCredits}
            onRefresh={handleRefresh}
            onTransaction={handleTransaction}
          />
        );
      
      case 'validator':
        return (
          <ValidatorDashboard
            credits={credits}
            onRefresh={handleRefresh}
            onTransaction={handleTransaction}
          />
        );
      
      case 'buyer':
        return (
          <BuyerDashboard
            credits={credits}
            buyerId={userCredentials.username}
            onRefresh={handleRefresh}
            onTransaction={handleTransaction}
          />
        );
      
      case 'auditor':
        return (
          <AuditorDashboard
            credits={credits}
            facilities={facilities}
            transactions={transactions}
            complianceData={complianceData}
            onRefresh={handleRefresh}
          />
        );
      
      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-600">Unknown role: {userCredentials.role}</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900">
                  Terra Spark Net
                </h1>
              </div>
              <div className="hidden md:block">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="capitalize">
                    {userCredentials.role}
                  </Badge>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-600">{userCredentials.roleName}</span>
                </div>
              </div>
            </div>

            {/* Right side - User info and actions */}
            <div className="flex items-center space-x-4">
              {/* Wallet Connection */}
              {!isConnected ? (
                <Button 
                  onClick={connect} 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  size="sm"
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Connect Wallet
                </Button>
              ) : (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-600">
                    Wallet Connected
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Connected'}
                  </Badge>
                  {network && (
                    <Badge variant="secondary" className="text-xs">
                      {network.name}
                    </Badge>
                  )}
                </div>
              )}

              {/* User Menu */}
              <div className="relative">
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>{userCredentials.username}</span>
                </Button>
              </div>

              {/* Notifications */}
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>

              {/* Settings */}
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>

              {/* Logout */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onLogout}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Message */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {userCredentials.roleName}!
          </h2>
          <p className="text-gray-600">
            Manage your {userCredentials.role.toLowerCase()} activities and monitor system performance.
          </p>
        </div>

        {/* Wallet Connection Section */}
        {!isConnected ? (
          <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Wallet className="h-8 w-8 text-blue-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900">
                      Connect Your Wallet
                    </h3>
                    <p className="text-blue-700">
                      Connect MetaMask to interact with the blockchain and perform transactions
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={connect} 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                  size="lg"
                >
                  <Wallet className="h-5 w-5 mr-2" />
                  Connect MetaMask
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Wallet className="h-6 w-6 text-green-600" />
                  <div>
                    <h3 className="text-sm font-semibold text-green-900">
                      Wallet Connected
                    </h3>
                    <p className="text-green-700 text-sm">
                      {account ? `Connected to ${account.slice(0, 6)}...${account.slice(-4)}` : 'MetaMask connected'}
                      {network && ` • Network: ${network.name}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm text-green-600 font-medium">Ready for transactions</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Role-specific Dashboard */}
        {renderDashboard()}

        {/* Recent Transactions */}
        {transactions.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {transactions.slice(0, 5).map((transaction, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-gray-500">
                        {new Date().toLocaleTimeString()}
                      </p>
                    </div>
                    <Badge 
                      variant={transaction.status === 'confirmed' ? 'default' : 
                              transaction.status === 'pending' ? 'secondary' : 'destructive'}
                    >
                      {transaction.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
