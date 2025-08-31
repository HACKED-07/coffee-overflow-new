import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create users
  const producer = await prisma.user.upsert({
    where: { id: 'prod1' },
    update: {},
    create: {
      id: 'prod1',
      walletAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      name: 'Solar Hydrogen Corp',
      email: 'info@solarhydrogen.com',
      role: 'producer'
    }
  });

  const validator = await prisma.user.upsert({
    where: { id: 'validator1' },
    update: {},
    create: {
      id: 'validator1',
      walletAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      name: 'Green Standards Authority',
      email: 'standards@greenauth.com',
      role: 'validator'
    }
  });

  const buyer = await prisma.user.upsert({
    where: { id: 'buyer1' },
    update: {},
    create: {
      id: 'buyer1',
      walletAddress: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
      name: 'Steel Manufacturing Co',
      email: 'procurement@steelco.com',
      role: 'buyer'
    }
  });

  // Create facility
  const facility = await prisma.facility.upsert({
    where: { id: 'facility1' },
    update: {},
    create: {
      id: 'facility1',
      name: 'Solar Hydrogen Plant',
      location: 'California',
      renewableSource: 'Solar',
      capacity: 1000.00,
      producerId: 'prod1'
    }
  });

  console.log('✅ Database seeded successfully!');
  console.log('Users created:', { producer: producer.name, validator: validator.name, buyer: buyer.name });
  console.log('Facility created:', facility.name);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
