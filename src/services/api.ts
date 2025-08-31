const API_BASE_URL = 'http://localhost:3001/api';

export class ApiService {
  // Get credits by status
  static async getCreditsByStatus(status: string) {
    const response = await fetch(`${API_BASE_URL}/credits/status/${status}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch credits: ${response.statusText}`);
    }
    return response.json();
  }

  // Get all credits
  static async getAllCredits() {
    const response = await fetch(`${API_BASE_URL}/credits`);
    if (!response.ok) {
      throw new Error(`Failed to fetch credits: ${response.statusText}`);
    }
    return response.json();
  }

  // Get facilities by producer
  static async getFacilitiesByProducer(producerId: string) {
    const response = await fetch(`${API_BASE_URL}/facilities/producer/${producerId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch facilities: ${response.statusText}`);
    }
    return response.json();
  }

  // Get all facilities
  static async getAllFacilities() {
    const response = await fetch(`${API_BASE_URL}/facilities`);
    if (!response.ok) {
      throw new Error(`Failed to fetch facilities: ${response.statusText}`);
    }
    return response.json();
  }

  // Create credit
  static async createCredit(creditData: any) {
    const response = await fetch(`${API_BASE_URL}/credits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(creditData),
    });
    if (!response.ok) {
      throw new Error(`Failed to create credit: ${response.statusText}`);
    }
    return response.json();
  }

  // Validate credit
  static async validateCredit(creditId: string, validatorId: string) {
    const response = await fetch(`${API_BASE_URL}/credits/${creditId}/validate`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ validatorId }),
    });
    if (!response.ok) {
      throw new Error(`Failed to validate credit: ${response.statusText}`);
    }
    return response.json();
  }

  // Update credit blockchain ID
  static async updateCreditBlockchainId(creditId: string, blockchainId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/credits/${creditId}/blockchain`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ blockchainId }),
    });

    if (!response.ok) {
      throw new Error('Failed to update credit blockchain ID');
    }
  }

  // Update credit ownership after purchase
  static async updateCreditOwnership(creditId: string, newOwnerId: string, transactionHash: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/credits/${creditId}/ownership`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ newOwnerId, transactionHash }),
    });

    if (!response.ok) {
      throw new Error('Failed to update credit ownership');
    }
  }

  // Record a credit purchase transaction
  static async recordPurchase(creditId: string, buyerId: string, amount: number, price: number, transactionHash: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        creditId,
        fromUserId: 'producer1', // Credits are initially owned by producer
        toUserId: buyerId,
        amount,
        pricePerUnit: price,
        totalPrice: amount * price,
        transactionType: 'purchase',
        transactionHash,
        status: 'confirmed'
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to record purchase transaction');
    }
  }

  // Get all transactions for audit purposes
  static async getAllTransactions(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/transactions`);
    if (!response.ok) {
      throw new Error(`Failed to fetch transactions: ${response.statusText}`);
    }
    return response.json();
  }

  // Get transactions by user
  static async getTransactionsByUser(userId: string): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/transactions/user/${userId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch user transactions: ${response.statusText}`);
    }
    return response.json();
  }



  // Get database stats
  static async getDatabaseStats() {
    const response = await fetch(`${API_BASE_URL}/stats`);
    if (!response.ok) {
      throw new Error(`Failed to fetch stats: ${response.statusText}`);
    }
    return response.json();
  }
}

export default ApiService;
