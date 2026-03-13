import { Password } from "../value-objects/Password.js";
import { Email } from "../value-objects/Email.js";
import { Username } from "../value-objects/Username.js";
import { UserId } from "../value-objects/UserId.js";
import { Role } from "../entities/Role.js";
import type { DomainEvent } from "../events/DomainEvent.js";
import { UserCreatedEvent } from "../events/UserCreatedEvent.js";
import { UserDeletedEvent } from "../events/UserDeletedEvent.js";
import { UserRestoredEvent } from "../events/UserRestoredEvent.js";
import { UserEmailChangedEvent } from "../events/UserEmailChangedEvent.js";
import { UserPasswordChangedEvent } from "../events/UserPasswordChangedEvent.js";
import { UserRoleAssignedEvent } from "../events/UserRoleAssignedEvent.js";
import { UserRoleRevokedEvent } from "../events/UserRoleRevokedEvent.js";

/* ----------------------------- DATE PROVIDER ----------------------------- */
export interface DateProvider {
  now(): Date;
}

class SystemDateProvider implements DateProvider {
  now(): Date {
    return new Date();
  }
}

/* ----------------------------- USER AGGREGATE ----------------------------- */
export class User {
  private domainEvents: DomainEvent[] = [];
  private version = 0;

  private constructor(
    private readonly id: UserId,
    private username: Username,
    private email: Email,
    private roles: Set<Role>,
    private password: Password,
    private createdAt: Date,
    private updatedAt: Date,
    private deletedAt: Date | null,
    private readonly dateProvider: DateProvider
  ) {}

  /* ----------------------------- FACTORIES ----------------------------- */
  public static async register(params: {
    username: string;
    email: string;
    password: string;
    dateProvider?: DateProvider;
  }): Promise<User> {
    const dp = params.dateProvider ?? new SystemDateProvider();
    const now = dp.now();

    const user = new User(
      UserId.create(),
      Username.create(params.username),
      Email.create(params.email),
      new Set([Role.USER]),
      await Password.create(params.password),
      now,
      now,
      null,
      dp
    );

    user.record(
      new UserCreatedEvent(user.getId(), {
        userId: user.getId(),
        username: user.getUsername(),
        email: user.getEmail(),
        createdAt: now
      })
    );

    return user;
  }

  public static async createByAdmin(params: {
    username: string;
    email: string;
    password: string;
    roles: Role[];
    actorId: string;
    actorRoles: Role[];
    dateProvider?: DateProvider;
  }): Promise<User> {
    const dp = params.dateProvider ?? new SystemDateProvider();
    const now = dp.now();

    const user = new User(
      UserId.create(),
      Username.create(params.username),
      Email.create(params.email),
      new Set(params.roles),
      await Password.create(params.password),
      now,
      now,
      null,
      dp
    );

    user.assertAdmin(params.actorRoles);
    user.assertHasAtLeastOneRole();

    user.record(
      new UserCreatedEvent(user.getId(), {
        userId: user.getId(),
        username: user.getUsername(),
        email: user.getEmail(),
        createdAt: now,
        createdBy: params.actorId
      })
    );

    return user;
  }

  /* ----------------------------- REHYDRATION ----------------------------- */
  public static rehydrate(props: {
    id: string;
    username: string;
    email: string;
    passwordHash: string;
    roles: Role[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    version?: number;
    dateProvider?: DateProvider;
  }): User {
    const dp = props.dateProvider ?? new SystemDateProvider();

    const user = new User(
      UserId.fromString(props.id),
      Username.create(props.username),
      Email.create(props.email),
      new Set(props.roles),
      Password.fromHash(props.passwordHash),
      props.createdAt,
      props.updatedAt,
      props.deletedAt,
      dp
    );

    user.version = props.version ?? 0;
    return user;
  }

  /* ----------------------------- GETTERS ----------------------------- */
  getId(): string {
    return this.id.toString();
  }

  getUsername(): string {
    return this.username.toString();
  }

  getEmail(): string {
    return this.email.toString();
  }

  getRoles(): readonly Role[] {
    return Object.freeze([...this.roles]);
  }

  getPasswordHash(): string {
    return this.password.getHash();
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

  getVersion(): number {
    return this.version;
  }

  hasRole(role: Role): boolean {
    return this.roles.has(role);
  }

  /* ----------------------------- ROLE MANAGEMENT ----------------------------- */
  public assignRole(role: Role, actorId: string, actorRoles: Role[]): void {
    this.assertActive();
    this.assertAdmin(actorRoles);

    if (this.hasRole(role)) return;

    this.roles.add(role);

    this.record(
      new UserRoleAssignedEvent(this.getId(), {
        roleId: role.getId(),
        assignedBy: actorId
      })
    );
  }

  public revokeRole(role: Role, actorId: string, actorRoles: Role[]): void {
    this.assertActive();
    this.assertAdmin(actorRoles);

    if (!this.hasRole(role)) return;
    if (this.roles.size === 1) throw new Error("User must have at least one role.");

    this.roles.delete(role);

    this.record(
      new UserRoleRevokedEvent(this.getId(), {
        roleId: role.getId(),
        revokedBy: actorId
      })
    );
  }

  /* ----------------------------- PASSWORD ----------------------------- */
  public async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    this.assertActive();

    const valid = await this.password.compare(currentPassword);
    if (!valid) throw new Error("Invalid current password.");

    this.password = await Password.create(newPassword);

    const now = this.dateProvider.now();
    this.record(
      new UserPasswordChangedEvent(this.getId(), {
        changedAt: now
      }),
      now
    );
  }

  /* ----------------------------- EMAIL ----------------------------- */
  public changeEmail(newEmail: string): void {
    this.assertActive();

    const email = Email.create(newEmail);
    if (email.equals(this.email)) return;

    this.email = email;

    const now = this.dateProvider.now();
    this.record(
      new UserEmailChangedEvent(this.getId(), {
        newEmail: email.toString(),
        changedAt: now
      }),
      now
    );
  }

  /* ----------------------------- SOFT DELETE / RESTORE ----------------------------- */
  public softDelete(actorId: string): void {
    if (this.deletedAt) return;

    const now = this.dateProvider.now();
    this.deletedAt = now;

    this.record(
      new UserDeletedEvent(this.getId(), {
        deletedAt: now,
        deletedBy: actorId
      }),
      now
    );
  }

  /* ----------------------------- SOFT DELETE / RESTORE ----------------------------- */

  public restore(actorId: string): void {
    if (!this.deletedAt) return;

    this.deletedAt = null;

    const now = this.dateProvider.now();
    this.record(
      new UserRestoredEvent(this.getId(), {
        restoredAt: now,
        restoredBy: actorId
      }),
      now
    );
  }
/* ----------------------------- INTERNAL ----------------------------- */
  private record(event: DomainEvent, eventTime?: Date): void {
    // Use a precise timestamp for this operation
    const now = eventTime ?? this.dateProvider.now();

    // Update the updatedAt timestamp and version
    this.updatedAt = now;
    this.version += 1;

    // Push the event to the domainEvents queue
    this.domainEvents.push(event);
  }

  public pullDomainEvents(): DomainEvent[] {
    const events = [...this.domainEvents];
    this.domainEvents = [];
    return events;
  }

  public getDomainEvents(): readonly DomainEvent[] {
    return Object.freeze([...this.domainEvents]);
  }

  /* ----------------------------- INVARIANTS ----------------------------- */
  private assertActive(): void {
    if (this.deletedAt) throw new Error("User is deleted.");
  }

  private assertAdmin(actorRoles: readonly Role[]): void {
    const isAdmin = actorRoles.some((r) => r.equals(Role.ADMIN));
    if (!isAdmin) throw new Error("Admin privileges required.");
  }

  private assertHasAtLeastOneRole(): void {
    if (this.roles.size === 0) throw new Error("User must have at least one role.");
  }

  /* ----------------------------- INTERNAL ----------------------------- */
  private touch(): void {
    this.updatedAt = this.dateProvider.now();
    this.version += 1;
  }

  public equals(other: User): boolean {
    return this.id.equals(other.id);
  }
}