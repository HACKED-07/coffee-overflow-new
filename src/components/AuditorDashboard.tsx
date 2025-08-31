import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Eye, 
  FileText, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Activity,
  BarChart3,
  Download
} from "lucide-react";

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

interface AuditorDashboardProps {
  credits: Credit[];
  facilities: Facility[];
  transactions: any[];
  complianceData: any;
  onRefresh: () => void;
}

export default function AuditorDashboard({
  credits,
  facilities,
  transactions,
  complianceData,
  onRefresh
}: AuditorDashboardProps) {
  const [selectedReport, setSelectedReport] = useState<string>('overview');
  const { toast } = useToast();

  // Calculate compliance metrics
  const totalCredits = credits.length;
  const validatedCredits = credits.filter(c => c.status === 'validated' || c.isValidated).length;
  const pendingCredits = credits.filter(c => c.status === 'pending').length;
  const issuedCredits = credits.filter(c => c.status === 'issued').length;
  const retiredCredits = credits.filter(c => c.status === 'retired').length;
  
  const totalFacilities = facilities.length;
  const certifiedFacilities = facilities.filter(f => f.certificationStatus === 'certified').length;
  const pendingFacilities = facilities.filter(f => f.certificationStatus === 'pending').length;
  const suspendedFacilities = facilities.filter(f => f.certificationStatus === 'suspended').length;

  const complianceRate = totalCredits > 0 ? Math.round((validatedCredits / totalCredits) * 100) : 0;
  const facilityComplianceRate = totalFacilities > 0 ? Math.round((certifiedFacilities / totalFacilities) * 100) : 0;

  const generateReport = (type: string) => {
    toast({
      title: "Report Generated",
      description: `${type} report has been generated successfully`,
    });
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Compliance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Credit Compliance</p>
                <p className="text-2xl font-bold text-green-600">{complianceRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Facility Compliance</p>
                <p className="text-2xl font-bold text-blue-600">{facilityComplianceRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Credits</p>
                <p className="text-2xl font-bold text-purple-600">{totalCredits}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Facilities</p>
                <p className="text-2xl font-bold text-orange-600">{totalFacilities}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Credit Status Breakdown */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Credit Status Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{validatedCredits}</p>
              <p className="text-sm text-green-600">Validated</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">{pendingCredits}</p>
              <p className="text-sm text-yellow-600">Pending</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{issuedCredits}</p>
              <p className="text-sm text-blue-600">Issued</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-600">{retiredCredits}</p>
              <p className="text-sm text-gray-600">Retired</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Facility Status Breakdown */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Facility Status Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{certifiedFacilities}</p>
              <p className="text-sm text-green-600">Certified</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">{pendingFacilities}</p>
              <p className="text-sm text-yellow-600">Pending</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{suspendedFacilities}</p>
              <p className="text-sm text-red-600">Suspended</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderComplianceReport = () => (
    <div className="space-y-6">
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Compliance Issues
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingCredits > 0 && (
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium">Pending Credit Applications</span>
                </div>
                <Badge variant="secondary">{pendingCredits} pending</Badge>
              </div>
            )}
            
            {suspendedFacilities > 0 && (
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="font-medium">Suspended Facilities</span>
                </div>
                <Badge variant="destructive">{suspendedFacilities} suspended</Badge>
              </div>
            )}

            {pendingFacilities > 0 && (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Facilities Pending Certification</span>
                </div>
                <Badge variant="secondary">{pendingFacilities} pending</Badge>
              </div>
            )}

            {totalCredits === 0 && (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-300" />
                <p>No compliance issues detected</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex space-x-4">
        <Button onClick={() => generateReport('compliance')} className="flex items-center">
          <Download className="h-4 w-4 mr-2" />
          Generate Compliance Report
        </Button>
        <Button variant="outline" onClick={onRefresh}>
          Refresh Data
        </Button>
      </div>
    </div>
  );

  const renderAuditTrail = () => (
    <div className="space-y-6">
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transactions.length > 0 ? (
              transactions.map((transaction, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      transaction.status === 'confirmed' ? 'bg-green-500' : 
                      transaction.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-gray-500">
                        {new Date().toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={transaction.status === 'confirmed' ? 'default' : 
                            transaction.status === 'pending' ? 'secondary' : 'destructive'}
                  >
                    {transaction.status}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Activity className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center text-orange-800">
            <Eye className="h-6 w-6 mr-3" />
            Compliance Auditor Dashboard
          </CardTitle>
          <p className="text-orange-700">
            Monitor system compliance, generate reports, and track audit trails
          </p>
        </CardHeader>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex space-x-2 border-b">
        <Button
          variant={selectedReport === 'overview' ? 'default' : 'ghost'}
          onClick={() => setSelectedReport('overview')}
          className="flex items-center"
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Overview
        </Button>
        <Button
          variant={selectedReport === 'compliance' ? 'default' : 'ghost'}
          onClick={() => setSelectedReport('compliance')}
          className="flex items-center"
        >
          <AlertTriangle className="h-4 w-4 mr-2" />
          Compliance
        </Button>
        <Button
          variant={selectedReport === 'audit' ? 'default' : 'ghost'}
          onClick={() => setSelectedReport('audit')}
          className="flex items-center"
        >
          <Activity className="h-4 w-4 mr-2" />
          Audit Trail
        </Button>
      </div>

      {/* Content based on selected tab */}
      {selectedReport === 'overview' && renderOverview()}
      {selectedReport === 'compliance' && renderComplianceReport()}
      {selectedReport === 'audit' && renderAuditTrail()}
    </div>
  );
}
