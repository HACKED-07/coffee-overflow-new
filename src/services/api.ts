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
  static async validateCredit(creditId: number, validatorId: string) {
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
