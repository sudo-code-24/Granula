import NextAuth from "next-auth";
import { AuditableFields } from "./product";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    role: {
      id: string;
      name: string;
      description: string | null;
      level: number;
      createdAt: Date;
      updatedAt: Date;
    };
    profile: {
      id: string;
      userId: string;
      firstName: string | null;
      lastName: string | null;
      position: string | null;
      department: string | null;
      phone: string | null;
      address: string | null;
      hireDate: Date | null;
    } | null;
  }

  interface Role extends AuditableFields {
    name: string;
    description: string | null;
    level: number;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      role: Role;
      profile: {
        id: string;
        userId: string;
        firstName: string | null;
        lastName: string | null;
        position: string | null;
        department: string | null;
        phone: string | null;
        address: string | null;
        hireDate: Date | null;
      } | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT extends AuditableFields {
    role: {
      description: string | null;
      level: number;
    };
    profile: {
      id: string;
      userId: string;
      firstName: string | null;
      lastName: string | null;
      position: string | null;
      department: string | null;
      phone: string | null;
      address: string | null;
      hireDate: Date | null;
    } | null;
  }
}
