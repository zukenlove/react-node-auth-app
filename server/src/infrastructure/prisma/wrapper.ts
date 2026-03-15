import { User } from "../../domain/entities/User";
import { prisma } from "./lib/prisma";
import type { PrismaUserWithRoles } from "./PrismaUser";

export class PrismaUserWrapper {
  constructor(private record: PrismaUserWithRoles) {}

  // Accept a domain User, which has getPasswordHash()
  public static fromDomain(user: User) {
    const record: PrismaUserWithRoles = {
      id: user.getId(),
      email: user.getEmail(),
      password: user.getPasswordHash(), // hashed in domain
      username: user.getUsername(),
      createdAt: user.getCreatedAt(),
      updatedAt: user.getUpdatedAt(),
      deletedAt: user.getDeletedAt(),
      emailVerificationCode: user.getEmailVerificationCode(),
      emailVerificationExpiresAt: user.getEmailVerificationExpiresAt(),
      emailVerified: user.isEmailVerified(),
      roles: Array.from(user.getRoles()).map(role => ({ 
        roleId: role.getId(), 
        userId: user.getId(), 
        id: 0, 
        createdAt: new Date(), 
        role: { 
          id: role.getId(), 
          title: role.getTitle(), 
          createdAt: new Date() } }))
    };
    return new PrismaUserWrapper(record);
  }

  // Save user in the database
  async create() {
    const { roles, password, ...rest } = this.record;

    const createdUser = await prisma.user.create({
      data: {
        ...rest,
        password, // already hashed
        roles: {
          create: Array.from(this.record.roles).map(role => ({
              role: {
                connectOrCreate: {
                  where: { id: role.roleId },
                  create: { id: role.roleId, title: role.role.title }
                }
              }
            }))
        }
      },
      include: { roles: { include: { role: true } } }
    });

    return createdUser;
  }

  
  async update() {
    const { roles, password, ...rest } = this.record;

    const updatedUser = await prisma.user.update({
      where: { id: this.record.id },
      data: {
        ...rest,
        password, // already hashed
        roles: {
          deleteMany: {}, // Clear existing roles
          create: Array.from(this.record.roles).map(role => ({
              role: {
                connectOrCreate: {
                  where: { id: role.roleId },
                  create: { id: role.roleId, title: role.role.title }
                }
              }
            }))
        }
      },
      include: { roles: { include: { role: true } } }
    });

    return updatedUser;     
}
}
