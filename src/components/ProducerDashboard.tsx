import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useEthereum } from "@/contexts/EthereumContext";
import { ApiService } from "@/services/api";
import { Factory, Plus, Activity, TrendingUp, AlertTriangle, Clock, FileText } from "lucide-react";

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
}

interface ProducerDashboardProps {
  credits: Credit[];
  facilities: Facility[];
  producerId: string; // Add producer ID prop
  onCreditsUpdate: React.Dispatch<React.SetStateAction<Credit[]>>;
  onRefresh: () => void;
  onTransaction: (transaction: any) => void;
}

export default function ProducerDashboard({
  credits,
  facilities,
  producerId,
  onCreditsUpdate,
  onRefresh,
  onTransaction
}: ProducerDashboardProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    facilityId: '',
    renewableSource: 'Solar',
    productionDate: new Date().toISOString().split('T')[0],
    price: '0.01',
    description: '',
    supportingDocuments: ''
  });

  const { toast } = useToast();
  const { isConnected } = useEthereum();

  // Set default facility when facilities are loaded
  useEffect(() => {
    console.log('🏭 ProducerDashboard - Facilities received:', facilities);
    if (facilities && facilities.length > 0 && !formData.facilityId) {
      setFormData(prev => ({ ...prev, facilityId: facilities[0].id }));
      console.log('✅ Default facility set to:', facilities[0].id);
    }
  }, [facilities, formData.facilityId]);

  const submitCreditApplication = async () => {
    console.log('🔄 Starting credit application submission...');
    console.log('📝 Form data:', formData);
    console.log('🔗 Wallet connected:', isConnected);
    
    if (!formData.amount || !formData.facilityId || !formData.description) {
      console.log('❌ Validation failed - missing required fields');
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields including description",
        variant: "destructive"
      });
      return;
    }

    if (!isConnected) {
      console.log('❌ Wallet not connected');
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to submit credit applications",
        variant: "destructive"
      });
      return;
    }

    console.log('✅ Validation passed, starting submission...');
    setLoading(true);
    onTransaction({
      type: 'credit_application',
      status: 'pending',
      description: `Submitting credit application for ${formData.amount} kg H2 from ${facilities.find(f => f.id === formData.facilityId)?.name}`
    });

    try {
      console.log('📡 Submitting credit application...');
      
      // Submit credit application to database (pending validation)
      const savedCredit = await ApiService.createCredit({
        creditType: 'Green Hydrogen',
        amount: parseFloat(formData.amount),
        productionDate: new Date(formData.productionDate),
        producerId: producerId, // Use the actual producer ID from props
        facilityId: formData.facilityId,
        renewableSource: formData.renewableSource,
        price: parseFloat(formData.price),
        status: 'pending', // Credits start as pending validation
        ownerId: producerId // Use the actual producer ID from props
      });

      console.log('✅ Credit application submitted successfully:', savedCredit);

      // Update local state with saved credit
      const newCredit: Credit = {
        id: savedCredit.id,
        creditType: savedCredit.creditType,
        amount: Number(savedCredit.amount),
        productionDate: new Date(savedCredit.productionDate).toISOString().split('T')[0],
        producerId: savedCredit.producerId,
        facilityId: savedCredit.facilityId,
        renewableSource: savedCredit.renewableSource,
        isValidated: false, // Credits are not validated yet
        isRetired: savedCredit.isRetired,
        ownerId: savedCredit.ownerId,
        price: Number(savedCredit.price),
        status: 'pending' // Status is pending validation
      };

      console.log('🔄 Updating local credits state...');
      onCreditsUpdate(prevCredits => [...prevCredits, newCredit]);

      onTransaction({
        type: 'credit_application',
        status: 'confirmed',
        description: `Credit application submitted successfully for ${formData.amount} kg H2`
      });

      toast({
        title: "Application Submitted",
        description: `${formData.amount} kg H2 credit application submitted and pending validation`,
      });

      // Reset form
      setFormData({
        amount: '',
        facilityId: '',
        renewableSource: 'Solar',
        productionDate: new Date().toISOString().split('T')[0],
        price: '0.01',
        description: '',
        supportingDocuments: ''
      });

      console.log('🔄 Calling onRefresh...');
      onRefresh();
      console.log('✅ Credit application completed successfully!');
    } catch (error) {
      console.error('❌ Error during credit application:', error);
      onTransaction({
        type: 'credit_application',
        status: 'failed',
        description: `Failed to submit credit application: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      toast({
        title: "Application Failed",
        description: "Failed to submit credit application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const producerCredits = credits.filter(c => c.producerId === 'prod1');
  const pendingApplications = producerCredits.filter(c => c.status === 'pending');
  const approvedCredits = producerCredits.filter(c => c.status === 'issued');
  const totalValue = producerCredits.reduce((sum, c) => sum + (Number(c.amount) * Number(c.price)), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center text-green-800">
            <Factory className="h-6 w-6 mr-3" />
            Producer Dashboard
          </CardTitle>
          <p className="text-green-700">
            Submit applications for green hydrogen credit generation - credits will be generated after validator approval
          </p>
        </CardHeader>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Applications</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingApplications.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Approved Credits</p>
                <p className="text-2xl font-bold text-green-600">{approvedCredits.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-blue-600">{producerCredits.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-purple-600">${totalValue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Credit Application Form */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Submit Credit Application
          </CardTitle>
          <p className="text-sm text-gray-600">
            Submit an application for credit generation. Credits will only be generated after regulatory validation.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Amount (kg H2)</label>
              <input
                type="number"
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="1000"
                min="1"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Facility</label>
              <select
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={formData.facilityId}
                onChange={(e) => setFormData({ ...formData, facilityId: e.target.value })}
              >
                <option value="">Select a facility</option>
                {facilities?.map((facility) => (
                  <option key={facility.id} value={facility.id}>
                    {facility.name} - {facility.location}
                  </option>
                ))}
              </select>
              <div className="text-xs text-gray-500 mt-1">
                {facilities ? `${facilities.length} facilities available` : 'Loading facilities...'}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Renewable Source</label>
              <select
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
              <label className="text-sm font-medium text-gray-700">Price per kg (ETH)</label>
              <input
                type="number"
                step="0.001"
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.01"
                min="0.001"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Production Date</label>
              <input
                type="date"
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={formData.productionDate}
                onChange={(e) => setFormData({ ...formData, productionDate: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Application Description *</label>
            <textarea
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your hydrogen production process, renewable energy sources, and compliance measures..."
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Supporting Documents</label>
            <textarea
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={2}
              value={formData.supportingDocuments}
              onChange={(e) => setFormData({ ...formData, supportingDocuments: e.target.value })}
              placeholder="List any supporting documents, certifications, or compliance records..."
            />
          </div>



          <Button
            onClick={submitCreditApplication}
            disabled={loading || !isConnected}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            size="lg"
          >
            {!isConnected ? "Connect Wallet First" : 
             loading ? "Submitting Application..." : "Submit Credit Application"}
          </Button>
        </CardContent>
      </Card>

      {/* Pending Applications */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Pending Applications
          </CardTitle>
          <p className="text-sm text-gray-600">
            Applications awaiting regulatory review and approval
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pendingApplications.map((credit) => (
              <div key={credit.id} className="flex items-center justify-between p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                <div className="flex-1">
                  <div className="font-medium text-lg">{credit.amount} kg H2</div>
                  <div className="text-sm text-gray-600">
                    {credit.renewableSource} • {facilities.find(f => f.id === credit.facilityId)?.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Applied: {credit.productionDate} • Price: ${credit.price}/kg
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="border-yellow-300 text-yellow-700">
                    Pending Review
                  </Badge>
                  <Badge variant="outline" className="border-blue-300 text-blue-700">
                    ${(credit.amount * credit.price).toFixed(2)}
                  </Badge>
                </div>
              </div>
            ))}
            {pendingApplications.length === 0 && (
                              <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No pending applications</p>
                  <p className="text-sm">Submit a credit application to get started</p>
                </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Approved Credits */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Approved Credits
          </CardTitle>
          <p className="text-sm text-gray-600">
            Credits that have been validated and are available in the marketplace
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {approvedCredits.map((credit) => (
              <div key={credit.id} className="flex items-center justify-between p-3 border border-green-200 rounded-lg bg-green-50">
                <div className="flex-1">
                  <div className="font-medium text-lg">{credit.amount} kg H2</div>
                  <div className="text-sm text-gray-600">
                    {credit.renewableSource} • {facilities.find(f => f.id === credit.facilityId)?.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Validated by: {credit.validatedBy} • Date: {credit.validatedAt}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="default" className="bg-green-600">
                    Approved
                  </Badge>
                  <Badge variant="outline" className="border-green-300 text-green-700">
                    ${(credit.amount * credit.price).toFixed(2)}
                  </Badge>
                </div>
              </div>
            ))}
            {approvedCredits.length === 0 && (
                              <div className="text-center py-8 text-gray-500">
                  <TrendingUp className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No approved credits yet</p>
                  <p className="text-sm">Credits will appear here after validation</p>
                </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
