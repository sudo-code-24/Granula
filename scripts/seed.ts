import { PrismaClient } from "../app/generated/prisma";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Create roles
  const adminRole = await prisma.role.upsert({
    where: { name: "admin" },
    update: {},
    create: {
      name: "admin",
      description: "Administrator with full access",
      level: 100,
    },
  });

  const userRole = await prisma.role.upsert({
    where: { name: "user" },
    update: {},
    create: {
      name: "user",
      description: "Regular user with limited access",
      level: 10,
    },
  });

  console.log("✅ Roles created:", { adminRole, userRole });

  // Create a test admin user
  const hashedPassword = await bcrypt.hash("admin123", 12);
  
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@granula.com" },
    update: {},
    create: {
      email: "admin@granula.com",
      password: hashedPassword,
      roleId: adminRole.id,
      profile: {
        create: {
          firstName: "Admin",
          lastName: "User",
          position: "System Administrator",
          department: "IT",
        },
      },
    },
    include: {
      role: true,
      profile: true,
    },
  });

  console.log("✅ Admin user created:", adminUser);

  // Create a test regular user
  const userPassword = await bcrypt.hash("user123", 12);
  
  const regularUser = await prisma.user.upsert({
    where: { email: "user@granula.com" },
    update: {},
    create: {
      email: "user@granula.com",
      password: userPassword,
      roleId: userRole.id,
      profile: {
        create: {
          firstName: "Regular",
          lastName: "User",
          position: "Employee",
          department: "General",
        },
      },
    },
    include: {
      role: true,
      profile: true,
    },
  });

  console.log("✅ Regular user created:", regularUser);

  console.log("🎉 Database seeding completed!");
  console.log("\n📋 Test credentials:");
  console.log("Admin: admin@granula.com / admin123");
  console.log("User: user@granula.com / user123");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
