import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Factory, 
  Leaf, 
  TrendingUp, 
  Shield, 
  Users, 
  Activity,
  Plus,
  CheckCircle,
  ShoppingCart,
  Zap
} from "lucide-react";


interface Credit {
  id: number;
  creditType: string;
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
}

interface Facility {
  id: string;
  name: string;
  location: string;
  renewableSource: string;
  capacity: number;
  producerId: string;
  isActive: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'producer' | 'validator' | 'buyer';
}

const Dashboard = () => {
  const [userRole, setUserRole] = useState<'producer' | 'validator' | 'buyer' | null>(null);
  const [credits, setCredits] = useState<Credit[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();

  // Express API endpoints
  const API_BASE = 'http://localhost:3001/api';

  // Fetch data from Express API
  const fetchData = async () => {
    try {
      const [creditsRes, facilitiesRes] = await Promise.all([
        fetch(`${API_BASE}/credits`),
        fetch(`${API_BASE}/facilities`)
      ]);
      
      if (creditsRes.ok) {
        const creditsData = await creditsRes.json();
        setCredits(creditsData);
      }
      
      if (facilitiesRes.ok) {
        const facilitiesData = await facilitiesRes.json();
        setFacilities(facilitiesData);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalCredits = credits.reduce((sum, credit) => sum + credit.amount, 0);
  const validatedCredits = credits.filter(c => c.isValidated).length;
  const availableCredits = credits.filter(c => c.isValidated && !c.isRetired).length;

  // Role selection functions
  const selectRole = (role: 'producer' | 'validator' | 'buyer') => {
    setUserRole(role);
    setUser({
      id: Math.random().toString(36).substr(2, 9),
      name: `${role.charAt(0).toUpperCase() + role.slice(1)} User`,
      email: `${role}@example.com`,
      role
    });
  };

    return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Green Hydrogen Credit System
          </h1>
          <p className="text-muted-foreground text-lg">
            Decentralized platform for green hydrogen credit generation, validation, and trading
          </p>
        </div>

        {!userRole ? (
          <div className="max-w-4xl mx-auto">
            <Card className="mb-8">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl mb-2">Choose Your Role</CardTitle>
                <CardDescription className="text-lg">
                  Select how you want to participate in the green hydrogen ecosystem
                </CardDescription>
              </CardHeader>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Producer Role */}
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => selectRole('producer')}>
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-3 bg-green-100 dark:bg-green-900/20 rounded-full w-16 h-16 flex items-center justify-center">
                    <Factory className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle className="text-xl mb-2">Green Hydrogen Producer</CardTitle>
                  <CardDescription className="text-sm">
                    Generate green hydrogen and create credits from your renewable energy facilities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      <span>Generate hydrogen credits</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      <span>Monitor production</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Leaf className="h-4 w-4" />
                      <span>Track renewable sources</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4">
                    Start as Producer
                  </Button>
                </CardContent>
              </Card>

              {/* Validator Role */}
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => selectRole('validator')}>
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full w-16 h-16 flex items-center justify-center">
                    <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-xl mb-2">Credit Validator</CardTitle>
                  <CardDescription className="text-sm">
                    Validate and certify green hydrogen credits to ensure authenticity and compliance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Validate credit authenticity</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <span>Ensure compliance</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>Maintain system integrity</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    Start as Validator
                  </Button>
                </CardContent>
              </Card>

              {/* Buyer Role */}
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => selectRole('buyer')}>
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full w-16 h-16 flex items-center justify-center">
                    <ShoppingCart className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle className="text-xl mb-2">Credit Buyer</CardTitle>
                  <CardDescription className="text-sm">
                    Purchase verified green hydrogen credits for your sustainability goals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4" />
                      <span>Buy verified credits</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      <span>Track sustainability metrics</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      <span>Meet carbon goals</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4" variant="secondary">
                    Start as Buyer
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div>
            {/* User Info */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold">Welcome, {user?.name}</h2>
                <p className="text-muted-foreground capitalize">{userRole} Dashboard</p>
              </div>
              <Button variant="outline" onClick={() => setUserRole(null)}>
                Switch Role
              </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
                  <Leaf className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalCredits.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {credits.length} active credits
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Validated Credits</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{validatedCredits}</div>
                  <p className="text-xs text-muted-foreground">
                    Ready for trading
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Available Credits</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{availableCredits}</div>
                  <p className="text-xs text-muted-foreground">
                    For purchase
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Facilities</CardTitle>
                  <Factory className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{facilities.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Producing hydrogen
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Role-specific Interface */}
            {userRole === 'producer' && <ProducerInterface credits={credits} facilities={facilities} onRefresh={fetchData} />}
            {userRole === 'validator' && <ValidatorInterface credits={credits} onRefresh={fetchData} />}
            {userRole === 'buyer' && <BuyerInterface credits={credits} onRefresh={fetchData} />}
          </div>
        )}
      </div>
    </div>
  );
};

// Producer Interface Component
const ProducerInterface = ({ credits, facilities, onRefresh }: { credits: Credit[], facilities: Facility[], onRefresh: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    facilityId: '',
    renewableSource: 'Solar',
    productionDate: new Date().toISOString().split('T')[0]
  });
  const { toast } = useToast();

  const generateCredits = async () => {
    if (!formData.amount || !formData.facilityId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          amount: parseInt(formData.amount),
          producerId: 'producer-1',
          isValidated: false,
          isRetired: false,
          ownerId: 'producer-1',
          price: 50,
          creditType: 'Green Hydrogen'
        })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Generated ${formData.amount} green hydrogen credits`,
        });
        setFormData({ amount: '', facilityId: '', renewableSource: 'Solar', productionDate: new Date().toISOString().split('T')[0] });
        onRefresh();
      } else {
        throw new Error('Failed to generate credits');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate credits",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Generate Green Hydrogen Credits
          </CardTitle>
          <CardDescription>
            Create new credits from your hydrogen production
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Amount (kg H2)</label>
              <input
                type="number"
                className="w-full mt-1 px-3 py-2 border rounded-md"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="1000"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Facility ID</label>
              <input
                type="text"
                className="w-full mt-1 px-3 py-2 border rounded-md"
                value={formData.facilityId}
                onChange={(e) => setFormData({ ...formData, facilityId: e.target.value })}
                placeholder="FACILITY-001"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Renewable Source</label>
              <select
                className="w-full mt-1 px-3 py-2 border rounded-md"
                value={formData.renewableSource}
                onChange={(e) => setFormData({ ...formData, renewableSource: e.target.value })}
              >
                <option value="Solar">Solar</option>
                <option value="Wind">Wind</option>
                <option value="Hydro">Hydro</option>
                <option value="Geothermal">Geothermal</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Production Date</label>
              <input
                type="date"
                className="w-full mt-1 px-3 py-2 border rounded-md"
                value={formData.productionDate}
                onChange={(e) => setFormData({ ...formData, productionDate: e.target.value })}
              />
            </div>
          </div>
          <Button onClick={generateCredits} disabled={loading} className="w-full">
            {loading ? "Generating..." : "Generate Credits"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Your Credits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {credits.filter(c => c.producerId === 'producer-1').map((credit) => (
              <div key={credit.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{credit.amount} kg H2</div>
                  <div className="text-sm text-muted-foreground">
                    {credit.renewableSource} • {credit.facilityId}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={credit.isValidated ? "default" : "secondary"}>
                    {credit.isValidated ? "Validated" : "Pending"}
                  </Badge>
                  <Badge variant={credit.isRetired ? "destructive" : "outline"}>
                    {credit.isRetired ? "Retired" : "Active"}
                  </Badge>
                </div>
              </div>
            ))}
            {credits.filter(c => c.producerId === 'producer-1').length === 0 && (
              <p className="text-muted-foreground text-center py-8">No credits generated yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Validator Interface Component
const ValidatorInterface = ({ credits, onRefresh }: { credits: Credit[], onRefresh: () => void }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const validateCredit = async (creditId: number) => {
    setLoading(creditId.toString());
    try {
      const response = await fetch(`http://localhost:3001/api/credits/${creditId}/validate`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          validatedBy: 'validator-1',
          validatedAt: new Date().toISOString()
        })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Credit validated successfully",
        });
        onRefresh();
      } else {
        throw new Error('Failed to validate credit');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to validate credit",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  const pendingCredits = credits.filter(c => !c.isValidated);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Pending Validation
          </CardTitle>
          <CardDescription>
            Review and validate green hydrogen credits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pendingCredits.map((credit) => (
              <div key={credit.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{credit.amount} kg H2</div>
                  <div className="text-sm text-muted-foreground">
                    {credit.renewableSource} • {credit.facilityId} • {credit.productionDate}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Producer: {credit.producerId}
                  </div>
                </div>
                <Button 
                  onClick={() => validateCredit(credit.id)}
                  disabled={loading === credit.id.toString()}
                  size="sm"
                >
                  {loading === credit.id.toString() ? "Validating..." : "Validate"}
                </Button>
              </div>
            ))}
            {pendingCredits.length === 0 && (
              <p className="text-muted-foreground text-center py-8">No credits pending validation</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Validated Credits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {credits.filter(c => c.isValidated).map((credit) => (
              <div key={credit.id} className="flex items-center justify-between p-3 border rounded-lg bg-green-50 dark:bg-green-900/10">
                <div>
                  <div className="font-medium">{credit.amount} kg H2</div>
                  <div className="text-sm text-muted-foreground">
                    {credit.renewableSource} • Validated by {credit.validatedBy}
                  </div>
                </div>
                <Badge variant="default">Validated</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Buyer Interface Component
const BuyerInterface = ({ credits, onRefresh }: { credits: Credit[], onRefresh: () => void }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const buyCredit = async (creditId: number, amount: number, price: number) => {
    setLoading(creditId.toString());
    try {
      const response = await fetch(`http://localhost:3001/api/credits/${creditId}/buy`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          buyerId: 'buyer-1',
          ownerId: 'buyer-1',
          isRetired: true
        })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Purchased ${amount} kg H2 credits for $${(amount * price).toFixed(2)}`,
        });
        onRefresh();
      } else {
        throw new Error('Failed to buy credit');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to purchase credit",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  const availableCredits = credits.filter(c => c.isValidated && !c.isRetired);
  const myCredits = credits.filter(c => c.ownerId === 'buyer-1');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Available Credits
          </CardTitle>
          <CardDescription>
            Purchase verified green hydrogen credits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {availableCredits.map((credit) => (
              <div key={credit.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{credit.amount} kg H2</div>
                  <div className="text-sm text-muted-foreground">
                    {credit.renewableSource} • {credit.facilityId}
                  </div>
                  <div className="text-sm font-medium text-green-600">
                    ${credit.price}/kg • Total: ${(credit.amount * credit.price).toFixed(2)}
                  </div>
                </div>
                <Button 
                  onClick={() => buyCredit(credit.id, credit.amount, credit.price)}
                  disabled={loading === credit.id.toString()}
                  size="sm"
                >
                  {loading === credit.id.toString() ? "Purchasing..." : "Buy Credits"}
                </Button>
              </div>
            ))}
            {availableCredits.length === 0 && (
              <p className="text-muted-foreground text-center py-8">No credits available for purchase</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5" />
            My Purchased Credits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {myCredits.map((credit) => (
              <div key={credit.id} className="flex items-center justify-between p-3 border rounded-lg bg-purple-50 dark:bg-purple-900/10">
                <div>
                  <div className="font-medium">{credit.amount} kg H2</div>
                  <div className="text-sm text-muted-foreground">
                    {credit.renewableSource} • Purchased for ${(credit.amount * credit.price).toFixed(2)}
                  </div>
                </div>
                <Badge variant="secondary">Owned</Badge>
              </div>
            ))}
            {myCredits.length === 0 && (
              <p className="text-muted-foreground text-center py-8">No credits purchased yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;