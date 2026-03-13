import type { RoleId } from "../../domain/entities/Role.js";

export interface PrismaUser {
  id: string;
  username: string;
  email: string;
  password: string;

  roles: {
    role: {
      id: RoleId;
      title: string;
    };
  }[];

  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}