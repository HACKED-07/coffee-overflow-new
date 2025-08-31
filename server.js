import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get all credits
app.get('/api/credits', async (req, res) => {
  try {
    const credits = await prisma.credit.findMany({
      include: {
        facility: true
      }
    });
    res.json(credits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get credits by status
app.get('/api/credits/status/:status', async (req, res) => {
  try {
    const { status } = req.params;
    const credits = await prisma.credit.findMany({
      where: { status },
      include: {
        facility: true
      }
    });
    res.json(credits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get facilities by producer
app.get('/api/facilities/producer/:producerId', async (req, res) => {
  try {
    const { producerId } = req.params;
    const facilities = await prisma.facility.findMany({
      where: { producerId, isActive: true }
    });
    res.json(facilities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create facility
app.post('/api/facilities', async (req, res) => {
  try {
    const facilityData = req.body;
    
    console.log('Creating facility with data:', facilityData);
    
    const facility = await prisma.facility.create({
      data: {
        id: facilityData.id,
        name: facilityData.name,
        location: facilityData.location,
        renewableSource: facilityData.renewableSource,
        capacity: parseFloat(facilityData.capacity),
        producerId: facilityData.producerId,
        isActive: true
      }
    });
    
    console.log('Facility created successfully:', facility);
    res.json(facility);
  } catch (error) {
    console.error('Error creating facility:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create credit
app.post('/api/credits', async (req, res) => {
  try {
    const creditData = req.body;
    
    // Transform data to match Prisma schema
    const transformedData = {
      // Convert date string to DateTime
      productionDate: new Date(creditData.productionDate),
      // Convert numeric strings to Decimal (Prisma handles this automatically)
      amount: parseFloat(creditData.amount),
      price: parseFloat(creditData.price),
      // Ensure renewableSource is valid enum value (capitalize first letter)
      renewableSource: creditData.renewableSource.charAt(0).toUpperCase() + creditData.renewableSource.slice(1).toLowerCase(),
      // Connect to existing facility
      facility: {
        connect: { id: creditData.facilityId }
      },
      // Connect to existing producer
      producer: {
        connect: { id: creditData.producerId }
      },
      // Set owner to producer initially
      owner: {
        connect: { id: creditData.producerId }
      },
      // Set default values
      status: 'pending',
      isValidated: false,
      isRetired: false
    };
    
    console.log('Creating credit with data:', transformedData);
    
    const credit = await prisma.credit.create({
      data: transformedData
    });
    
    console.log('Credit created successfully:', credit);
    res.json(credit);
  } catch (error) {
    console.error('Error creating credit:', error);
    res.status(500).json({ error: error.message });
  }
});

// Validate credit
app.put('/api/credits/:id/validate', async (req, res) => {
  try {
    const { id } = req.params;
    const { validatorId } = req.body;
    
    console.log(`Validating credit ${id} by validator ${validatorId}`);
    
    const credit = await prisma.credit.update({
      where: { id: id },
      data: {
        status: 'issued',
        isValidated: true,
        validatedBy: validatorId,
        validatedAt: new Date()
      }
    });
    
    console.log('Credit validated successfully:', credit);
    res.json(credit);
  } catch (error) {
    console.error('Error validating credit:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update credit ownership after purchase
app.put('/api/credits/:id/ownership', async (req, res) => {
  try {
    const { id } = req.params;
    const { newOwnerId, transactionHash } = req.body;
    
    console.log(`🔄 Transferring credit ${id} ownership to ${newOwnerId}`);
    
    const updatedCredit = await prisma.credit.update({
      where: { id: id },
      data: { 
        ownerId: newOwnerId,
        status: 'retired' // Mark as retired since it's been purchased
      }
    });
    
    console.log(`✅ Credit ${id} ownership transferred to ${newOwnerId}`);
    res.json(updatedCredit);
  } catch (error) {
    console.error('❌ Error transferring credit ownership:', error);
    res.status(500).json({ error: 'Failed to transfer credit ownership' });
  }
});

// Update credit blockchain ID
app.put('/api/credits/:id/blockchain', async (req, res) => {
  try {
    const { id } = req.params;
    const { blockchainId } = req.body;
    
    console.log(`🔄 Updating credit ${id} with blockchain ID: ${blockchainId}`);
    
    const updatedCredit = await prisma.credit.update({
      where: { id: id }, // id is already a string, no need to parse
      data: { 
        blockchainId: parseInt(blockchainId), // Parse blockchainId to int
        status: 'issued' // Also update status to issued
      }
    });
    
    console.log(`✅ Credit ${id} updated successfully with blockchain ID ${blockchainId}`);
    res.json(updatedCredit);
  } catch (error) {
    console.error('❌ Error updating credit blockchain ID:', error);
    res.status(500).json({ error: 'Failed to update credit blockchain ID' });
  }
});

// Clear all credits (for testing)
app.delete('/api/credits/clear', async (req, res) => {
  try {
    console.log('Clearing all credits for testing');
    
    const result = await prisma.credit.deleteMany({});
    
    console.log(`Cleared ${result.count} credits`);
    res.json({ message: `Cleared ${result.count} credits`, count: result.count });
  } catch (error) {
    console.error('Error clearing credits:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all facilities
app.get('/api/facilities', async (req, res) => {
  try {
    const facilities = await prisma.facility.findMany({
      include: {
        producer: true
      }
    });
    res.json(facilities);
  } catch (error) {
    console.error('Error fetching facilities:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get facilities by producer
app.get('/api/facilities/producer/:producerId', async (req, res) => {
  try {
    const { producerId } = req.params;
    const facilities = await prisma.facility.findMany({
      where: { producerId },
      include: {
        producer: true
      }
    });
    res.json(facilities);
  } catch (error) {
    console.error('Error fetching facilities by producer:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create transaction
app.post('/api/transactions', async (req, res) => {
  try {
    const transactionData = req.body;
    
    console.log('Creating transaction with data:', transactionData);
    
    const transaction = await prisma.transaction.create({
      data: {
        creditId: transactionData.creditId,
        fromUserId: transactionData.fromUserId,
        toUserId: transactionData.toUserId,
        amount: parseFloat(transactionData.amount),
        pricePerUnit: parseFloat(transactionData.pricePerUnit),
        totalPrice: parseFloat(transactionData.totalPrice),
        transactionType: transactionData.transactionType,
        transactionHash: transactionData.transactionHash,
        status: transactionData.status
      }
    });
    
    console.log('Transaction created successfully:', transaction);
    res.json(transaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all transactions
app.get('/api/transactions', async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        credit: {
          include: {
            facility: true,
            producer: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get transactions by user
app.get('/api/transactions/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [
          { fromUserId: userId },
          { toUserId: userId }
        ]
      },
      include: {
        credit: {
          include: {
            facility: true,
            producer: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching user transactions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get database stats
app.get('/api/stats', async (req, res) => {
  try {
    const [users, facilities, credits, transactions] = await Promise.all([
      prisma.user.count(),
      prisma.facility.count(),
      prisma.credit.count(),
      prisma.transaction.count()
    ]);

    res.json({
      users,
      facilities,
      credits,
      transactions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
