import { User } from "../../domain/aggregate/User";
import type { IUserRepository } from "../../domain/repositories/IUserRepository";
import { Password } from "../../domain/value-objects/Password";

export class UserService {

  constructor(
    private readonly userRepository: IUserRepository) {}

  /* ----------------------------- CREATE ----------------------------- */

  async create(user: User): Promise<User> {

    const existing = await this.userRepository.findByEmail(user.getEmail());

    if (existing) {
      throw new Error("Email already in use");
    }

    user.sendEmailVerificationCode();

    const saved = await this.userRepository.create(user);

    return saved;
  }

  /* ----------------------------- LIST ----------------------------- */

  async list(): Promise<User[]> {
    return this.userRepository.list();
  }

  /* ----------------------------- FIND ----------------------------- */

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  /* ----------------------------- UPDATE ----------------------------- */
async update(userUpdate: {
  id: string;
  username?: string;
  email?: string;
}): Promise<User> {

  const existingUser = await this.userRepository.findById(userUpdate.id);

  if (!existingUser) {
    throw new Error("User not found");
  }

  if (userUpdate.username !== undefined) {
    existingUser.changeUsername(userUpdate.username);
  }

  if (userUpdate.email !== undefined) {
    existingUser.changeEmail(userUpdate.email);
  
  }

  return this.userRepository.update(existingUser);
}
  /* ----------------------------- DELETE ----------------------------- */

  async delete(id: string): Promise<void> {
    const existingUser = await this.userRepository.findById(id);

    if (!existingUser) {
      throw new Error("User not found");
    } 

    existingUser.softDelete(existingUser.getId());
    
    await this.userRepository.delete(id);
  }

  /* ----------------------------- VERIFY EMAIL ----------------------------- */

  async verifyEmail(userId: string, code: string): Promise<User> {

    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    user.verifyEmail(code);

    await this.userRepository.update(user);

    return user;
  }

/* ----------------------------- change password ----------------------------- */
async changePassword(email: string, currentPassword: string, newPassword: string): Promise<User> {

  const user = await this.userRepository.findByEmail(email);

  if (!user) {
    throw new Error("User not found");
  }

  await user.changePassword(currentPassword, newPassword);

  await this.userRepository.update(user);

  return user;
}   

/* ----------------------------- forgot password ----------------------------- */

 async forgotPassword(email: string, newPassword: string) : Promise<void>{

    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new Error("User not found");
    }
    // Validate + hash new password
    await user.createPassword(newPassword);
    // Save new hash
    await this.userRepository.update(user);
  }
}