import { User } from "../../domain/entities/User";
import type { IUserRepository } from "../../domain/repositories/IUserRepository";

export class UserService {
  constructor(private userRepository: IUserRepository) {}

  // Create a new user
  async create(user: User): Promise<User> {
    // You could add validation or business rules here
    return this.userRepository.create(user);
  }

  // Find user by ID
  async getUserById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  // Find user by email
  async getUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  // List all users
  async listUsers(): Promise<User[]> {
    return this.userRepository.list();
  }

  // Update a user
  async updateUser(user: User): Promise<User> {
    // Add validation/business logic if needed
    return this.userRepository.update(user);
  }

  // Soft delete a user
  async deleteUser(id: string): Promise<void> {
    return this.userRepository.softDelete(id);
  }
}