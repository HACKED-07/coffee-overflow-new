import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { solanaService, SolanaConfig, CreditData, FacilityData } from '@/services/solana';
import { useToast } from '@/hooks/use-toast';

interface SolanaContextType {
  isConnected: boolean;
  isInitializing: boolean;
  walletAddress: string | null;
  balance: number | null;
  network: string;
  programId: string;
  connect: () => Promise<void>;
  disconnect: () => void;
  createFacility: (facilityData: FacilityData) => Promise<string>;
  issueCredits: (creditData: CreditData) => Promise<string>;
  validateCredits: (creditAccountAddress: string) => Promise<void>;
  transferCredits: (creditAccountAddress: string, newOwner: string) => Promise<void>;
  getBalance: () => Promise<void>;
}

const SolanaContext = createContext<SolanaContextType | undefined>(undefined);

export const useSolana = () => {
  const context = useContext(SolanaContext);
  if (context === undefined) {
    throw new Error('useSolana must be used within a SolanaProvider');
  }
  return context;
};

interface SolanaProviderProps {
  children: ReactNode;
}

export const SolanaProvider: React.FC<SolanaProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [solanaConfig, setSolanaConfig] = useState<SolanaConfig | null>(null);
  const { toast } = useToast();

  const network = solanaService.getNetworkStatus();
  const programId = solanaService.getProgramId();

  const connect = async () => {
    try {
      setIsInitializing(true);
      const config = await solanaService.initialize();
      setSolanaConfig(config);
      setWalletAddress(config.wallet.publicKey.toString());
      setIsConnected(true);
      
      // Get initial balance
      await getBalance();
      
      toast({
        title: "Connected to Solana",
        description: `Connected to ${network} network`,
      });
    } catch (error) {
      console.error('Failed to connect to Solana:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Solana blockchain",
        variant: "destructive"
      });
    } finally {
      setIsInitializing(false);
    }
  };

  const disconnect = () => {
    setSolanaConfig(null);
    setWalletAddress(null);
    setBalance(null);
    setIsConnected(false);
    
    toast({
      title: "Disconnected",
      description: "Disconnected from Solana blockchain",
    });
  };

  const getBalance = async () => {
    if (!isConnected) return;
    
    try {
      const walletBalance = await solanaService.getBalance();
      setBalance(walletBalance);
    } catch (error) {
      console.error('Failed to get balance:', error);
    }
  };

  const createFacility = async (facilityData: FacilityData): Promise<string> => {
    if (!isConnected) throw new Error('Not connected to Solana');
    
    try {
      const facilityAddress = await solanaService.createFacility(facilityData);
      
      toast({
        title: "Facility Created",
        description: "Facility created on Solana blockchain",
      });
      
      return facilityAddress;
    } catch (error) {
      console.error('Failed to create facility:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create facility on Solana",
        variant: "destructive"
      });
      throw error;
    }
  };

  const issueCredits = async (creditData: CreditData): Promise<string> => {
    if (!isConnected) throw new Error('Not connected to Solana');
    
    try {
      const creditAddress = await solanaService.issueCredits(creditData);
      
      toast({
        title: "Credits Issued",
        description: "Credits issued on Solana blockchain",
      });
      
      return creditAddress;
    } catch (error) {
      console.error('Failed to issue credits:', error);
      toast({
        title: "Issuance Failed",
        description: "Failed to issue credits on Solana",
        variant: "destructive"
      });
      throw error;
    }
  };

  const validateCredits = async (creditAccountAddress: string): Promise<void> => {
    if (!isConnected) throw new Error('Not connected to Solana');
    
    try {
      await solanaService.validateCredits(creditAccountAddress);
      
      toast({
        title: "Credits Validated",
        description: "Credits validated on Solana blockchain",
      });
    } catch (error) {
      console.error('Failed to validate credits:', error);
      toast({
        title: "Validation Failed",
        description: "Failed to validate credits on Solana",
        variant: "destructive"
      });
      throw error;
    }
  };

  const transferCredits = async (creditAccountAddress: string, newOwner: string): Promise<void> => {
    if (!isConnected) throw new Error('Not connected to Solana');
    
    try {
      await solanaService.transferCredits(creditAccountAddress, newOwner);
      
      toast({
        title: "Credits Transferred",
        description: "Credits transferred on Solana blockchain",
      });
    } catch (error) {
      console.error('Failed to transfer credits:', error);
      toast({
        title: "Transfer Failed",
        description: "Failed to transfer credits on Solana",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Auto-refresh balance periodically
  useEffect(() => {
    if (isConnected) {
      const interval = setInterval(getBalance, 10000); // Every 10 seconds
      return () => clearInterval(interval);
    }
  }, [isConnected]);

  const value: SolanaContextType = {
    isConnected,
    isInitializing,
    walletAddress,
    balance,
    network,
    programId,
    connect,
    disconnect,
    createFacility,
    issueCredits,
    validateCredits,
    transferCredits,
    getBalance,
  };

  return (
    <SolanaContext.Provider value={value}>
      {children}
    </SolanaContext.Provider>
  );
};
