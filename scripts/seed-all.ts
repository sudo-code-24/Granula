import { PrismaClient } from '../app/generated/prisma';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seeding...');

  try {
    // 1. Seed Roles
    console.log('\n📋 Creating roles...');
    
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

    console.log('✅ Roles created');

    // 2. Seed Users
    console.log('\n👥 Creating users...');
    
    const hashedPassword = await bcrypt.hash('password123', 12);
    const adminPassword = await bcrypt.hash('admin123', 12);

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
    ];

    for (const userData of users) {
      const { profile, ...userCreateData } = userData;
      
      await prisma.user.upsert({
        where: { email: userData.email },
        update: {},
        create: {
          ...userCreateData,
          profile: {
            create: profile,
          },
        },
      });
    }

    console.log('✅ Users created');

    // 3. Seed Categories
    console.log('\n📂 Creating categories...');
    
    const categories = [
      {
        name: 'Electronics',
        description: 'Electronic devices and gadgets',
        slug: 'electronics',
        image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500',
      },
      {
        name: 'Clothing',
        description: 'Fashion and apparel',
        slug: 'clothing',
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500',
      },
      {
        name: 'Home & Garden',
        description: 'Home improvement and garden supplies',
        slug: 'home-garden',
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500',
      },
      {
        name: 'Sports',
        description: 'Sports and fitness equipment',
        slug: 'sports',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500',
      },
      {
        name: 'Books',
        description: 'Books and educational materials',
        slug: 'books',
        image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500',
      },
    ];

    for (const categoryData of categories) {
      await prisma.category.upsert({
        where: { slug: categoryData.slug },
        update: {},
        create: categoryData,
      });
    }

    console.log('✅ Categories created');

    // 4. Seed Brands
    console.log('\n🏷️ Creating brands...');
    
    const brands = [
      {
        name: 'Apple',
        description: 'Technology company known for innovative products',
        logo: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=200',
        website: 'https://apple.com',
      },
      {
        name: 'Samsung',
        description: 'Global technology leader in electronics',
        logo: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200',
        website: 'https://samsung.com',
      },
      {
        name: 'Nike',
        description: 'Athletic footwear and apparel company',
        logo: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=200',
        website: 'https://nike.com',
      },
      {
        name: 'Adidas',
        description: 'German multinational corporation for sports goods',
        logo: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=200',
        website: 'https://adidas.com',
      },
      {
        name: 'Sony',
        description: 'Japanese multinational conglomerate corporation',
        logo: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=200',
        website: 'https://sony.com',
      },
    ];

    for (const brandData of brands) {
      await prisma.brand.upsert({
        where: { name: brandData.name },
        update: {},
        create: brandData,
      });
    }

    console.log('✅ Brands created');

    // 5. Seed Products
    console.log('\n📦 Creating products...');
    
    const electronicsCategory = await prisma.category.findUnique({ where: { slug: 'electronics' } });
    const clothingCategory = await prisma.category.findUnique({ where: { slug: 'clothing' } });
    const homeCategory = await prisma.category.findUnique({ where: { slug: 'home-garden' } });
    const sportsCategory = await prisma.category.findUnique({ where: { slug: 'sports' } });
    const booksCategory = await prisma.category.findUnique({ where: { slug: 'books' } });

    const appleBrand = await prisma.brand.findUnique({ where: { name: 'Apple' } });
    const samsungBrand = await prisma.brand.findUnique({ where: { name: 'Samsung' } });
    const nikeBrand = await prisma.brand.findUnique({ where: { name: 'Nike' } });
    const adidasBrand = await prisma.brand.findUnique({ where: { name: 'Adidas' } });
    const sonyBrand = await prisma.brand.findUnique({ where: { name: 'Sony' } });

    const products = [
      {
        title: 'iPhone 15 Pro',
        description: 'The most advanced iPhone with titanium design and A17 Pro chip',
        price: 999.99,
        discountPercentage: 5,
        rating: 4.8,
        stock: 50,
        sku: 'IPH15PRO-256',
        slug: 'iphone-15-pro',
        thumbnail: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500',
        images: [
          'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500',
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500',
        ],
        tags: ['smartphone', 'apple', 'pro', 'titanium'],
        categoryId: electronicsCategory!.id,
        brandId: appleBrand!.id,
      },
      {
        title: 'Samsung Galaxy S24 Ultra',
        description: 'Premium Android smartphone with S Pen and advanced camera system',
        price: 1199.99,
        discountPercentage: 10,
        rating: 4.7,
        stock: 30,
        sku: 'SGS24U-512',
        slug: 'samsung-galaxy-s24-ultra',
        thumbnail: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500',
        images: [
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500',
          'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500',
        ],
        tags: ['smartphone', 'samsung', 'ultra', 's-pen'],
        categoryId: electronicsCategory!.id,
        brandId: samsungBrand!.id,
      },
      {
        title: 'Nike Air Max 270',
        description: 'Comfortable running shoes with Max Air cushioning',
        price: 150.00,
        discountPercentage: 15,
        rating: 4.5,
        stock: 100,
        sku: 'NAM270-BLK',
        slug: 'nike-air-max-270',
        thumbnail: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500',
        images: [
          'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500',
          'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500',
        ],
        tags: ['shoes', 'nike', 'running', 'air-max'],
        categoryId: clothingCategory!.id,
        brandId: nikeBrand!.id,
      },
      {
        title: 'Sony WH-1000XM5 Headphones',
        description: 'Industry-leading noise canceling wireless headphones',
        price: 399.99,
        discountPercentage: 0,
        rating: 4.9,
        stock: 25,
        sku: 'WH1000XM5-BLK',
        slug: 'sony-wh-1000xm5-headphones',
        thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
          'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500',
        ],
        tags: ['headphones', 'sony', 'noise-canceling', 'wireless'],
        categoryId: electronicsCategory!.id,
        brandId: sonyBrand!.id,
      },
      {
        title: 'Adidas Ultraboost 22',
        description: 'High-performance running shoes with responsive cushioning',
        price: 180.00,
        discountPercentage: 20,
        rating: 4.6,
        stock: 75,
        sku: 'AUB22-WHT',
        slug: 'adidas-ultraboost-22',
        thumbnail: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500',
        images: [
          'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500',
          'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500',
        ],
        tags: ['shoes', 'adidas', 'running', 'ultraboost'],
        categoryId: clothingCategory!.id,
        brandId: adidasBrand!.id,
      },
    ];

    for (const productData of products) {
      await prisma.product.upsert({
        where: { slug: productData.slug },
        update: {},
        create: productData,
      });
    }

    console.log('✅ Products created');

    // Display final summary
    const totalUsers = await prisma.user.count();
    const totalProfiles = await prisma.profile.count();
    const totalRoles = await prisma.role.count();
    const totalCategories = await prisma.category.count();
    const totalBrands = await prisma.brand.count();
    const totalProducts = await prisma.product.count();

    console.log('\n📊 Final Database Summary:');
    console.log(`👥 Users: ${totalUsers}`);
    console.log(`📋 Profiles: ${totalProfiles}`);
    console.log(`🎭 Roles: ${totalRoles}`);
    console.log(`📂 Categories: ${totalCategories}`);
    console.log(`🏷️ Brands: ${totalBrands}`);
    console.log(`📦 Products: ${totalProducts}`);

    console.log('\n🔐 Login Credentials:');
    console.log('Admin: admin@granula.com / admin123');
    console.log('Manager: manager@granula.com / password123');
    console.log('User: user@granula.com / password123');
    console.log('Test: test@granula.com / password123');

    console.log('\n✅ Comprehensive seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
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
