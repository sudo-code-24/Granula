import bcrypt from "bcrypt";
import { prisma } from "./database";

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function createUser(email: string, password: string, roleId: number, profileData?: Record<string, unknown>) {
  const hashedPassword = await hashPassword(password);
  
  return prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      roleId,
      ...(profileData && {
        profile: {
          create: profileData
        }
      })
    }
  });
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: {
      role: true,
      profile: true
    }
  });
}

// Additional auth helper functions
export async function getUserById(id: number) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      role: true,
      profile: true
    }
  });
}

export async function updateUserPassword(id: number, newPassword: string) {
  const hashedPassword = await hashPassword(newPassword);
  
  return prisma.user.update({
    where: { id },
    data: { password: hashedPassword }
  });
}

export async function createUserProfile(userId: number, profileData: Record<string, unknown>) {
  return prisma.profile.create({
    data: {
      userId,
      ...profileData
    }
  });
}

export async function updateUserProfile(userId: number, profileData: Record<string, unknown>) {
  return prisma.profile.update({
    where: { userId },
    data: profileData
  });
}

export async function getUserProfile(userId: number) {
  return prisma.profile.findUnique({
    where: { userId },
    include: {
      user: true
    }
  });
}

