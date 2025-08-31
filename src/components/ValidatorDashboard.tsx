import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useEthereum } from "@/contexts/EthereumContext";
import { ApiService } from "@/services/api";
import { Shield, CheckCircle, AlertTriangle, Clock, FileText, Eye, Activity, Zap, Wallet } from "lucide-react";

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

interface ValidatorDashboardProps {
  credits: Credit[];
  onRefresh: () => void;
  onTransaction: (transaction: any) => void;
}

export default function ValidatorDashboard({
  credits,
  onRefresh,
  onTransaction
}: ValidatorDashboardProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedCredit, setSelectedCredit] = useState<Credit | null>(null);
  const [validationNotes, setValidationNotes] = useState('');

  const { toast } = useToast();
  const { isConnected, issueCredits, validateCredits, createFacility, connect } = useEthereum();

  const pendingCredits = credits.filter(c => c.status === 'pending');
  const validatedCredits = credits.filter(c => c.status === 'validated');
  const totalValidated = validatedCredits.length;
  const totalValue = validatedCredits.reduce((sum, c) => sum + (c.amount * c.price), 0);

  const validateCreditApplication = async (creditId: string) => {
    setLoading(creditId);
    onTransaction({
      type: 'validate_application',
      status: 'pending',
      description: `Validating credit application ${creditId}`
    });

    try {
      // Step 1: Validate the credit application in the database only
      const updatedCredit = await ApiService.validateCredit(creditId, 'validator1');
      
      console.log('✅ Credit application validated:', updatedCredit);

      // Step 2: Ensure facility exists on blockchain before minting
      if (!isConnected) {
        throw new Error('Wallet not connected - please connect to mint credits');
      }

      let facilityId = updatedCredit.facilityId;
      try {
        console.log('🏭 Creating facility on blockchain...');
        const facilityData = {
          id: updatedCredit.facilityId, // Pass the existing facility ID
          name: `Facility ${updatedCredit.facilityId}`,
          location: 'Unknown Location',
          renewableSource: updatedCredit.renewableSource,
          capacity: updatedCredit.amount
        };
        
        facilityId = await createFacility(facilityData);
        console.log('✅ Facility created on blockchain:', facilityId);
      } catch (facilityError) {
        console.log('🏭 Facility creation failed:', facilityError);
        console.log('🏭 Trying to use existing facility ID:', updatedCredit.facilityId);
        // If facility creation fails, we need to ensure the facility exists
        // For now, let's try to use the existing facility ID
        facilityId = updatedCredit.facilityId;
      }

      // Step 3: Pre-mint credits on the blockchain
      console.log('🏭 Pre-minting credits on blockchain...');
      const blockchainId = await issueCredits({
        amount: updatedCredit.amount,
        renewableSource: updatedCredit.renewableSource,
        productionDate: updatedCredit.productionDate,
        facilityId: facilityId, // Use the facilityId we created/ensured exists
        price: updatedCredit.price
      });
      console.log('✅ Credits pre-minted on blockchain with ID:', blockchainId);

      // Step 4: Validate the minted credits on blockchain
      console.log('✅ Validating pre-minted credits on blockchain...');
      await validateCredits(blockchainId);
      console.log('✅ Credits validated on blockchain');

      // Step 5: Update database with blockchain ID
      try {
        await ApiService.updateCreditBlockchainId(creditId, blockchainId);
        console.log('✅ Database updated: credit marked as issued with blockchain ID');
      } catch (dbError) {
        console.warn('⚠️ Database update failed, but blockchain transaction succeeded:', dbError);
      }

      onTransaction({
        type: 'validate_application',
        status: 'confirmed',
        description: `Credit application ${creditId} validated and credits pre-minted on blockchain - ready for purchase`,
      });

      toast({
        title: "Application Validated Successfully",
        description: `${updatedCredit.amount} kg H2 credits have been validated and pre-minted on blockchain - ready for purchase`,
      });

      onRefresh();
    } catch (error) {
      onTransaction({
        type: 'validate_application',
        status: 'failed',
        description: `Failed to validate credit application ${creditId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      toast({
        title: "Validation Failed",
        description: "Failed to validate credit application. Please try again.",
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
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-800">
            <Shield className="h-6 w-6 mr-3" />
            Regulatory Authority Dashboard
          </CardTitle>
          <p className="text-blue-700">
            Review credit applications, validate compliance, and pre-mint credits on blockchain for purchase
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
                    You need to connect your MetaMask wallet to validate credits and interact with the blockchain
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
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingCredits.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Pre-Minted Credits</p>
                <p className="text-2xl font-bold text-green-600">{totalValidated}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-blue-600">${totalValue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Compliance Rate</p>
                <p className="text-2xl font-bold text-purple-600">
                  {totalValidated > 0 ? Math.round((totalValidated / (totalValidated + pendingCredits.length)) * 100) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Applications */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Credit Applications Pending Review
          </CardTitle>
          <p className="text-sm text-gray-600">
            Review and validate credit applications - credits will be pre-minted on blockchain during validation
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingCredits.map((credit) => (
              <div key={credit.id} className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="font-medium text-lg">{credit.amount} kg H2</div>
                      <Badge variant="outline" className="border-yellow-300 text-yellow-700">
                        Pending Review
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Source:</span> {credit.renewableSource}
                      </div>
                      <div>
                        <span className="font-medium">Producer:</span> {credit.producerId}
                      </div>
                      <div>
                        <span className="font-medium">Facility:</span> {credit.facilityId}
                      </div>
                      <div>
                        <span className="font-medium">Date:</span> {credit.productionDate}
                      </div>
                    </div>

                    <div className="mt-2 text-sm">
                      <span className="font-medium">Price:</span> ${credit.price}/kg • 
                      <span className="font-medium ml-2">Total Value:</span> ${(credit.amount * credit.price).toFixed(2)}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    <Button
                      onClick={() => viewCreditDetails(credit)}
                      variant="outline"
                      size="sm"
                      className="border-blue-300 text-blue-700 hover:bg-blue-50"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Review
                    </Button>
                    
                    <Button
                      onClick={() => validateCreditApplication(credit.id)}
                      disabled={loading === credit.id}
                      size="sm"
                      className="bg-green-700 text-white"
                    >
                      {loading === credit.id ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4 mr-1" />
                          Validate Application
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {pendingCredits.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Clock className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">No Applications Pending Review</h3>
                <p className="text-sm">All credit applications have been processed</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Validated Credits */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            Pre-Minted Credits
          </CardTitle>
          <p className="text-sm text-gray-600">
            Credits that have been validated and pre-minted on blockchain - ready for purchase
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {validatedCredits.slice(0, 5).map((credit) => (
              <div key={credit.id} className="flex items-center justify-between p-3 border border-green-200 rounded-lg bg-green-50">
                <div className="flex-1">
                  <div className="font-medium">{credit.amount} kg H2</div>
                  <div className="text-sm text-gray-600">
                    {credit.renewableSource} • {credit.facilityId}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Generated by: {credit.validatedBy} • Date: {credit.validatedAt}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="default" className="bg-green-600">
                    Validated
                  </Badge>
                  <Badge variant="outline" className="border-green-300 text-green-700">
                    ${(credit.amount * credit.price).toFixed(2)}
                  </Badge>
                </div>
              </div>
            ))}
            
            {validatedCredits.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No credits validated yet</p>
                <p className="text-sm">Start reviewing applications to validate credits</p>
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
              <h3 className="text-lg font-medium">Credit Application Details</h3>
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
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Validation Notes</label>
                <textarea
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  value={validationNotes}
                  onChange={(e) => setValidationNotes(e.target.value)}
                  placeholder="Add validation notes, compliance findings, or approval comments..."
                />
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
                    validateCreditApplication(selectedCredit.id);
                    setSelectedCredit(null);
                  }}
                  disabled={loading === selectedCredit.id.toString()}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {loading === selectedCredit.id.toString() ? "Processing..." : "Validate Application"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
