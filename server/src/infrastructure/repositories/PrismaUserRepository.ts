import { UserMapper } from "../mappers/UserMapper"
import type { User } from "../../domain/aggregate/User"
import type { IUserRepository } from "../../domain/repositories/IUserRepository"
import { PrismaUserWrapper } from "../prisma/PrismaUserWrapper";

export class PrismaUserRepository  implements IUserRepository{


  async login(username: string, password: string): Promise<User | null> {
    const user = await PrismaUserWrapper.findById(username)
    if (!user) return null
    return UserMapper.toDomain(user)  }

        //---create a new user in the database---//
  async create(user: User): Promise<User> {
      const saved = await PrismaUserWrapper.create(user);
      return UserMapper.toDomain(saved)

    }

    //---find a user by id---//
  async findById(id: string): Promise<User | null> {
    const user = await PrismaUserWrapper.findById(id)

    if (!user) return null

    return UserMapper.toDomain(user)
  }

    //---list all users---//
  async list(): Promise<User[]> {
    const users = await PrismaUserWrapper.list()

    return users.map(UserMapper.toDomain)
  }

    //---find a user by email---//
  async findByEmail(email: string): Promise<User | null> {
    const user = await PrismaUserWrapper.findByEmail(email)

    if (!user) return null

    return UserMapper.toDomain(user)
  }

    //---find a user by email verification code---//
  async findByVerificationCode(code: string): Promise<User | null> {
    const user = await PrismaUserWrapper.findByVerificationCode(code)

    if (!user) return null

    return UserMapper.toDomain(user)
  }

    //---update a user---//
  async update(user: User): Promise<User> {
    const updated = await PrismaUserWrapper.update(user)

    return UserMapper.toDomain(updated)
  }

    //---soft delete a user---//
  async delete(id: string): Promise<void> {
    await PrismaUserWrapper.softDelete(id)
  }
}