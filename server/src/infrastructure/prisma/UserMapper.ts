import { User } from "../../domain/entities/User";
import { Role, type RoleId } from "../../domain/entities/Role";
import type { PrismaUser } from "./PrismaUser";

export class UserMapper {
  static toDomain(prisma: PrismaUser): User {
    const roles: Role[] = prisma.roles.map(r =>
      Role.fromId(r.role.id as RoleId)
    );

    return User.rehydrate({
      id: prisma.id,
      username: prisma.username,
      email: prisma.email,
      passwordHash: prisma.password,
      roles: roles,
      createdAt: prisma.createdAt,
      updatedAt: prisma.updatedAt,
      deletedAt: prisma.deletedAt
    });
  }
}