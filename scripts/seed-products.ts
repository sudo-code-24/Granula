import { PrismaClient } from '../app/generated/prisma';

const prisma = new PrismaClient();

const sampleProducts = [
  {
    title: "iPhone 15 Pro",
    description: "The latest iPhone with titanium design and A17 Pro chip",
    price: 999.99,
    discountPercentage: 5,
    stock: 50,
    brandId: 1, // Apple
    categoryId: 1, // Electronics
    thumbnail: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400",
    images: [
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800",
    ],
    tags: ["smartphone", "apple", "premium", "camera"],
  },
  {
    title: "Samsung Galaxy S24",
    description: "Powerful Android smartphone with AI features",
    price: 899.99,
    discountPercentage: 10,
    stock: 75,
    brandId: 2, // Samsung
    categoryId: 1, // Electronics
    thumbnail: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400",
    images: [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800",
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800",
    ],
    tags: ["smartphone", "samsung", "android", "ai"],
  },
  {
    title: "MacBook Pro 16-inch",
    description: "Professional laptop with M3 Pro chip",
    price: 2499.99,
    discountPercentage: 0,
    stock: 25,
    brandId: 1, // Apple
    categoryId: 2, // Computers
    thumbnail: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800",
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800",
    ],
    tags: ["laptop", "apple", "professional", "m3"],
  },
  {
    title: "Dell XPS 15",
    description: "Premium Windows laptop with stunning display",
    price: 1899.99,
    discountPercentage: 15,
    stock: 40,
    brandId: 3, // Dell
    categoryId: 2, // Computers
    thumbnail: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400",
    images: [
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800",
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800",
    ],
    tags: ["laptop", "dell", "windows", "premium"],
  },
  {
    title: "Sony WH-1000XM5",
    description: "Industry-leading noise canceling headphones",
    price: 399.99,
    discountPercentage: 20,
    stock: 100,
    brandId: 4, // Sony
    categoryId: 3, // Audio
    thumbnail: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800",
    ],
    tags: ["headphones", "sony", "noise-canceling", "wireless"],
  },
  {
    title: "AirPods Pro 2nd Gen",
    description: "Active noise cancellation with spatial audio",
    price: 249.99,
    discountPercentage: 0,
    stock: 150,
    brandId: 1, // Apple
    categoryId: 3, // Audio
    thumbnail: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400",
    images: [
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
    ],
    tags: ["earbuds", "apple", "wireless", "noise-canceling"],
  },
  {
    title: "Nike Air Max 270",
    description: "Comfortable running shoes with Max Air cushioning",
    price: 150.99,
    discountPercentage: 25,
    stock: 200,
    brandId: 5, // Nike
    categoryId: 4, // Fashion
    thumbnail: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400",
    images: [
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800",
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800",
    ],
    tags: ["shoes", "nike", "running", "sneakers"],
  },
  {
    title: "Adidas Ultraboost 22",
    description: "Responsive running shoes with Boost technology",
    price: 180.99,
    discountPercentage: 10,
    stock: 120,
    brandId: 6, // Adidas
    categoryId: 4, // Fashion
    thumbnail: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400",
    images: [
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800",
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800",
    ],
    tags: ["shoes", "adidas", "running", "boost"],
  },
  {
    title: "Levi's 501 Original Jeans",
    description: "Classic straight-fit jeans in authentic denim",
    price: 89.99,
    discountPercentage: 30,
    stock: 300,
    brandId: 7, // Levi's
    categoryId: 4, // Fashion
    thumbnail: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400",
    images: [
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800",
      "https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=800",
    ],
    tags: ["jeans", "levis", "denim", "classic"],
  },
  {
    title: "Uniqlo Heattech T-Shirt",
    description: "Moisture-wicking base layer for all seasons",
    price: 19.99,
    discountPercentage: 0,
    stock: 500,
    brandId: 8, // Uniqlo
    categoryId: 4, // Fashion
    thumbnail: "https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=400",
    images: [
      "https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=800",
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800",
    ],
    tags: ["tshirt", "uniqlo", "baselayer", "moisture-wicking"],
  },
  {
    title: "KitchenAid Stand Mixer",
    description: "Professional-grade stand mixer for home baking",
    price: 399.99,
    discountPercentage: 15,
    stock: 60,
    brandId: 9, // KitchenAid
    categoryId: 5, // Home & Kitchen
    thumbnail: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
    images: [
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800",
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800",
    ],
    tags: ["mixer", "kitchen", "baking", "professional"],
  },
  {
    title: "Dyson V15 Detect Vacuum",
    description: "Cordless vacuum with laser dust detection",
    price: 749.99,
    discountPercentage: 5,
    stock: 80,
    brandId: 10, // Dyson
    categoryId: 5, // Home & Kitchen
    thumbnail: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800",
    ],
    tags: ["vacuum", "dyson", "cordless", "laser"],
  },
];

async function main() {
  console.log('🌱 Seeding products...');

  // Clear existing products
  await prisma.product.deleteMany({});
  console.log('🗑️  Cleared existing products');

// Create products
for (const productData of sampleProducts) {
  const product = await prisma.product.create({
    data: {
      ...productData,
      slug: productData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    },
  });
  console.log(`✅ Created product: ${product.title}`);
}

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
