import type { Prisma } from "@prisma/client";
import { User } from "../../domain/entities/User";
import { prisma } from "./lib/prisma";
import type { PrismaUserWithRoles } from "./PrismaUser";

export class PrismaUserWrapper {
  constructor(private record: PrismaUserWithRoles) {}

  /** Map domain User → Prisma record */
  public static fromDomain(user: User) {
    const record: PrismaUserWithRoles = {
      id: user.getId(),
      email: user.getEmail(),
      password: user.getPasswordHash(),
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
          createdAt: new Date(),
        },
      })),
    };
    return new PrismaUserWrapper(record);
  }

  /** CREATE user in DB */
  async create() {
    const { roles, password, ...rest } = this.record;
    return prisma.user.create({
      data: {
        ...rest,
        password,
        roles: {
          create: roles.map(r => ({
            role: {
              connectOrCreate: {
                where: { id: r.roleId },
                create: { id: r.roleId, title: r.role.title },
              },
            },
          })),
        },
      },
      include: { roles: { include: { role: true } } },
    });
  }

  /** PARTIAL UPDATE user in DB */
  async update() {
    const { roles, password, ...rest } = this.record;

    // Build data dynamically so only defined fields are updated
    const data: Prisma.UserUpdateInput = {
      updatedAt: new Date(), // always update
    };

    if (rest.username !== undefined) data.username = rest.username;
    if (rest.email !== undefined) data.email = rest.email;
    if (password !== undefined) data.password = password;
    if (rest.deletedAt !== undefined) data.deletedAt = rest.deletedAt;
    if (rest.emailVerified !== undefined) data.emailVerified = rest.emailVerified;
    if (rest.emailVerificationCode !== undefined)
      data.emailVerificationCode = rest.emailVerificationCode;
    if (rest.emailVerificationExpiresAt !== undefined)
      data.emailVerificationExpiresAt = rest.emailVerificationExpiresAt;

    // Handle roles separately if provided
    if (roles && roles.length > 0) {
      data.roles = {
        deleteMany: {}, // clear existing roles
        create: roles.map(r => ({
          role: {
            connectOrCreate: {
              where: { id: r.roleId },
              create: { id: r.roleId, title: r.role.title },
            },
          },
        })),
      };
    }

    return prisma.user.update({
      where: { id: this.record.id },
      data,
      include: { roles: { include: { role: true } } },
    });
  }

  /** Find by ID */
   static async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: { roles: { include: { role: true } } },
    });
  }

  /** Find by email */
   static async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: { roles: { include: { role: true } } },
    });
  }

  /** Soft delete */
   static async delete(id: string) {
    return prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), updatedAt: new Date() },
    });
  }
  
  /** List users  **/
    static async list() {
    return prisma.user.findMany({
      where: { deletedAt: null },
      include: { roles: { include: { role: true } } },
    });
  }
}

