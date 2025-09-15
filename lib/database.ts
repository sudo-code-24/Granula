import { PrismaClient } from "@/app/generated/prisma";

// Global variable to store the Prisma client instance
declare global {
  var __prisma: PrismaClient | undefined;
}

// Create a singleton Prisma client instance
const prisma = globalThis.__prisma || new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

// In development, store the client on the global object to prevent multiple instances
if (process.env.NODE_ENV === "development") {
  globalThis.__prisma = prisma;
}

export { prisma };

// Database connection helper
export async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    throw error;
  }
}

// Graceful shutdown helper
export async function disconnectDatabase() {
  try {
    await prisma.$disconnect();
    console.log("✅ Database disconnected successfully");
  } catch (error) {
    console.error("❌ Database disconnection failed:", error);
    throw error;
  }
}

// Health check helper
export async function checkDatabaseHealth() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: "healthy", timestamp: new Date().toISOString() };
  } catch (error) {
    return { 
      status: "unhealthy", 
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString() 
    };
  }
}
