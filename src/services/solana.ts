import { Connection, PublicKey, Keypair, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Program, AnchorProvider, web3, BN } from '@project-serum/anchor';
import { TOKEN_PROGRAM_ID, createMint, createAccount, mintTo, getAccount } from '@solana/spl-token';

// Solana network configuration
const NETWORK = 'devnet';
const RPC_ENDPOINT = 'https://api.devnet.solana.com';

// Program ID (matches the one in lib.rs)
const PROGRAM_ID = new PublicKey('8wPYeNWCLCaScHebGkozZKsaaAhoGWQwZKRGufozoXgn');

export interface SolanaConfig {
  connection: Connection;
  wallet: Keypair;
  program: Program;
}

export interface CreditData {
  amount: number;
  renewableSource: string;
  productionDate: string;
  facilityId: string;
}

export interface FacilityData {
  name: string;
  location: string;
  renewableSource: string;
  capacity: number;
}

class SolanaService {
  private connection: Connection;
  private wallet: Keypair | null = null;
  private program: Program | null = null;

  constructor() {
    this.connection = new Connection(RPC_ENDPOINT, 'confirmed');
  }

  // Initialize Solana connection and program
  async initialize(): Promise<SolanaConfig> {
    try {
      // Create a new wallet for demo purposes
      // In production, this would be connected to a real wallet like Phantom
      this.wallet = Keypair.generate();
      
      // Request airdrop for testing
      const airdropSignature = await this.connection.requestAirdrop(
        this.wallet.publicKey,
        2 * LAMPORTS_PER_SOL
      );
      await this.connection.confirmTransaction(airdropSignature);

      // Create provider
      const provider = new AnchorProvider(
        this.connection,
        {
          publicKey: this.wallet.publicKey,
          signTransaction: (tx: Transaction) => {
            tx.sign(this.wallet!);
            return Promise.resolve(tx);
          },
          signAllTransactions: (txs: Transaction[]) => {
            txs.forEach(tx => tx.sign(this.wallet!));
            return Promise.resolve(txs);
          },
        },
        { commitment: 'confirmed' }
      );

      // Load program (you'll need to generate the IDL)
      // For now, we'll create a mock program interface
      this.program = {
        provider,
        programId: PROGRAM_ID,
        // Mock methods - in production, these would be generated from IDL
      } as any;

      return {
        connection: this.connection,
        wallet: this.wallet,
        program: this.program,
      };
    } catch (error) {
      console.error('Failed to initialize Solana:', error);
      throw error;
    }
  }

  // Get wallet balance
  async getBalance(): Promise<number> {
    if (!this.wallet) throw new Error('Wallet not initialized');
    
    const balance = await this.connection.getBalance(this.wallet.publicKey);
    return balance / LAMPORTS_PER_SOL;
  }

  // Create a new facility on Solana
  async createFacility(facilityData: FacilityData): Promise<string> {
    if (!this.wallet || !this.program) throw new Error('Solana not initialized');

    try {
      // Generate a new account for the facility
      const facilityAccount = Keypair.generate();
      
      // Create transaction
      const transaction = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: this.wallet.publicKey,
          newAccountPubkey: facilityAccount.publicKey,
          lamports: await this.connection.getMinimumBalanceForRentExemption(200),
          space: 200,
          programId: PROGRAM_ID,
        })
      );

      // Sign and send transaction
      const signature = await this.connection.sendTransaction(transaction, [
        this.wallet,
        facilityAccount,
      ]);

      await this.connection.confirmTransaction(signature);

      console.log('Facility created on Solana:', signature);
      return facilityAccount.publicKey.toString();
    } catch (error) {
      console.error('Failed to create facility on Solana:', error);
      throw error;
    }
  }

  // Issue credits on Solana
  async issueCredits(creditData: CreditData): Promise<string> {
    if (!this.wallet || !this.program) throw new Error('Solana not initialized');

    try {
      // Generate a new account for the credit
      const creditAccount = Keypair.generate();
      
      // Create transaction
      const transaction = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: this.wallet.publicKey,
          newAccountPubkey: creditAccount.publicKey,
          lamports: await this.connection.getMinimumBalanceForRentExemption(300),
          space: 300,
          programId: PROGRAM_ID,
        })
      );

      // Sign and send transaction
      const signature = await this.connection.sendTransaction(transaction, [
        this.wallet,
        creditAccount,
      ]);

      await this.connection.confirmTransaction(signature);

      console.log('Credits issued on Solana:', signature);
      return creditAccount.publicKey.toString();
    } catch (error) {
      console.error('Failed to issue credits on Solana:', error);
      throw error;
    }
  }

  // Validate credits on Solana
  async validateCredits(creditAccountAddress: string): Promise<void> {
    if (!this.wallet || !this.program) throw new Error('Solana not initialized');

    try {
      const creditAccount = new PublicKey(creditAccountAddress);
      
      // In a real implementation, this would call the program's validate_credits instruction
      console.log('Credits validated on Solana:', creditAccountAddress);
    } catch (error) {
      console.error('Failed to validate credits on Solana:', error);
      throw error;
    }
  }

  // Transfer credits on Solana
  async transferCredits(creditAccountAddress: string, newOwner: string): Promise<void> {
    if (!this.wallet || !this.program) throw new Error('Solana not initialized');

    try {
      const creditAccount = new PublicKey(creditAccountAddress);
      const newOwnerPubkey = new PublicKey(newOwner);
      
      // In a real implementation, this would call the program's transfer_credits instruction
      console.log('Credits transferred on Solana:', creditAccountAddress, 'to:', newOwner);
    } catch (error) {
      console.error('Failed to transfer credits on Solana:', error);
      throw error;
    }
  }

  // Get network status
  getNetworkStatus(): string {
    return NETWORK;
  }

  // Get program ID
  getProgramId(): string {
    return PROGRAM_ID.toString();
  }
}

export const solanaService = new SolanaService();
