import {v4 as uuidv4} from 'uuid'


export interface Updated {
  date: Date;
}

class User {
  private id: string;
  private username: string;
  private email: string;
  private role: string;
  private password : string
  private createdAt: Date;
  private updatedAt: Date;
  private deletedAt: Date | null;

  private constructor(
    id: string,
    username: string,
    email: string,
    role: string,
    password : string,
    createdAt: Date,
    updatedAt: Date,
    deletedAt: Date | null = null
  ) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.role = role;
    this.password = password
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.deletedAt = deletedAt;
  }

  // create method 
  public static async create(params : {
    username : string,
    email : string,
    role : string,
    password : string
  }): Promise<User> {
    const {username, email, role, password}= params
    const now = new Date()
    const id = uuidv4()

    return new User(id, username, email, role, password, now, now, null)
  }
  // Example getter methods
  getId(): string {
    return this.id;
  }

  getUsername(): string {
    return this.username;
  }

  getEmail(): string {
    return this.email;
  }

  getRole(): string {
    return this.role;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  getDeletedAt(): Date | null {
    return this.deletedAt;
  }
}