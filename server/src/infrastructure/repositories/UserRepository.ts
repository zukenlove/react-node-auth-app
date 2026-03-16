import { User } from "../../domain/entities/User";
import type { IUserRepository } from "../../domain/repositories/IUserRepository";
import { prisma } from "../../infrastructure/prisma/lib/prisma";
import { Role, type RoleId } from "../../domain/entities/Role";
import { PrismaUserWrapper } from "../prisma/wrapper";

export class PrismaUserRepository implements IUserRepository {

  async verifyEmail(code: string): Promise<User | null> {
    const record = await prisma.user.findFirst({
       where: { emailVerificationCode: code },
       include: { roles: { include: { role: true } } },
      });
    if (!record) return null;

    const user = User.rehydrate({
      id: record.id,
      username: record.username,
      email: record.email,
      passwordHash: record.password,
      roles: record.roles.map((r) => Role.rehydrate({ id: r.role.id as RoleId, title: r.role.title })),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      deletedAt: record.deletedAt,
      emailVerified: true, 
      emailVerificationCode: null, 
      emailVerificationExpiresAt: null, 
    });

    await this.update(user);
    return user;
  }

  async list(): Promise<User[]> {
    const records = await PrismaUserWrapper.list();

    return records.map(record =>
      User.rehydrate({
        id: record.id,
        username: record.username,
        email: record.email,
        passwordHash: record.password,
        roles: record.roles?.map(r =>
          Role.rehydrate({ id: r.role.id as RoleId, title: r.role.title })
        ) ?? [],
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        deletedAt: record.deletedAt,
        emailVerified: record.emailVerified,
        emailVerificationCode: record.emailVerificationCode,
        emailVerificationExpiresAt: record.emailVerificationExpiresAt,
      })
    );
  }

async findById(id: string): Promise<User | null> {
  const record = await PrismaUserWrapper.findById(id);
  if (!record) return null;

  return User.rehydrate({
    id: record.id,
    username: record.username,
    email: record.email,
    passwordHash: record.password,
    roles: record.roles?.map(r =>
      Role.rehydrate({
        id: r.role.id as RoleId,
        title: r.role.title,
      })
    ) ?? [],
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    deletedAt: record.deletedAt,
    emailVerified: record.emailVerified,
    emailVerificationCode: record.emailVerificationCode,
    emailVerificationExpiresAt: record.emailVerificationExpiresAt,
  });
}

  async findByEmail(email: string): Promise<User | null> {
    const record = await PrismaUserWrapper.findByEmail(email);
    if (!record) return null;

    return User.rehydrate({
      id: record.id,
      username: record.username,
      email: record.email,
      passwordHash: record.password,
         roles: record.roles?.map(r =>
      Role.rehydrate({
        id: r.role.id as RoleId,
        title: r.role.title,
      })
    ) ?? [],
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
      roles: saved.roles?.map(r =>
      Role.rehydrate({
        id: r.role.id as RoleId,
        title: r.role.title,
      })
    ) ?? [],
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
      deletedAt: saved.deletedAt,
      emailVerified: saved.emailVerified,
      emailVerificationCode: saved.emailVerificationCode,
      emailVerificationExpiresAt: saved.emailVerificationExpiresAt,
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

  async delete(id: string): Promise<void> {
    const existing = await PrismaUserWrapper.findById(id);
    if (!existing) throw new Error("User not found");

    await PrismaUserWrapper.delete(id);
  }
}