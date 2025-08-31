import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useEthereum } from "@/contexts/EthereumContext";
import { ShoppingCart, TrendingUp, DollarSign, Package, Eye, Filter, Wallet } from "lucide-react";
import ApiService from "@/services/api";

interface Credit {
  id: string;
  amount: number;
  renewableSource: string;
  productionDate: string;
  producerId: string;
  facilityId: string;
  isValidated: boolean;
  validatedBy: string;
  validatedAt: string;
  isRetired: boolean;
  ownerId: string;
  price: number;
  createdAt: string;
  status: 'pending' | 'validated' | 'issued' | 'retired';
  description?: string;
  supportingDocuments?: string;
  blockchainId?: number;
}

interface BuyerDashboardProps {
  credits: Credit[];
  buyerId: string; // Add buyer ID prop
  onRefresh: () => void;
  onTransaction: (transaction: any) => void;
}

export default function BuyerDashboard({
  credits,
  buyerId,
  onRefresh,
  onTransaction
}: BuyerDashboardProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedCredit, setSelectedCredit] = useState<Credit | null>(null);
  const [filters, setFilters] = useState({
    renewableSource: '',
    maxPrice: '',
    minAmount: ''
  });

  const { toast } = useToast();
  const { isConnected, purchaseCredits, connect } = useEthereum();

  // Available credits for purchase (validated and pre-minted on blockchain)
  const availableCredits = credits.filter(c => 
    (c.status === 'validated' || c.isValidated) && // Must be validated
    !c.isRetired && 
    c.ownerId !== buyerId && // Use the actual buyer ID from props
    c.blockchainId // Must have blockchain ID (pre-minted)
  );

  // Debug logging
  console.log('🔍 All credits:', credits);
  console.log('🔍 Available credits for purchase:', availableCredits);
  console.log('🔍 Credits with status="validated":', credits.filter(c => c.status === 'validated'));
  console.log('🔍 Credits with isValidated=true:', credits.filter(c => c.isValidated));

  // Buyer's owned credits
  const myCredits = credits.filter(c => c.ownerId === 'buyer1');

  // Apply filters
  const filteredCredits = availableCredits.filter(credit => {
    if (filters.renewableSource && credit.renewableSource !== filters.renewableSource) return false;
    if (filters.maxPrice && credit.price > parseFloat(filters.maxPrice)) return false;
    if (filters.minAmount && credit.amount < parseFloat(filters.minAmount)) return false;
    return true;
  });

  const totalSpent = myCredits.reduce((sum, c) => sum + (c.amount * c.price), 0);
  const totalCredits = myCredits.reduce((sum, c) => sum + c.amount, 0);
  const averagePrice = totalCredits > 0 ? totalSpent / totalCredits : 0;

  const buyCredit = async (creditId: string, amount: number, price: number) => {
    console.log('🚀 buyCredit function called with:', { creditId, amount, price });
    
    if (!isConnected) {
      console.log('❌ Wallet not connected, showing error toast');
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to purchase credits",
        variant: "destructive"
      });
      return;
    }
    
    console.log('✅ Wallet is connected, proceeding with purchase...');
    
    // Find the credit to purchase
    const credit = credits.find(c => c.id === creditId);
    console.log('🔍 Found credit:', credit);
    
    if (!credit) {
      console.log('❌ Credit not available');
      toast({
        title: "Credit Not Available",
        description: "This credit is not available for purchase",
        variant: "destructive"
      });
      return;
    }
    
    console.log('✅ Credit validation passed:', credit);
    
    try {
      setLoading(creditId.toString());
      
      // Update transaction status
      onTransaction({
        type: 'purchase',
        status: 'pending',
        description: `Purchasing ${amount} kg H2 credits for $${(amount * price).toFixed(2)}...`
      });
      
      // Credits are already pre-minted on blockchain, just purchase them
      console.log('💰 Purchasing pre-minted credits from marketplace...');
      const purchaseTx = await purchaseCredits(credit.blockchainId!, amount);

      console.log('✅ Credits purchased successfully:', purchaseTx);
      
              // Record the transaction in the database
        try {
          await ApiService.recordPurchase(
            creditId, 
            buyerId, 
            amount, 
            price, 
            purchaseTx
          );
          
          // Update credit ownership
          await ApiService.updateCreditOwnership(creditId, buyerId, purchaseTx);
          
          console.log('✅ Purchase transaction recorded in database');
          
          onTransaction({
            type: 'purchase',
            status: 'confirmed',
            description: `Purchase completed! Transaction hash: ${purchaseTx.substring(0, 10)}...`
          });
        
        toast({
          title: "Credits Purchased Successfully!",
          description: `You have purchased ${amount} kg H2 credits for $${(amount * price).toFixed(2)}. Transaction recorded on blockchain and database.`,
        });
        
      } catch (dbError) {
        console.warn('⚠️ Database update failed, but blockchain transaction succeeded:', dbError);
        toast({
          title: "Purchase Partially Complete",
          description: "Credits purchased on blockchain, but database update failed. Please contact support.",
          variant: "destructive"
        });
      }
      
      // Refresh the credits list to show updated ownership
      onRefresh();
      
    } catch (error) {
      console.error('❌ Purchase failed:', error);
      onTransaction({
        type: 'purchase',
        status: 'failed',
        description: `Purchase failed: ${error instanceof Error ? error.message : "Unknown error"}`
      });
      toast({
        title: "Purchase Failed",
        description: error instanceof Error ? error.message : "Failed to purchase credits",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  const viewCreditDetails = (credit: Credit) => {
    setSelectedCredit(credit);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center text-purple-800">
            <ShoppingCart className="h-6 w-6 mr-3" />
            Industry Buyer Dashboard
          </CardTitle>
          <p className="text-purple-700">
            Purchase pre-minted certified green hydrogen credits to meet your sustainability goals
          </p>
        </CardHeader>
      </Card>

      {/* Wallet Connection Notice */}
      {!isConnected && (
        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Wallet className="h-8 w-8 text-orange-600" />
                <div>
                  <h3 className="text-lg font-semibold text-orange-900">
                    Wallet Connection Required
                  </h3>
                  <p className="text-orange-700">
                    You need to connect your MetaMask wallet to purchase credits from the blockchain
                  </p>
                </div>
              </div>
              <Button 
                onClick={connect} 
                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2"
                size="lg"
              >
                <Wallet className="h-5 w-5 mr-2" />
                Connect Wallet
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Credits</p>
                <p className="text-2xl font-bold text-purple-600">{totalCredits.toFixed(0)} kg</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-green-600">${totalSpent.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Price</p>
                <p className="text-2xl font-bold text-blue-600">${averagePrice.toFixed(3)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold text-orange-600">{filteredCredits.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Marketplace Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Renewable Source</label>
              <select
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={filters.renewableSource}
                onChange={(e) => setFilters({ ...filters, renewableSource: e.target.value })}
              >
                <option value="">All Sources</option>
                <option value="Solar">Solar</option>
                <option value="Wind">Wind</option>
                <option value="Hydro">Hydro</option>
                <option value="Geothermal">Geothermal</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Max Price per kg</label>
              <input
                type="number"
                step="0.001"
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                placeholder="0.05"
                min="0"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Min Amount (kg)</label>
              <input
                type="number"
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={filters.minAmount}
                onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
                placeholder="100"
                min="1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Credits */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2" />
            Available Credits
          </CardTitle>
          <p className="text-sm text-gray-600">
            {filteredCredits.length} credits available for purchase
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredCredits.map((credit) => (
              <div key={credit.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="font-medium text-lg">{credit.amount} kg H2</div>
                      <Badge variant="default" className="bg-green-600">
                        Certified
                      </Badge>
                      <Badge variant="outline" className="border-blue-300 text-blue-700">
                        {credit.renewableSource}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-2">
                      <div>
                        <span className="font-medium">Producer:</span> {credit.producerId}
                      </div>
                      <div>
                        <span className="font-medium">Facility:</span> {credit.facilityId}
                      </div>
                      <div>
                        <span className="font-medium">Date:</span> {credit.productionDate}
                      </div>
                      <div>
                        <span className="font-medium">Validated:</span> {credit.validatedBy}
                      </div>
                    </div>

                    <div className="text-lg font-semibold text-green-600">
                      ${credit.price}/kg • Total: ${(credit.amount * credit.price).toFixed(2)}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    <Button
                      onClick={() => viewCreditDetails(credit)}
                      variant="outline"
                      size="sm"
                      className="border-purple-300 text-purple-700 hover:bg-purple-50"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Details
                    </Button>
                    
                    <Button
                      onClick={() => {
                        console.log('🛒 Buy Credits button clicked!');
                        console.log('📝 Credit data:', { id: credit.id, amount: credit.amount, price: credit.price });
                        console.log('🔗 Wallet connected:', isConnected);
                        buyCredit(credit.id, credit.amount, credit.price);
                      }}
                      disabled={loading === credit.id}
                      size="sm"
                      className="bg-purple-700 hover:bg-purple-800 text-white"
                    >
                      {loading === credit.id ? "Purchasing..." : "Buy Credits"}
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {filteredCredits.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">No Credits Available</h3>
                <p className="text-sm">Try adjusting your filters or check back later</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* My Portfolio */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2" />
            My Portfolio
          </CardTitle>
          <p className="text-sm text-gray-600">
            Credits you have purchased for sustainability compliance
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {myCredits.map((credit) => (
              <div key={credit.id} className="flex items-center justify-between p-3 border border-purple-200 rounded-lg bg-purple-50">
                <div className="flex-1">
                  <div className="font-medium">{credit.amount} kg H2</div>
                  <div className="text-sm text-gray-600">
                    {credit.renewableSource} • {credit.facilityId}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Purchased for ${(credit.amount * credit.price).toFixed(2)}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-purple-600">
                    Owned
                  </Badge>
                  <Badge variant="outline" className="border-purple-300 text-purple-700">
                    ${(credit.amount * credit.price).toFixed(2)}
                  </Badge>
                </div>
              </div>
            ))}
            
            {myCredits.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No credits in your portfolio yet</p>
                <p className="text-sm">Start purchasing credits from the marketplace above</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Credit Details Modal */}
      {selectedCredit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Credit Details</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedCredit(null)}
              >
                Close
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Amount</label>
                  <p className="text-lg font-semibold">{selectedCredit.amount} kg H2</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Renewable Source</label>
                  <p className="text-lg">{selectedCredit.renewableSource}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Producer ID</label>
                  <p className="text-lg">{selectedCredit.producerId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Facility ID</label>
                  <p className="text-lg">{selectedCredit.facilityId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Production Date</label>
                  <p className="text-lg">{selectedCredit.productionDate}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Price per kg</label>
                  <p className="text-lg">${selectedCredit.price}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Validated By</label>
                  <p className="text-lg">{selectedCredit.validatedBy}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Validation Date</label>
                  <p className="text-lg">{selectedCredit.validatedAt}</p>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-800 mb-2">Certification Details</h4>
                <p className="text-sm text-green-700">
                  This credit has been certified by regulatory authorities and is ready for purchase. 
                  The blockchain ensures transparency and prevents double-counting.
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedCredit(null)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    buyCredit(selectedCredit.id, selectedCredit.amount, selectedCredit.price);
                    setSelectedCredit(null);
                  }}
                  disabled={loading === selectedCredit.id.toString()}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {loading === selectedCredit.id.toString() ? "Purchasing..." : "Purchase Credits"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
