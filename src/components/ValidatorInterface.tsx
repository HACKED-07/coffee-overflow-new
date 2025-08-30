import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Shield, CheckCircle, Clock, AlertTriangle, Eye } from 'lucide-react';

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

interface ValidatorInterfaceProps {
  credits: Credit[];
  onRefresh: () => void;
}

export const ValidatorInterface: React.FC<ValidatorInterfaceProps> = ({ credits, onRefresh }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const pendingCredits = credits.filter(credit => !credit.isValidated && !credit.isRetired);
  const validatedCredits = credits.filter(credit => credit.isValidated);

  const handleValidateCredit = async (creditId: string) => {
    setLoading(creditId);
    try {
      const response = await fetch(`/api/credits/${creditId}/validate`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          validatedBy: 'validator-1'
        })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Credit validated successfully! Data is now persistent.",
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

  const getCreditStatus = (credit: Credit) => {
    if (credit.isRetired) return { label: 'Retired', variant: 'secondary' as const };
    if (credit.isValidated) return { label: 'Validated', variant: 'default' as const };
    return { label: 'Pending', variant: 'outline' as const };
  };

  return (
    <div className="space-y-6">
      {/* Validator Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Validation</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCredits.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting Approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Validated Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {validatedCredits.filter(c => {
                const today = new Date().toDateString();
                return c.validatedAt && new Date(c.validatedAt).toDateString() === today;
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">Credits Approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Validated</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{validatedCredits.length}</div>
            <p className="text-xs text-muted-foreground">All Time</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Credits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pending Validation
          </CardTitle>
          <CardDescription>Review and validate green hydrogen credits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingCredits.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-lg font-medium text-green-600">All credits validated!</p>
                <p className="text-muted-foreground">No pending credits to review</p>
              </div>
            ) : (
              pendingCredits.map((credit) => (
                <div key={credit.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{credit.amount} kg - {credit.renewableSource}</h4>
                        <Badge variant="outline" className="text-xs">
                          {credit.creditType}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Producer: {credit.producerId} • Facility: {credit.facilityId}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Production Date: {credit.productionDate} • Price: ${credit.price}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleValidateCredit(credit.id)}
                        disabled={loading === credit.id}
                        className="flex items-center gap-2"
                      >
                        {loading === credit.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Validating...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            Validate
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
                      <span className="font-medium">Source:</span>
                      <p className="text-muted-foreground">{credit.renewableSource}</p>
                    </div>
                    <div>
                      <span className="font-medium">Created:</span>
                      <p className="text-muted-foreground">
                        {new Date(credit.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>
                      <Badge variant="outline" className="text-xs">
                        Pending Review
                      </Badge>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recently Validated */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Recently Validated
          </CardTitle>
          <CardDescription>Credits you've recently approved</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {validatedCredits.slice(0, 5).map((credit) => (
              <div key={credit.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{credit.amount} kg - {credit.renewableSource}</p>
                  <p className="text-sm text-muted-foreground">
                    {credit.producerId} • {credit.facilityId}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="text-xs">
                    Validated
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {credit.validatedAt && new Date(credit.validatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
            {validatedCredits.length === 0 && (
              <p className="text-center text-muted-foreground py-4">No validated credits yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Validation Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Validation Guidelines
          </CardTitle>
          <CardDescription>Standards for credit validation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Renewable Energy Source</p>
                <p className="text-muted-foreground">Verify the facility uses solar, wind, or hydro power</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Production Documentation</p>
                <p className="text-muted-foreground">Ensure production dates and amounts are accurate</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Facility Verification</p>
                <p className="text-muted-foreground">Confirm facility is active and properly registered</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium">Double-Counting Prevention</p>
                <p className="text-muted-foreground">Ensure credits haven't been previously issued or retired</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
