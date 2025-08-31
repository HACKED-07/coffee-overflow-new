import { PrismaClient } from '@prisma/client';

// Create Prisma client instance
const prisma = new PrismaClient();

// Database service class using Prisma
export class PrismaService {
  // Users
  async createUser(userData: {
    id: string;
    walletAddress: string;
    name: string;
    email?: string;
    role: 'producer' | 'validator' | 'buyer';
  }) {
    return await prisma.user.create({
      data: userData
    });
  }

  async getUserById(id: string) {
    return await prisma.user.findUnique({
      where: { id }
    });
  }

  async getUserByWalletAddress(walletAddress: string) {
    return await prisma.user.findUnique({
      where: { walletAddress }
    });
  }

  async updateUser(id: string, updates: any) {
    return await prisma.user.update({
      where: { id },
      data: updates
    });
  }

  // Facilities
  async createFacility(facilityData: {
    id: string;
    name: string;
    location: string;
    renewableSource: string;
    capacity: number;
    producerId: string;
  }) {
    return await prisma.facility.create({
      data: facilityData
    });
  }

  async getFacilityById(id: string) {
    return await prisma.facility.findUnique({
      where: { id }
    });
  }

  async getFacilitiesByProducer(producerId: string) {
    return await prisma.facility.findMany({
      where: { producerId, isActive: true }
    });
  }

  async updateFacility(id: string, updates: any) {
    return await prisma.facility.update({
      where: { id },
      data: updates
    });
  }

  // Credits
  async createCredit(creditData: {
    blockchainId?: string;
    creditType: string;
    amount: number;
    productionDate: Date;
    producerId: string;
    facilityId: string;
    renewableSource: string;
    price: number;
    status: 'pending' | 'validated' | 'issued' | 'retired';
    ownerId: string;
  }) {
    return await prisma.credit.create({
      data: creditData
    });
  }

  async getCreditById(id: number) {
    return await prisma.credit.findUnique({
      where: { id }
    });
  }

  async getCreditsByProducer(producerId: string) {
    return await prisma.credit.findMany({
      where: { producerId }
    });
  }

  async getCreditsByOwner(ownerId: string) {
    return await prisma.credit.findMany({
      where: { ownerId }
    });
  }

  async getCreditsByStatus(status: string) {
    return await prisma.credit.findMany({
      where: { status: status as any }
    });
  }

  async getAvailableCredits() {
    return await prisma.credit.findMany({
      where: { 
        status: 'issued', 
        isRetired: false 
      },
      include: {
        facility: true
      }
    });
  }

  async updateCredit(id: number, updates: any) {
    return await prisma.credit.update({
      where: { id },
      data: updates
    });
  }

  async validateCredit(id: number, validatorId: string) {
    return await prisma.credit.update({
      where: { id },
      data: {
        status: 'issued',
        isValidated: true,
        validatedBy: validatorId,
        validatedAt: new Date()
      }
    });
  }

  // Transactions
  async createTransaction(transactionData: {
    transactionHash?: string;
    creditId: number;
    fromUserId: string;
    toUserId: string;
    amount: number;
    pricePerUnit: number;
    totalPrice: number;
    transactionType: 'transfer' | 'purchase' | 'retirement';
  }) {
    return await prisma.transaction.create({
      data: transactionData
    });
  }

  async getTransactionsByUser(userId: string) {
    return await prisma.transaction.findMany({
      where: {
        OR: [
          { fromUserId: userId },
          { toUserId: userId }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getTransactionByHash(hash: string) {
    return await prisma.transaction.findUnique({
      where: { transactionHash: hash }
    });
  }

  // Marketplace
  async getMarketplaceCredits() {
    return await prisma.credit.findMany({
      where: { 
        status: 'issued', 
        isRetired: false 
      },
      include: {
        facility: true
      }
    });
  }

  // Utility methods
  async getDatabaseStats() {
    const [users, facilities, credits, transactions] = await Promise.all([
      prisma.user.count(),
      prisma.facility.count(),
      prisma.credit.count(),
      prisma.transaction.count()
    ]);

    return {
      users,
      facilities,
      credits,
      transactions
    };
  }

  async close() {
    await prisma.$disconnect();
  }
}

// Export singleton instance
export const prismaService = new PrismaService();
export default prismaService;
