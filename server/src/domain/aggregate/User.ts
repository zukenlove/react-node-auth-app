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
import { UserEmailVerifiedEvent } from "../events/UserEmailVerifiedEvent.js";
import { UserEmailVerificationRequestedEvent } from "../events/UserEmailVerificationRequestedEvent.js";
import { EmailVerification } from "../value-objects/EmailVerification.js";

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

  private constructor(
    private readonly id: UserId,
    private username: Username,
    private email: Email,
    private roles: Set<Role>,
    private password: Password,
    private createdAt: Date,
    private updatedAt: Date,
    private deletedAt: Date | null,
    private readonly dateProvider: DateProvider,
    private emailVerification: EmailVerification,
    private version: number = 1

  ) {}

  /* ----------------------------- FACTORY ----------------------------- */

  static async register(params: {
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
      dp,
      EmailVerification.unverified()
    );

    user.record(
      new UserCreatedEvent(user.getId(), {
        userId: user.getId(),
        username: user.getUsername(),
        email: user.getEmail(),
        createdAt: now
      }),
      now
    );

    return user;
  }

  /* ----------------------------- ADMIN FACTORY ----------------------------- */

  static async createByAdmin(params: {
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
      dp,
      EmailVerification.unverified()
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
      }),
      now
    );

    return user;
  }

  /* ----------------------------- EMAIL VERIFICATION ----------------------------- */

  sendEmailVerificationCode(): string {
    this.assertActive();

    if (this.emailVerification.isVerified()) {
      throw new Error("Email already verified.");
    }

    const now = this.dateProvider.now();

    const { verification, code } = this.emailVerification.generate(now);
    this.emailVerification = verification;

    this.record(
      new UserEmailVerificationRequestedEvent(this.getId(), {
        requestedAt: now
      }),
      now
    );

    return code;
  }

  verifyEmail(code: string): void {
    this.assertActive();

    const now = this.dateProvider.now();
    const wasVerified = this.emailVerification.isVerified();

    this.emailVerification = this.emailVerification.verify(code, now);

    if (!wasVerified && this.emailVerification.isVerified()) {
      this.record(
        new UserEmailVerifiedEvent(this.getId(), {
          verifiedAt: now
        }),
        now
      );
    }
  }

  /* ----------------------------- EMAIL ----------------------------- */

  changeEmail(newEmail: string): void {
    this.assertActive();

    const email = Email.create(newEmail);

    if (email.equals(this.email)) return;

    this.email = email;
    this.emailVerification = EmailVerification.unverified();

    const now = this.dateProvider.now();

    this.record(
      new UserEmailChangedEvent(this.getId(), {
        newEmail: email.toString(),
        changedAt: now
      }),
      now
    );
  }

  /* ----------------------------- PASSWORD ----------------------------- */

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {

    this.assertActive();
    const newPasswordVO = await Password.create(newPassword);

    const valid = await this.password.compare(currentPassword);
    if (!valid) {
      throw new Error("Invalid current password.");
    }

    const samePassword = await this.password.compare(newPassword);
    if (samePassword) {
      throw new Error("New password cannot be the same as the current password.");
    }

    this.password = newPasswordVO;

    const now = this.dateProvider.now();

    this.record(
      new UserPasswordChangedEvent(this.getId(), {
        changedAt: now
      }),
      now
    );
  }

  /* ----------------------------- CREATE PASSWORD ----------------------------- */

  async createPassword(newPassword: string): Promise<void> {
    this.assertActive();  
    const newPasswordVO = await Password.create(newPassword);
    this.password = newPasswordVO;
    
    const now = this.dateProvider.now();
    this.record(
      new UserPasswordChangedEvent(this.getId(), {
        changedAt: now
      }),
      now
    );
  }
  /* ----------------------------- ROLE MANAGEMENT ----------------------------- */

  assignRole(role: Role, actorId: string, actorRoles: Role[]): void {

    this.assertActive();
    this.assertAdmin(actorRoles);

    if (this.roles.has(role)) return;

    this.roles.add(role);

    const now = this.dateProvider.now();

    this.record(
      new UserRoleAssignedEvent(this.getId(), {
        roleId: role.getId(),
        assignedBy: actorId
      }),
      now
    );
  }

  /* ----------------------------- REVOKE ROLE ----------------------------- */

  revokeRole(role: Role, actorId: string, actorRoles: Role[]): void {

    this.assertActive();
    this.assertAdmin(actorRoles);

    if (!this.roles.has(role)) return;

    if (this.roles.size === 1) {
      throw new Error("User must have at least one role.");
    }

    this.roles.delete(role);

    const now = this.dateProvider.now();

    this.record(
      new UserRoleRevokedEvent(this.getId(), {
        roleId: role.getId(),
        revokedBy: actorId
      }),
      now
    );
  }

  /* ----------------------------- SOFT DELETE ----------------------------- */

  softDelete(actorId: string): void {

    if (this.deletedAt) return;

    if (this.roles.has(Role.ADMIN)) {
      throw new Error("Admin users cannot be deleted.");
    }

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

/* ----------------------------- RESTORE ----------------------------- */

  restore(actorId: string): void {

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

  /* ----------------------------- REHYDRATION ----------------------------- */

  static rehydrate(props: {
    id: string
    username: string
    email: string
    passwordHash: string
    roles: Role[]

    createdAt: Date
    updatedAt: Date
    deletedAt: Date | null

    emailVerified: boolean
    emailVerificationCode: string | null
    emailVerificationExpiresAt: Date | null

    version?: number
    dateProvider?: DateProvider
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
      dp,

      EmailVerification.rehydrate({
        verified: props.emailVerified,
        code: props.emailVerificationCode,
        expiresAt: props.emailVerificationExpiresAt
      })
    );

    user.version = props.version ?? 0;

    return user;
  }

  /* ----------------------------- EVENT SYSTEM ----------------------------- */

  private record(event: DomainEvent, eventTime?: Date): void {

    const now = eventTime ?? this.dateProvider.now();

    this.updatedAt = now;
    this.version += 1;

    this.domainEvents.push(event);
  }
  
  
/* Pulls and clears domain events. Should be called by the repository after saving. */
  pullDomainEvents(): DomainEvent[] {

    const events = [...this.domainEvents];
    this.domainEvents = [];

    return events;
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

  isEmailVerified(): boolean {
    return this.emailVerification.isVerified();
  }

  getEmailVerificationCode(): string | null {
    return this.emailVerification.getCode();
  }

  getEmailVerificationExpiresAt(): Date | null {
    return this.emailVerification.getExpiresAt();
  }

  /* ----------------------------- INVARIANTS ----------------------------- */

  private assertActive(): void {
    if (this.deletedAt) {
      throw new Error("User is deleted.");
    }
  }

  private assertAdmin(actorRoles: readonly Role[]): void {

    const isAdmin = actorRoles.some(r => r.equals(Role.ADMIN));

    if (!isAdmin) {
      throw new Error("Admin privileges required.");
    }
  }

  private assertHasAtLeastOneRole(): void {

    if (this.roles.size === 0) {
      throw new Error("User must have at least one role.");
    }
  }

  equals(other: User): boolean {
    return this.id.equals(other.id);
  }

  /* ----------------------------- TO JSON ----------------------------- */
  public async validatePassword(password: string): Promise<boolean> {

    return  await this.password.compare(password);
   
    const now = this.dateProvider.now();
    // this.record(
    //   new UserLoggedInEvent(this.getId(), {
    //     loggedInAt: now
    //   }),
    //   now
    // );
  }

  changeUsername(newUsername: string): void {

  this.assertActive()

  const username = Username.create(newUsername)

  if (username.equals(this.username)) {
    return
  }

  this.username = username

  const now = this.dateProvider.now()

  // Optional event
  // this.record(
  //   new UserUsernameChangedEvent(this.getId(), {
  //     username: username.toString(),
  //     changedAt: now
  //   }),
  //   now
  // )
}
}