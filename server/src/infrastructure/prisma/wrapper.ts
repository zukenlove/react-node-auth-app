import type { PrismaUser } from "./PrismaUser";
import { User } from "../../domain/entities/User";
import { prisma } from "./lib/prisma";

export class PrismaUserWrapper {
  constructor(private record: PrismaUser) {}

  static fromDomain(user: User): PrismaUserWrapper {
    const record: PrismaUser = {
      id: user.getId(),
      username: user.getUsername(),
      email: user.getEmail(),
      passwordHash: user.getPasswordHash(),
      role: [...user.getRoles()][0]?.toString() ?? "",
      createdAt: user.getCreatedAt(),
      updatedAt: user.getUpdatedAt(),
      deletedAt: user.getDeletedAt(),
      emailVerified: user.isEmailVerified(),
      emailVerificationCode: user.getEmailVerificationCode() ?? null,
      emailVerificationExpiresAt: user.getEmailVerificationExpiresAt(),
    };

    return new PrismaUserWrapper(record);
  }

  /** Create a new record in the DB */
  async create(): Promise<PrismaUser> {
    const { passwordHash,role, ...rest } = this.record;

    const saved = await prisma.user.create({
      data: { ...rest, password: passwordHash }
    });

    return {
      ...saved,
      passwordHash: saved.password,
    };
  }

  /** Update an existing record in the DB */
  async update(): Promise<PrismaUser> {
    return prisma.user.update({
      where: { id: this.record.id },
      data: this.record,
    });
  }

  /** Save: create if not exists, otherwise update */
  async save(): Promise<PrismaUser> {
    const exists = await prisma.user.findUnique({ where: { id: this.record.id } });
    return exists ? this.update() : this.create();
  }

  /** Access the raw Prisma record if needed */
  getRecord(): PrismaUser {
    return this.record;
  }
}