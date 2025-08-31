import { ethers } from 'ethers';
import GreenHydrogenCreditsABI from '../../artifacts/contracts/GreenHydrogenCredits.sol/GreenHydrogenCredits.json';
import { BLOCKCHAIN_CONFIG } from '@/config/blockchain';

// Contract configuration - Deployed contract address
const CONTRACT_ADDRESS = BLOCKCHAIN_CONFIG.CONTRACT_ADDRESS;
const NETWORK_CONFIG = {
  sepolia: {
    chainId: '0xaa36a7', // 11155111 in hex
    chainName: 'Sepolia Testnet',
    nativeCurrency: {
      name: 'Sepolia Ether',
      symbol: 'SEP',
      decimals: 18
    },
    rpcUrls: ['https://sepolia.infura.io/v3/'],
    blockExplorerUrls: ['https://sepolia.etherscan.io/']
  },
  hardhat: {
    chainId: '0x539', // 1337 in hex
    chainName: 'Hardhat',
    nativeCurrency: {
      name: 'Hardhat Ether',
      symbol: 'HETH',
      decimals: 18
    },
    rpcUrls: ['http://localhost:8545'],
    blockExplorerUrls: ['http://localhost:8545']
  }
};

// Types
export interface CreditData {
  amount: number;
  renewableSource: string;
  productionDate: string;
  facilityId: string;
  price: number;
  recipientPublicKey?: string; // Make recipient public key optional
}

export interface FacilityData {
  id?: string; // Optional facility ID from database
  name: string;
  location: string;
  renewableSource: string;
  capacity: number;
}

export interface EthereumConfig {
  provider: ethers.BrowserProvider;
  signer: ethers.JsonRpcSigner;
  contract: ethers.Contract;
  address: string;
  network: string;
}

export class EthereumService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private contract: ethers.Contract | null = null;
  private address: string | null = null;
  private network: string = '';

  // Initialize Ethereum connection
  async initialize(): Promise<EthereumConfig> {
    try {
      // Check if MetaMask is installed
      if (!window.ethereum) {
        throw new Error('MetaMask not found. Please install MetaMask from https://metamask.io/');
      }

      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      this.address = accounts[0];

      // Create provider and signer
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();

      // Get network info
      const network = await this.provider.getNetwork();
      this.network = network.name || 'unknown';

      // Create contract instance
      this.contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        GreenHydrogenCreditsABI.abi,
        this.signer
      );

      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          this.address = accounts[0];
        } else {
          this.address = null;
        }
      });

      // Listen for network changes
      window.ethereum.on('chainChanged', (chainId: string) => {
        window.location.reload();
      });

      console.log('✅ Ethereum initialized successfully');
      console.log('🔗 Network:', this.network);
      console.log('💼 Address:', this.address);
      console.log('📋 Contract:', CONTRACT_ADDRESS);

      return {
        provider: this.provider,
        signer: this.signer,
        contract: this.contract,
        address: this.address,
        network: this.network
      };

    } catch (error) {
      console.error('❌ Failed to initialize Ethereum:', error);
      throw error;
    }
  }

  // Get current configuration
  getConfig(): EthereumConfig | null {
    if (!this.provider || !this.signer || !this.contract || !this.address) {
      return null;
    }

    return {
      provider: this.provider,
      signer: this.signer,
      contract: this.contract,
      address: this.address,
      network: this.network
    };
  }

  // Check if connected
  isConnected(): boolean {
    return !!(this.provider && this.signer && this.contract && this.address);
  }

  // Get wallet address
  getAddress(): string | null {
    return this.address;
  }

  // Get network name
  getNetwork(): string {
    return this.network;
  }

  // Get balance
  async getBalance(): Promise<string> {
    if (!this.provider || !this.address) {
      throw new Error('Not connected to Ethereum');
    }

    const balance = await this.provider.getBalance(this.address);
    return ethers.formatEther(balance);
  }

  // Create facility
  async createFacility(facilityData: FacilityData): Promise<string> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      // Use the existing facility ID from the database instead of generating a new one
      const facilityId = facilityData.id || `facility_${Date.now()}`;
      
      const tx = await this.contract.certifyFacility(
        facilityId,
        facilityData.name,
        facilityData.location,
        facilityData.renewableSource,
        facilityData.capacity
      );

      console.log('🚀 Facility creation transaction sent:', tx.hash);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      console.log('✅ Facility created successfully:', receipt);

      return facilityId;
    } catch (error) {
      console.error('❌ Failed to create facility:', error);
      throw error;
    }
  }

  // Issue credits (contract doesn't support recipient public key yet)
  async issueCredits(creditData: CreditData, recipientPublicKey?: string): Promise<number> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const tx = await this.contract.issueCredits(
        creditData.amount,
        creditData.renewableSource,
        Math.floor(new Date(creditData.productionDate).getTime() / 1000),
        creditData.facilityId,
        ethers.parseEther(creditData.price.toString())
        // Note: recipientPublicKey is not supported by the current contract
      );

      console.log('🚀 Credit issuance transaction sent:', tx.hash);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      console.log('✅ Credits issued successfully:', receipt);

      // Get the credit ID from the transaction receipt
      // We need to parse the CreditGenerated event to get the actual credit ID
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = this.contract.interface.parseLog(log);
          return parsed.name === 'CreditGenerated';
        } catch {
          return false;
        }
      });

      if (event) {
        const parsed = this.contract.interface.parseLog(event);
        const creditId = parsed.args[0]; // First argument is creditId
        console.log('🎯 Credit ID from blockchain:', creditId.toString());
        return Number(creditId);
      } else {
        // Fallback: get the total credits count to determine the new credit ID
        const totalCredits = await this.contract.getTotalCredits();
        console.log('🎯 Credit ID (fallback):', totalCredits.toString());
        return Number(totalCredits);
      }
    } catch (error) {
      console.error('❌ Failed to issue credits:', error);
      throw error;
    }
  }

  // Validate credits
  async validateCredits(creditId: number): Promise<void> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const tx = await this.contract.validateCredits(creditId);
      console.log('🚀 Credit validation transaction sent:', tx.hash);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      console.log('✅ Credits validated successfully:', receipt);
    } catch (error) {
      console.error('❌ Failed to validate credits:', error);
      throw error;
    }
  }

  // Transfer credits
  async transferCredits(creditId: string, to: string, amount: number): Promise<string> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const tx = await this.contract.transferCredits(creditId, to, amount);
      console.log('🚀 Credit transfer transaction sent:', tx.hash);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      console.log('✅ Credits transferred successfully:', receipt);

      return tx.hash;
    } catch (error) {
      console.error('❌ Failed to transfer credits:', error);
      throw error;
    }
  }

  // Purchase credits from marketplace with ETH
  async purchaseCredits(creditId: number, amount: number): Promise<string> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      // Get credit details to calculate total price
      const credit = await this.contract.getCredit(creditId);
      
      // Use BigInt arithmetic to prevent overflow
      const priceWei = BigInt(credit.price.toString());
      const amountBigInt = BigInt(amount);
      const totalPrice = priceWei * amountBigInt;
      
      console.log('💰 Purchasing credits:', { creditId, amount, totalPrice: totalPrice.toString() });
      console.log('💰 Credit price from contract (wei):', credit.price.toString());
      console.log('💰 Total price (wei):', totalPrice.toString());
      
      // Purchase credits - contract handles ETH payment and price calculation
      // Note: price from contract is already in wei, so we don't need parseEther
      const tx = await this.contract.purchaseCredits(creditId, amount, { 
        value: totalPrice 
      });
      
      console.log('🚀 Credit purchase transaction sent:', tx.hash);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      console.log('✅ Credits purchased successfully:', receipt);

      return tx.hash;
    } catch (error) {
      console.error('❌ Failed to purchase credits:', error);
      throw error;
    }
  }

  // Retire credits
  async retireCredits(creditId: string): Promise<string> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const tx = await this.contract.retireCredits(creditId);
      console.log('🚀 Credit retirement transaction sent:', tx.hash);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      console.log('✅ Credits retired successfully:', receipt);

      return tx.hash;
    } catch (error) {
      console.error('❌ Failed to retire credits:', error);
      throw error;
    }
  }

  // Get credit details
  async getCredit(creditId: string): Promise<any> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const credit = await this.contract.getCredit(creditId);
      return credit;
    } catch (error) {
      console.error('❌ Failed to get credit:', error);
      throw error;
    }
  }

  // Get facility details
  async getFacility(facilityId: string): Promise<any> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const facility = await this.contract.getFacility(facilityId);
      return facility;
    } catch (error) {
      console.error('❌ Failed to get facility:', error);
      throw error;
    }
  }

  // Get producer credits
  async getProducerCredits(producer: string): Promise<string[]> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const credits = await this.contract.getProducerCredits(producer);
      return credits.map((id: any) => id.toString());
    } catch (error) {
      console.error('❌ Failed to get producer credits:', error);
      throw error;
    }
  }

  // Get owner credits
  async getOwnerCredits(owner: string): Promise<string[]> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const credits = await this.contract.getOwnerCredits(owner);
      return credits.map((id: any) => id.toString());
    } catch (error) {
      console.error('❌ Failed to get owner credits:', error);
      throw error;
    }
  }

  // Switch to Sepolia testnet
  async switchToSepolia(): Promise<void> {
    if (!window.ethereum) {
      throw new Error('MetaMask not found');
    }
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: NETWORK_CONFIG.sepolia.chainId }]
      });
    } catch (switchError: any) {
      // If the network doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [NETWORK_CONFIG.sepolia]
          });
        } catch (addError) {
          console.error('❌ Failed to add Sepolia network:', addError);
          throw addError;
        }
      } else {
        throw switchError;
      }
    }
  }

  // Switch to local Hardhat network (for development)
  async switchToHardhat(): Promise<void> {
    if (!window.ethereum) {
      throw new Error('MetaMask not found');
    }
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: NETWORK_CONFIG.hardhat.chainId }]
      });
    } catch (switchError: any) {
      // If the network doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [NETWORK_CONFIG.hardhat]
          });
        } catch (addError) {
          console.error('❌ Failed to add Hardhat network:', addError);
          throw addError;
        }
      } else {
        throw switchError;
      }
    }
  }

  // Disconnect
  disconnect(): void {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.address = null;
    this.network = '';
  }

  // Mint credits on the blockchain
  async mintCredits(
    amount: number,
    renewableSource: string,
    productionDate: number,
    facilityId: string,
    price: number
  ): Promise<number> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      console.log('🏭 Minting credits on blockchain:', {
        amount,
        renewableSource,
        productionDate,
        facilityId,
        price
      });

      // Convert price to wei
      const priceWei = ethers.parseEther(price.toString());
      
      // Mint credits using issueCredits function
      const tx = await this.contract.issueCredits(
        amount,
        renewableSource,
        productionDate,
        facilityId,
        priceWei
      );

      console.log('🚀 Credit minting transaction sent:', tx.hash);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      console.log('✅ Credits minted successfully:', receipt);

      // Get the credit ID from the event
      const event = receipt.logs.find((log: any) => 
        log.fragment?.name === 'CreditGenerated'
      );
      
      if (event) {
        const creditId = event.args[0];
        console.log('🎯 Minted credit ID:', creditId.toString());
        return Number(creditId);
      } else {
        throw new Error('Could not find CreditGenerated event');
      }
    } catch (error) {
      console.error('❌ Failed to mint credits:', error);
      throw error;
    }
  }

  // Certify facility on the blockchain
  async certifyFacility(
    facilityId: string,
    name: string,
    location: string,
    renewableSource: string,
    capacity: number
  ): Promise<string> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      console.log('🏭 Certifying facility on blockchain:', {
        facilityId,
        name,
        location,
        renewableSource,
        capacity
      });

      // Certify facility using certifyFacility function
      const tx = await this.contract.certifyFacility(
        facilityId,
        name,
        location,
        renewableSource,
        capacity
      );

      console.log('🚀 Facility certification transaction sent:', tx.hash);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      console.log('✅ Facility certified successfully:', receipt);

      return tx.hash;
    } catch (error) {
      console.error('❌ Failed to certify facility:', error);
      throw error;
    }
  }
}

// Create and export singleton instance
export const ethereumService = new EthereumService();

// Type declarations for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}
