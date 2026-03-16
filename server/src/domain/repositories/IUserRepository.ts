import type { User } from "../entities/User";

export interface IUserRepository {
  create(user: User): Promise<User>;
  list(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  update(user: User): Promise<User>;
  delete(id: string): Promise<void>;
  verifyEmail(code: string): Promise<User | null>;
}
