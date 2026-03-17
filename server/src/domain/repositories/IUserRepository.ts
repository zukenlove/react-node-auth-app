import type { User } from "../aggregate/User";

export interface IUserRepository {

  create(user: User): Promise<User>;

  list(): Promise<User[]>;

  findById(id: string): Promise<User | null>;

  findByEmail(email: string): Promise<User | null>;

  findByVerificationCode(code: string): Promise<User | null>;

  update(user: User): Promise<User>;

  delete(id: string): Promise<void>;

  login(username: string, password: string): Promise<User | null>;
}