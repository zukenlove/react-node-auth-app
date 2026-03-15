import { User } from "../../domain/entities/User";
import type { IUserRepository } from "../../domain/repositories/IUserRepository";

export class UserService {
  constructor(private userRepository: IUserRepository) {}

async create(user: User): Promise<User> {
  try {
    const existing = await this.userRepository.findByEmail(user.getEmail());

    if (existing) {
      throw new Error("Email already in use");
    }

    const code = user.generateEmailVerificationCode();

    const saved = await this.userRepository.create(user);

    // await this.emailService.sendVerification(saved.getEmail(), code);

    return saved;

  } catch (error: any) {
    throw error.message ? new Error((error as Error).message) : error as Error;
  }
}
// list all users

  async list(): Promise<User[]> {
    return await this.userRepository.list();
  }



  /*====================================================*/

  async findById(id: string): Promise<User | null> {
    return await this.userRepository.findById(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findByEmail(email);
  }

  async update(user: User): Promise<User> {
    return await this.userRepository.update(user);
  }

  async delete(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }

  // Additional methods for user-related business logic can be added here
}