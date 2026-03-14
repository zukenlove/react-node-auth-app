import { User } from "../entities/User";

export interface IUserRepository {
  create(user: User): Promise<User>;
  // findById(id: string): Promise<User | null>;
  // findByEmail(email: string): Promise<User | null>;
  // list(): Promise<User[]>;
  // update(user: User): Promise<User>;
  // softDelete(id: string): Promise<void>;
}
