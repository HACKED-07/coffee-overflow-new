import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, TrendingUp, Zap, DollarSign, Package, CheckCircle } from 'lucide-react';

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

interface BuyerInterfaceProps {
  credits: Credit[];
  onRefresh: () => void;
}

export const BuyerInterface: React.FC<BuyerInterfaceProps> = ({ credits, onRefresh }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const availableCredits = credits.filter(credit => credit.isValidated && !credit.isRetired);
  const purchasedCredits = credits.filter(credit => credit.ownerId === 'buyer1' && credit.isRetired);

  const handlePurchaseCredit = async (creditId: string) => {
    setLoading(creditId);
    try {
      const response = await fetch(`/api/credits/${creditId}/buy`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerId: 'buyer1'
        })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Credit purchased successfully! Data is now persistent.",
        });
        onRefresh();
      } else {
        throw new Error('Failed to purchase credit');
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

  const totalSpent = purchasedCredits.reduce((sum, credit) => sum + credit.price, 0);
  const totalCreditsPurchased = purchasedCredits.reduce((sum, credit) => sum + credit.amount, 0);

  return (
    <div className="space-y-6">
      {/* Buyer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Credits</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableCredits.length}</div>
            <p className="text-xs text-muted-foreground">Ready to Purchase</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Purchased</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCreditsPurchased} kg</div>
            <p className="text-xs text-muted-foreground">Green Hydrogen</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSpent.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Investment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Carbon Offset</CardTitle>
            <Zap className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(totalCreditsPurchased * 0.1).toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Tons CO2</p>
          </CardContent>
        </Card>
      </div>

      {/* Available Credits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Available Credits
          </CardTitle>
          <CardDescription>Purchase validated green hydrogen credits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {availableCredits.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-600">No credits available</p>
                <p className="text-muted-foreground">All validated credits have been purchased</p>
              </div>
            ) : (
              availableCredits.map((credit) => (
                <div key={credit.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{credit.amount} kg - {credit.renewableSource}</h4>
                        <Badge variant="default" className="text-xs">
                          Validated
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Producer: {credit.producerId} • Facility: {credit.facilityId}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Production Date: {credit.productionDate} • Validated: {credit.validatedAt && new Date(credit.validatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">${credit.price}</p>
                        <p className="text-sm text-muted-foreground">per credit</p>
                      </div>
                      <Button
                        onClick={() => handlePurchaseCredit(credit.id)}
                        disabled={loading === credit.id}
                        className="flex items-center gap-2"
                      >
                        {loading === credit.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Purchasing...
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="h-4 w-4" />
                            Purchase
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Credit Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Amount:</span>
                      <p className="text-muted-foreground">{credit.amount} kg</p>
                    </div>
                    <div>
                      <span className="font-medium">Energy Source:</span>
                      <p className="text-muted-foreground">{credit.renewableSource}</p>
                    </div>
                    <div>
                      <span className="font-medium">Validator:</span>
                      <p className="text-muted-foreground">{credit.validatedBy}</p>
                    </div>
                    <div>
                      <span className="font-medium">Total Cost:</span>
                      <p className="text-muted-foreground">${(credit.amount * credit.price).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Purchase History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Purchase History
          </CardTitle>
          <CardDescription>Your purchased green hydrogen credits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {purchasedCredits.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No credits purchased yet</p>
            ) : (
              purchasedCredits.map((credit) => (
                <div key={credit.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{credit.amount} kg - {credit.renewableSource}</p>
                    <p className="text-sm text-muted-foreground">
                      {credit.producerId} • {credit.facilityId} • ${credit.price}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      Retired
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {credit.retiredAt && new Date(credit.retiredAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sustainability Impact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Sustainability Impact
          </CardTitle>
          <CardDescription>Your contribution to green hydrogen adoption</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {totalCreditsPurchased} kg
              </div>
              <p className="text-sm text-muted-foreground">Green Hydrogen Produced</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {(totalCreditsPurchased * 0.1).toFixed(1)} tons
              </div>
              <p className="text-sm text-muted-foreground">CO2 Emissions Avoided</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                ${totalSpent.toFixed(2)}
              </div>
              <p className="text-sm text-muted-foreground">Investment in Clean Energy</p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-green-800 dark:text-green-200">Environmental Impact</p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  By purchasing {totalCreditsPurchased} kg of green hydrogen credits, you've supported 
                  renewable energy production and contributed to reducing carbon emissions in the hydrogen sector.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
