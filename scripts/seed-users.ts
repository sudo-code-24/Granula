import { PrismaClient } from '../app/generated/prisma';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting user seeding...');

  try {
    // First, create roles if they don't exist
    console.log('📋 Creating roles...');
    
    const adminRole = await prisma.role.upsert({
      where: { name: 'admin' },
      update: {},
      create: {
        name: 'admin',
        description: 'Administrator with full access',
        level: 100,
      },
    });

    const userRole = await prisma.role.upsert({
      where: { name: 'user' },
      update: {},
      create: {
        name: 'user',
        description: 'Regular user with standard access',
        level: 10,
      },
    });

    const managerRole = await prisma.role.upsert({
      where: { name: 'manager' },
      update: {},
      create: {
        name: 'manager',
        description: 'Manager with elevated permissions',
        level: 50,
      },
    });

    console.log('✅ Roles created:', { adminRole, userRole, managerRole });

    // Hash passwords
    const hashedPassword = await bcrypt.hash('password123', 12);
    const adminPassword = await bcrypt.hash('admin123', 12);

    // Create users
    console.log('👥 Creating users...');

    const users = [
      {
        email: 'admin@granula.com',
        password: adminPassword,
        roleId: adminRole.id,
        profile: {
          firstName: 'Admin',
          lastName: 'User',
          position: 'System Administrator',
          department: 'IT',
          phone: '+1-555-0100',
          address: '123 Admin Street, Tech City, TC 12345',
          hireDate: new Date('2020-01-01'),
        },
      },
      {
        email: 'manager@granula.com',
        password: hashedPassword,
        roleId: managerRole.id,
        profile: {
          firstName: 'John',
          lastName: 'Manager',
          position: 'Store Manager',
          department: 'Operations',
          phone: '+1-555-0101',
          address: '456 Manager Ave, Business City, BC 54321',
          hireDate: new Date('2021-03-15'),
        },
      },
      {
        email: 'user@granula.com',
        password: hashedPassword,
        roleId: userRole.id,
        profile: {
          firstName: 'Jane',
          lastName: 'Customer',
          position: 'Customer',
          department: 'Retail',
          phone: '+1-555-0102',
          address: '789 Customer Lane, Shopping City, SC 67890',
          hireDate: new Date('2022-06-01'),
        },
      },
      {
        email: 'test@granula.com',
        password: hashedPassword,
        roleId: userRole.id,
        profile: {
          firstName: 'Test',
          lastName: 'User',
          position: 'Test Customer',
          department: 'Testing',
          phone: '+1-555-0103',
          address: '321 Test Street, Demo City, DC 11111',
          hireDate: new Date('2023-01-01'),
        },
      },
      {
        email: 'demo@granula.com',
        password: hashedPassword,
        roleId: userRole.id,
        profile: {
          firstName: 'Demo',
          lastName: 'User',
          position: 'Demo Customer',
          department: 'Demo',
          phone: '+1-555-0104',
          address: '654 Demo Road, Example City, EC 22222',
          hireDate: new Date('2023-05-15'),
        },
      },
    ];

    for (const userData of users) {
      const { profile, ...userCreateData } = userData;
      
      const user = await prisma.user.upsert({
        where: { email: userData.email },
        update: {},
        create: {
          ...userCreateData,
          profile: {
            create: profile,
          },
        },
        include: {
          profile: true,
          role: true,
        },
      });

      console.log(`✅ Created user: ${user.email} (${user.role.name})`);
    }

    // Create some additional test users without profiles
    const additionalUsers = [
      {
        email: 'simple@granula.com',
        password: hashedPassword,
        roleId: userRole.id,
      },
      {
        email: 'basic@granula.com',
        password: hashedPassword,
        roleId: userRole.id,
      },
    ];

    for (const userData of additionalUsers) {
      const user = await prisma.user.upsert({
        where: { email: userData.email },
        update: {},
        create: userData,
        include: {
          role: true,
        },
      });

      console.log(`✅ Created user: ${user.email} (${user.role.name}) - No profile`);
    }

    // Display summary
    const totalUsers = await prisma.user.count();
    const totalProfiles = await prisma.profile.count();
    const totalRoles = await prisma.role.count();

    console.log('\n📊 Seeding Summary:');
    console.log(`👥 Total Users: ${totalUsers}`);
    console.log(`📋 Total Profiles: ${totalProfiles}`);
    console.log(`🎭 Total Roles: ${totalRoles}`);

    console.log('\n🔐 Login Credentials:');
    console.log('Admin: admin@granula.com / admin123');
    console.log('Manager: manager@granula.com / password123');
    console.log('User: user@granula.com / password123');
    console.log('Test: test@granula.com / password123');
    console.log('Demo: demo@granula.com / password123');
    console.log('Simple: simple@granula.com / password123');
    console.log('Basic: basic@granula.com / password123');

    console.log('\n✅ User seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  });
