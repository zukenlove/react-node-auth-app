import { User } from "../../domain/entities/User";
import type { IUserRepository } from "../../domain/repositories/IUserRepository";
import { prisma } from "../../infrastructure/prisma/lib/prisma";
import { Role } from "../../domain/entities/Role";
import { PrismaUserWrapper } from "../prisma/wrapper";

export class PrismaUserRepository implements IUserRepository {

  async create(user: User): Promise<User> {
    const wrapper = PrismaUserWrapper.fromDomain(user);
    const saved = await wrapper.create();
    return User.rehydrate({
      id: saved.id,
      username: saved.username,
      email: saved.email,
      passwordHash: saved.passwordHash,
      roles: saved.role ? [saved.role as unknown as Role] : [],
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
      deletedAt:saved.deletedAt,
      emailVerified: saved.emailVerified,
      emailVerificationCode: saved.emailVerificationCode,
      emailVerificationExpiresAt: saved.emailVerificationExpiresAt,
    });
  }

//   async findById(id: string): Promise<User | null> {
//     const record = await prisma.user.findUnique({ where: { id } });
//     if (!record) return null;

//     return User.rehydrate({
//       id: record.id,
//       username: record.username,
//       email: record.email,
//       passwordHash: record.passwordHash,
//       roles: [Role.USER], // TODO: map actual roles if stored separately
//       createdAt: record.createdAt,
//       updatedAt: record.updatedAt,
//       deletedAt: record.isActive ? null : record.updatedAt,
//       emailVerified: record.emailVerified,
//       emailVerificationCode: record.emailVerificationCode,
//       emailVerificationExpiresAt: record.emailVerificationExpiresAt,
//     });
//   }

//   async findByEmail(email: string): Promise<User | null> {
//     const record = await prisma.user.findUnique({ where: { email } });
//     if (!record) return null;

//     return User.rehydrate({
//       id: record.id,
//       username: record.username,
//       email: record.email,
//       passwordHash: record.passwordHash,
//       roles: [Role.USER],
//       createdAt: record.createdAt,
//       updatedAt: record.updatedAt,
//       deletedAt: record.isActive ? null : record.updatedAt,
//       emailVerified: record.emailVerified,
//       emailVerificationCode: record.emailVerificationCode,
//       emailVerificationExpiresAt: record.emailVerificationExpiresAt,
//     });
//   }

//   async list(): Promise<User[]> {
//     const records = await prisma.user.findMany();
//     return records.map(record =>
//       User.rehydrate({
//         id: record.id,
//         username: record.username,
//         email: record.email,
//         passwordHash: record.passwordHash,
//         roles: [Role.USER],
//         createdAt: record.createdAt,
//         updatedAt: record.updatedAt,
//         deletedAt: record.isActive ? null : record.updatedAt,
//         emailVerified: record.emailVerified,
//         emailVerificationCode: record.emailVerificationCode,
//         emailVerificationExpiresAt: record.emailVerificationExpiresAt,
//       })
//     );
//   }

//   async update(user: User): Promise<User> {
//     const wrapper = PrismaUserWrapper.fromDomain(user);
//     const saved = await wrapper.update();
//     return User.rehydrate({
//       id: saved.id,
//       username: saved.username,
//       email: saved.email,
//       passwordHash: saved.passwordHash,
//       roles: [Role.USER],
//       createdAt: saved.createdAt,
//       updatedAt: saved.updatedAt,
//       deletedAt: saved.isActive ? null : saved.updatedAt,
//       emailVerified: saved.emailVerified,
//       emailVerificationCode: saved.emailVerificationCode,
//       emailVerificationExpiresAt: saved.emailVerificationExpiresAt,
//     });
//   }

//   async softDelete(id: string): Promise<void> {
//     await prisma.user.update({
//       where: { id },
//       data: { isActive: false, updatedAt: new Date() },
//     });
//   }
}