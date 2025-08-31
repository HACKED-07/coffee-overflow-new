import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { ethereumService, EthereumConfig, CreditData, FacilityData } from '@/services/ethereum';
import { useToast } from '@/hooks/use-toast';

interface EthereumContextType {
  // Connection
  isConnected: boolean;
  account: string | null;
  network: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  
  // Wallet roles
  currentRole: 'producer' | 'buyer' | 'validator';
  switchRole: (role: 'producer' | 'buyer' | 'validator') => void;
  producerWallet: string | null;
  buyerWallet: string | null;
  validatorWallet: string | null;
  
  // Contract functions
  createFacility: (facilityData: FacilityData) => Promise<string>;
  issueCredits: (creditData: CreditData) => Promise<number>;
  validateCredits: (creditId: number) => Promise<void>;
  transferCredits: (creditId: string, to: string, amount: number) => Promise<string>;
  purchaseCredits: (creditId: number, amount: number) => Promise<string>;
  retireCredits: (creditId: string) => Promise<string>;
  getBalance: () => Promise<void>;
  

}

const EthereumContext = createContext<EthereumContextType | undefined>(undefined);

export const useEthereum = () => {
  const context = useContext(EthereumContext);
  if (context === undefined) {
    throw new Error('useEthereum must be used within an EthereumProvider');
  }
  return context;
};

interface EthereumProviderProps {
  children: ReactNode;
}

export const EthereumProvider: React.FC<EthereumProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>(null);
  const [ethereumConfig, setEthereumConfig] = useState<EthereumConfig | null>(null);
  
  // Wallet role management
  const [currentRole, setCurrentRole] = useState<'producer' | 'buyer' | 'validator'>('producer');
  const [producerWallet, setProducerWallet] = useState<string | null>(null);
  const [buyerWallet, setBuyerWallet] = useState<string | null>(null);
  const [validatorWallet, setValidatorWallet] = useState<string | null>(null);
  
  const { toast } = useToast();

  const connect = useCallback(async () => {
    try {
      // Switch to Sepolia testnet first
      await ethereumService.switchToSepolia();
      
      const config = await ethereumService.initialize();
      setEthereumConfig(config);
      setAccount(config.address);
      setNetwork(config.network);
      setIsConnected(true);
      
      // Set initial wallet based on current role
      switchRole(currentRole);
      
      toast({
        title: "Connected to Ethereum",
        description: `Connected to ${config.network} network`,
      });
    } catch (error: any) {
      console.error('Failed to connect to Ethereum:', error);
      
      let errorMessage = "Failed to connect to Ethereum blockchain";
      let errorTitle = "Connection Failed";
      
      // Handle specific error cases
      if (error.code === 4001) {
        errorMessage = "User rejected the connection request";
        errorTitle = "Connection Rejected";
      } else if (error.code === -32002) {
        errorMessage = "Please check MetaMask and approve the connection";
        errorTitle = "Pending Connection";
      } else if (error.message?.includes('network')) {
        errorMessage = "Please switch to Sepolia testnet in MetaMask";
        errorTitle = "Wrong Network";
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive"
      });
    }
  }, [currentRole, toast]);

  const disconnect = () => {
    setIsConnected(false);
    setAccount(null);
    setNetwork(null);
    setEthereumConfig(null);
    setProducerWallet(null);
    setBuyerWallet(null);
    setValidatorWallet(null);
    
    toast({
      title: "Disconnected",
      description: "Disconnected from Ethereum blockchain",
    });
  };

  const switchRole = (role: 'producer' | 'buyer' | 'validator') => {
    setCurrentRole(role);
    
    if (isConnected && account) {
      switch (role) {
        case 'producer':
          setProducerWallet(account);
          break;
        case 'buyer':
          setBuyerWallet(account);
          break;
        case 'validator':
          setValidatorWallet(account);
          break;
      }
    }
    
    toast({
      title: "Role Switched",
      description: `Now acting as ${role}`,
    });
  };

  const getBalance = async () => {
    if (!ethereumService) return;
    
    try {
      const balance = await ethereumService.getBalance();
      console.log('Wallet balance:', balance);
    } catch (error) {
      console.error('Failed to get balance:', error);
    }
  };

  const createFacility = async (facilityData: FacilityData): Promise<string> => {
    if (!isConnected) throw new Error('Not connected to Ethereum');
    
    try {
      const facilityId = await ethereumService.createFacility(facilityData);
      
      toast({
        title: "Facility Created",
        description: "Facility created successfully on Ethereum blockchain",
      });

      return facilityId;
    } catch (error) {
      console.error('Failed to create facility:', error);
      toast({
        title: "Facility Creation Failed",
        description: "Failed to create facility on Ethereum",
        variant: "destructive"
      });
      throw error;
    }
  };

  const issueCredits = async (creditData: CreditData): Promise<number> => {
    if (!isConnected) throw new Error('Not connected to Ethereum');
    
    try {
      const creditId = await ethereumService.issueCredits(creditData);
      
      toast({
        title: "Credits Issued",
        description: "Credits issued successfully on Ethereum blockchain",
      });

      return creditId;
    } catch (error) {
      console.error('Failed to issue credits:', error);
      toast({
        title: "Issuance Failed",
        description: "Failed to issue credits on Ethereum",
        variant: "destructive"
      });
      throw error;
    }
  };

  const validateCredits = async (creditId: number): Promise<void> => {
    if (!isConnected) throw new Error('Not connected to Ethereum');
    
    try {
      await ethereumService.validateCredits(creditId);
      
      toast({
        title: "Credits Validated",
        description: "Credits validated on Ethereum blockchain",
      });
    } catch (error) {
      console.error('Failed to validate credits:', error);
      toast({
        title: "Validation Failed",
        description: "Failed to validate credits on Ethereum",
        variant: "destructive"
      });
      throw error;
    }
  };

  const transferCredits = async (creditId: string, to: string, amount: number): Promise<string> => {
    if (!isConnected) throw new Error('Not connected to Ethereum');
    
    try {
      const signature = await ethereumService.transferCredits(creditId, to, amount);
      
      toast({
        title: "Credits Transferred",
        description: "Credits transferred successfully on Ethereum blockchain",
      });

      return signature;
    } catch (error) {
      console.error('Failed to transfer credits:', error);
      toast({
        title: "Transfer Failed",
        description: "Failed to transfer credits on Ethereum",
        variant: "destructive"
      });
      throw error;
    }
  };

  const purchaseCredits = async (creditId: number, amount: number): Promise<string> => {
    if (!isConnected) throw new Error('Not connected to Ethereum');
    
    try {
      const signature = await ethereumService.purchaseCredits(creditId, amount);
      
      toast({
        title: "Credits Purchased",
        description: "Credits purchased successfully from marketplace with ETH payment",
      });

      return signature;
    } catch (error) {
      console.error('Failed to purchase credits:', error);
      toast({
        title: "Purchase Failed",
        description: "Failed to purchase credits from marketplace",
        variant: "destructive"
      });
      throw error;
    }
  };

  const retireCredits = async (creditId: string): Promise<string> => {
    if (!isConnected) throw new Error('Not connected to Ethereum');
    
    try {
      const signature = await ethereumService.retireCredits(creditId);
      
      toast({
        title: "Credits Retired",
        description: "Credits retired successfully on Ethereum blockchain",
      });

      return signature;
    } catch (error) {
      console.error('Failed to retire credits:', error);
      toast({
        title: "Retirement Failed",
        description: "Failed to retire credits on Ethereum",
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

  const value: EthereumContextType = {
    isConnected,
    account,
    network,
    connect,
    disconnect,
    currentRole,
    switchRole,
    producerWallet,
    buyerWallet,
    validatorWallet,
    createFacility,
    issueCredits,
    validateCredits,
    transferCredits,
    purchaseCredits,
    retireCredits,
    getBalance,
  };

  return (
    <EthereumContext.Provider value={value}>
      {children}
    </EthereumContext.Provider>
  );
};
