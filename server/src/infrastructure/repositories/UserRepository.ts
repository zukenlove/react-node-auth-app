import { User } from "../../domain/entities/User";
import type { IUserRepository } from "../../domain/repositories/IUserRepository";
import { prisma } from "../../infrastructure/prisma/lib/prisma";
import { Role, type RoleId } from "../../domain/entities/Role";
import { PrismaUserWrapper } from "../prisma/wrapper";

export class PrismaUserRepository implements IUserRepository {
  async verifyEmail(code: string): Promise<User | null> {
    const record = await prisma.user.findFirst({ where: { emailVerificationCode: code } });
    if (!record) return null;

    const user = User.rehydrate({
      id: record.id,
      username: record.username,
      email: record.email,
      passwordHash: record.password,
      roles: [Role.USER], // Adjust if roles are stored separately
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      deletedAt: record.deletedAt,
      emailVerified: true, // Mark as verified
      emailVerificationCode: null, // Clear the code
      emailVerificationExpiresAt: null, // Clear the expiration
    });

    // Update the user to save the verified status
    await this.update(user);

    return user;
  }




  async list(): Promise<User[]> {
    const records = await prisma.user.findMany({
        include: {
        roles: {
          include: {
            role: true, // include the actual Role object
          },
        },
      },
    });
    
    return records.map(record =>
       User.rehydrate({
        id: record.id,
        username: record.username,
        email: record.email,
        passwordHash: record.password,
        roles: record.roles.map((r) => Role.rehydrate({ id: r.role.id as RoleId, title: r.role.title })),
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        deletedAt: record.deletedAt,
        emailVerified: record.emailVerified,
        emailVerificationCode: record.emailVerificationCode,
        emailVerificationExpiresAt: record.emailVerificationExpiresAt,
      }));
  }

  async findById(id: string): Promise<User | null> {
    const record = await prisma.user.findUnique({ 
      where: { id }, 
      include: { roles: { include: { role: true } } } 
    });
    if (!record) return null;

    return User.rehydrate({
      id: record.id,
      username: record.username,
      email: record.email,
      passwordHash: record.password,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      deletedAt: record.deletedAt,
      emailVerified: record.emailVerified,
      emailVerificationCode: record.emailVerificationCode,
      emailVerificationExpiresAt: record.emailVerificationExpiresAt,
      roles: record.roles.map(r => Role.rehydrate({ id: r.role.id as RoleId, title: r.role.title })) // Map to Role entities
  
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const record = await prisma.user.findUnique({ where: { email } });
    if (!record) return null;

    return User.rehydrate({
      id: record.id,
      username: record.username,
      email: record.email,
      passwordHash: record.password,
      roles: [Role.USER], // Adjust if roles are stored separately
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      deletedAt: record.deletedAt,
      emailVerified: record.emailVerified,
      emailVerificationCode: record.emailVerificationCode,
      emailVerificationExpiresAt: record.emailVerificationExpiresAt,
    });
  }

  async update(user: User): Promise<User> {
    const wrapper = PrismaUserWrapper.fromDomain(user);
    const saved = await wrapper.update();
    return User.rehydrate({
      id: saved.id,
      username: saved.username,
      email: saved.email,
      passwordHash: saved.password,
      roles: [Role.USER], // Adjust if roles are stored separately
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
      deletedAt: saved.deletedAt,
      emailVerified: saved.emailVerified,
      emailVerificationCode: saved.emailVerificationCode,
      emailVerificationExpiresAt: saved.emailVerificationExpiresAt,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), updatedAt: new Date() },
    });
  }

  async create(user: User): Promise<User> {
    const wrapper = PrismaUserWrapper.fromDomain(user);

    const saved = await wrapper.create();
    return User.rehydrate({
      id: saved.id,
      username: saved.username,
      email: saved.email,
      passwordHash: saved.password,
      roles: saved.roles? [saved.roles as unknown as Role] : [],
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
      deletedAt:saved.deletedAt,
      emailVerified: saved.emailVerified,
      emailVerificationCode: saved.emailVerificationCode,
      emailVerificationExpiresAt: saved.emailVerificationExpiresAt,
    });
  }
}