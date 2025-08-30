import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useSolana } from '@/contexts/SolanaContext';
import { Factory, Plus, Activity, Leaf, Wallet, Network } from 'lucide-react';

interface Credit {
  id: string;
  creditType: string;
  amount: number;
  productionDate: string;
  producerId: string;
  facilityId: string;
  renewableSource: string;
  isValidated: boolean;
  validatedBy: string | null;
  validatedAt: string | null;
  isRetired: boolean;
  ownerId: string;
  price: number;
  createdAt: string;
}

interface Facility {
  id: string;
  name: string;
  location: string;
  renewableSource: string;
  capacity: number;
  producerId: string;
  isActive: boolean;
  createdAt: string;
}

interface ProducerInterfaceProps {
  credits: Credit[];
  facilities: Facility[];
  onRefresh: () => void;
}

export const ProducerInterface: React.FC<ProducerInterfaceProps> = ({ credits, facilities, onRefresh }) => {
  const [showCreateCredit, setShowCreateCredit] = useState(false);
  const [showCreateFacility, setShowCreateFacility] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { 
    isConnected, 
    isInitializing, 
    walletAddress, 
    balance, 
    network, 
    programId,
    connect, 
    disconnect,
    createFacility: createFacilityOnSolana,
    issueCredits: issueCreditsOnSolana
  } = useSolana();

  const [creditForm, setCreditForm] = useState({
    amount: '',
    productionDate: '',
    facilityId: '',
    renewableSource: '',
    price: ''
  });

  const [facilityForm, setFacilityForm] = useState({
    name: '',
    location: '',
    renewableSource: '',
    capacity: ''
  });

  const handleCreateCredit = async () => {
    if (!creditForm.amount || !creditForm.productionDate || !creditForm.facilityId || !creditForm.renewableSource || !creditForm.price) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (!isConnected) {
      toast({
        title: "Not Connected",
        description: "Please connect to Solana blockchain first",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Issue credits on Solana blockchain
      const creditAddress = await issueCreditsOnSolana({
        amount: parseInt(creditForm.amount),
        renewableSource: creditForm.renewableSource,
        productionDate: creditForm.productionDate,
        facilityId: creditForm.facilityId
      });

      toast({
        title: "Success",
        description: `Credits issued on Solana blockchain! Address: ${creditAddress}`,
      });
      setCreditForm({ amount: '', productionDate: '', facilityId: '', renewableSource: '', price: '' });
      setShowCreateCredit(false);
      onRefresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to issue credits on Solana",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFacility = async () => {
    if (!facilityForm.name || !facilityForm.location || !facilityForm.renewableSource || !facilityForm.capacity) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (!isConnected) {
      toast({
        title: "Not Connected",
        description: "Please connect to Solana blockchain first",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Create facility on Solana blockchain
      const facilityAddress = await createFacilityOnSolana({
        name: facilityForm.name,
        location: facilityForm.location,
        renewableSource: facilityForm.renewableSource,
        capacity: parseInt(facilityForm.capacity)
      });

      toast({
        title: "Success",
        description: `Facility created on Solana blockchain! Address: ${facilityAddress}`,
      });
      setFacilityForm({ name: '', location: '', renewableSource: '', capacity: '' });
      setShowCreateFacility(false);
      onRefresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create facility on Solana",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const producerCredits = credits.filter(credit => credit.producerId === 'prod1');
  const producerFacilities = facilities.filter(facility => facility.producerId === 'prod1');

  return (
    <div className="space-y-6">
      {/* Solana Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Solana Blockchain Connection
          </CardTitle>
          <CardDescription>Connect to Solana to create facilities and issue credits</CardDescription>
        </CardHeader>
        <CardContent>
          {!isConnected ? (
            <div className="flex items-center gap-4">
              <Button 
                onClick={connect} 
                disabled={isInitializing}
                className="flex items-center gap-2"
              >
                {isInitializing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="h-4 w-4" />
                    Connect to Solana
                  </>
                )}
              </Button>
              <div className="text-sm text-muted-foreground">
                Network: {network} • Program ID: {programId}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Connected to Solana</p>
                <p className="text-xs text-muted-foreground">
                  Wallet: {walletAddress?.slice(0, 8)}...{walletAddress?.slice(-8)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Balance: {balance?.toFixed(4)} SOL
                </p>
              </div>
              <Button variant="outline" onClick={disconnect}>
                Disconnect
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Producer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
            <Leaf className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{producerCredits.reduce((sum, c) => sum + c.amount, 0)}</div>
            <p className="text-xs text-muted-foreground">Green Hydrogen Credits</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Facilities</CardTitle>
            <Factory className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{producerFacilities.filter(f => f.isActive).length}</div>
            <p className="text-xs text-muted-foreground">Production Plants</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Validation</CardTitle>
            <Activity className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{producerCredits.filter(c => !c.isValidated).length}</div>
            <p className="text-xs text-muted-foreground">Awaiting Approval</p>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button onClick={() => setShowCreateCredit(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Credit
        </Button>
        <Button onClick={() => setShowCreateFacility(true)} variant="outline" className="flex items-center gap-2">
          <Factory className="h-4 w-4" />
          Add Facility
        </Button>
      </div>

      {/* Create Credit Modal */}
      {showCreateCredit && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Credit</CardTitle>
            <CardDescription>Generate green hydrogen credits from your facility</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Amount (kg)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={creditForm.amount}
                  onChange={(e) => setCreditForm({ ...creditForm, amount: e.target.value })}
                  placeholder="100"
                />
              </div>
              <div>
                <Label htmlFor="productionDate">Production Date</Label>
                <Input
                  id="productionDate"
                  type="date"
                  value={creditForm.productionDate}
                  onChange={(e) => setCreditForm({ ...creditForm, productionDate: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="facilityId">Facility</Label>
                <Select value={creditForm.facilityId} onValueChange={(value) => setCreditForm({ ...creditForm, facilityId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select facility" />
                  </SelectTrigger>
                  <SelectContent>
                    {producerFacilities.map((facility) => (
                      <SelectItem key={facility.id} value={facility.id}>
                        {facility.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="renewableSource">Energy Source</Label>
                <Select value={creditForm.renewableSource} onValueChange={(value) => setCreditForm({ ...creditForm, renewableSource: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Solar">Solar</SelectItem>
                    <SelectItem value="Wind">Wind</SelectItem>
                    <SelectItem value="Hydro">Hydro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="price">Price per Credit ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={creditForm.price}
                onChange={(e) => setCreditForm({ ...creditForm, price: e.target.value })}
                placeholder="10.50"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateCredit} disabled={loading}>
                {loading ? 'Creating...' : 'Create Credit'}
              </Button>
              <Button variant="outline" onClick={() => setShowCreateCredit(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Facility Modal */}
      {showCreateFacility && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Facility</CardTitle>
            <CardDescription>Register a new hydrogen production facility</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="facilityName">Facility Name</Label>
                <Input
                  id="facilityName"
                  value={facilityForm.name}
                  onChange={(e) => setFacilityForm({ ...facilityForm, name: e.target.value })}
                  placeholder="Solar Hydrogen Plant"
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={facilityForm.location}
                  onChange={(e) => setFacilityForm({ ...facilityForm, location: e.target.value })}
                  placeholder="Desert Region"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="renewableSource">Energy Source</Label>
                <Select value={facilityForm.renewableSource} onValueChange={(value) => setFacilityForm({ ...facilityForm, renewableSource: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Solar">Solar</SelectItem>
                    <SelectItem value="Wind">Wind</SelectItem>
                    <SelectItem value="Hydro">Hydro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="capacity">Capacity (kg/day)</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={facilityForm.capacity}
                  onChange={(e) => setFacilityForm({ ...facilityForm, capacity: e.target.value })}
                  placeholder="500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateFacility} disabled={loading}>
                {loading ? 'Creating...' : 'Create Facility'}
              </Button>
              <Button variant="outline" onClick={() => setShowCreateFacility(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Credits */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Credits</CardTitle>
          <CardDescription>Your recently created green hydrogen credits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {producerCredits.slice(0, 5).map((credit) => (
              <div key={credit.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{credit.amount} kg - {credit.renewableSource}</p>
                  <p className="text-sm text-muted-foreground">
                    {credit.productionDate} • ${credit.price}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {credit.isValidated ? (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Validated
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                      Pending
                    </span>
                  )}
                </div>
              </div>
            ))}
            {producerCredits.length === 0 && (
              <p className="text-center text-muted-foreground py-4">No credits created yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
