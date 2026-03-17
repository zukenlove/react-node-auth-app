import { prisma } from "./lib/prisma";
import { User } from "../../domain/aggregate/User";
import { UserMapper } from "../mappers/UserMapper";

export class PrismaUserWrapper {

  /* ----------------------------- CREATE ----------------------------- */

  static async create(user: User) {

    const data = UserMapper.toPersistence(user);

    return prisma.user.create({
      data: {
        ...data,
        roles: {
          create: user.getRoles().map(role => ({
            role: {
              connectOrCreate: {
                where: { id: role.getId() },
                create: {
                  id: role.getId(),
                  title: role.getTitle()
                }
              }
            }
          }))
        }
      },
      include: { roles: { include: { role: true } } }
    });
  }

  /* ----------------------------- UPDATE ----------------------------- */

  static async update(user: User) {

    const data = UserMapper.toPersistence(user);

    return prisma.user.update({
      where: { id: user.getId() },
      data: {
        ...data,
        roles: {
          deleteMany: {},
          create: user.getRoles().map(role => ({
            role: {
              connectOrCreate: {
                where: { id: role.getId() },
                create: {
                  id: role.getId(),
                  title: role.getTitle()
                }
              }
            }
          }))
        }
      },
      include: { roles: { include: { role: true } } }
    });
  }

  /* ----------------------------- QUERIES ----------------------------- */

  static async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: { roles: { include: { role: true } } }
    });
  }

  static async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: { roles: { include: { role: true } } }
    });
  }

  static async findByVerificationCode(code: string) {
    return prisma.user.findFirst({
      where: { emailVerificationCode: code },
      include: { roles: { include: { role: true } } }
    });
  }

  static async list() {
    return prisma.user.findMany({
      where: { deletedAt: null },
      include: { roles: { include: { role: true } } }
    });
  }

  static async softDelete(id: string) {
    return prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date()
      }
    });
  }
}