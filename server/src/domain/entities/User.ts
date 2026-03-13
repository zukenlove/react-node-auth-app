import { v4 as uuidv4 } from "uuid";
import { Password } from "../value-objects/Password.js";
import type { DomainEvent } from "../events/DomainEvent.js";
import { UserPasswordChangedEvent } from "../events/UserPasswordChangedEvent.js";
import { UserCreatedEvent } from "../events/UserCreatedEvent.js";

/* ----------------------------- ROLES ----------------------------- */
export enum RoleIds {
  ADMIN = "admin",
  USER = "user",
  MODERATOR = "moderator",
}

/* ----------------------------- PRISMA INTERFACE ----------------------------- */
export interface PrismaUser {
  id: string;
  username: string;
  email: string;
  password: string;
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

/* ----------------------------- USER ENTITY ----------------------------- */
export class User {
  private id: string;
  private username: string;
  private email: string;
  private roles: RoleIds[];
  private password: Password;
  private createdAt: Date;
  private updatedAt: Date;
  private deletedAt: Date | null;

  private domainEvents: DomainEvent[] = [];

  /* ----------------------------- CONSTRUCTOR ----------------------------- */
  private constructor(
    id: string,
    username: string,
    email: string,
    roles: RoleIds[],
    password: Password,
    createdAt: Date,
    updatedAt: Date,
    deletedAt: Date | null
  ) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.roles = roles;
    this.password = password;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.deletedAt = deletedAt;
  }

  /* ----------------------------- FACTORY ----------------------------- */
  public static async create(params: {
    username: string;
    email: string;
    roles?: RoleIds[];
    password: string;
  }): Promise<User> {
    const { username, email, roles = [RoleIds.USER], password } = params;

    const now = new Date();
    const id = uuidv4();
    const passwordVO = await Password.create(password);

    const user = new User(id, username, email, roles, passwordVO, now, now, null);

    user.addDomainEvent(new UserCreatedEvent(user.id));

    return user;
  }

  /* ----------------------------- PRISMA MAPPER ----------------------------- */
  public static fromPrisma(prismaUser: PrismaUser): User {
    const passwordVO = Password.fromHash(prismaUser.password);

    const roles: RoleIds[] = prismaUser.roles.map((r) => {
      if (!Object.values(RoleIds).includes(r as RoleIds)) {
        throw new Error(`Invalid role in DB: ${r}`);
      }
      return r as RoleIds;
    });

    return new User(
      prismaUser.id,
      prismaUser.username,
      prismaUser.email,
      roles,
      passwordVO,
      prismaUser.createdAt,
      prismaUser.updatedAt,
      prismaUser.deletedAt ?? null
    );
  }

  /* ----------------------------- DOMAIN EVENTS ----------------------------- */
  private addDomainEvent(event: DomainEvent) {
    this.domainEvents.push(event);
  }

  public pullDomainEvents(): DomainEvent[] {
    const events = [...this.domainEvents];
    this.domainEvents = [];
    return events;
  }

  public getDomainEvents(): readonly DomainEvent[] {
    return this.domainEvents;
  }

  /* ----------------------------- GETTERS ----------------------------- */
  getId(): string {
    return this.id;
  }

  getUsername(): string {
    return this.username;
  }

  getEmail(): string {
    return this.email;
  }

  getRoles(): readonly RoleIds[] {
    return this.roles;
  }

  getPasswordHash(): string {
    return this.password.toString();
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

  public hasRole(role: RoleIds): boolean {
    return this.roles.includes(role);
  }

  /* ----------------------------- DOMAIN METHODS ----------------------------- */
  public addRole(role: RoleIds) {
    if (!this.roles.includes(role)) {
      this.roles.push(role);
      this.updatedAt = new Date();
    }
  }

  public removeRole(role: RoleIds) {
    this.roles = this.roles.filter((r) => r !== role);
    this.updatedAt = new Date();
  }

  public async changePassword(newPassword: string) {
    this.password = await Password.create(newPassword);
    this.updatedAt = new Date();

    this.addDomainEvent(new UserPasswordChangedEvent(this.id));
  }

  public async comparePassword(raw: string): Promise<boolean> {
    return this.password.compare(raw);
  }

  public softDelete() {
    this.deletedAt = new Date();
    this.updatedAt = new Date();
  }

  public restore() {
    this.deletedAt = null;
    this.updatedAt = new Date();
  }

  /* ----------------------------- UTILS ----------------------------- */
  public equals(other: User): boolean {
    return this.id === other.id;
  }

  public toJSON() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      roles: this.roles,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
    };
  }
}