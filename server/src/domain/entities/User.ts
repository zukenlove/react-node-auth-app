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
import { EmailVerification } from "../value-objects/EmailVerification.js";
import { UserEmailVerifiedEvent } from "../events/UserEmailVerifiedEvent.js";

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
  getEmailVerificationExpiresAt(): Date | null {
      return this.emailVerification.getExpiresAt(); // read-only
  }
  isEmailVerified() : boolean {
    return this.emailVerification.isVerified();
  }
  private domainEvents: DomainEvent[] = [];
  private version = 0;

  private constructor(
    private readonly id: UserId,
    private username: Username,
    private email: Email,
    private roles: Set<Role>,
    private password: Password,
    //private isActive: boolean = false,
    private createdAt: Date,
    private updatedAt: Date,
    private deletedAt: Date | null,
    private readonly dateProvider: DateProvider,
    private emailVerification: EmailVerification
  ) {}

  /* ----------------------------- FACTORY ----------------------------- */

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

  generateEmailVerificationCode(): string {
    this.assertActive();

    const now = this.dateProvider.now();

    const { verification, code } =
      this.emailVerification.generate(now);

    this.emailVerification = verification;

    return code;
  }

  verifyEmail(code: string): void {
    this.assertActive();

    const now = this.dateProvider.now();

    const previousState = this.emailVerification.isVerified();

    this.emailVerification = this.emailVerification.verify(code, now);

    if (!previousState && this.emailVerification.isVerified()) {
      this.record(
        new UserEmailVerifiedEvent(this.getId(), {
          verifiedAt: now
        }),
        now
      );
    }
  }
  /*-------------------------------------------------------------------*/
  // public static async verifyEmailByCode(code: string, userRepository: IUserRepository): Promise<User> {
  //   const user = await userRepository.findByEmailVerificationCode(code);
  //   if (!user) {
  //     throw new Error("Invalid verification code.");
  //   }

  //   user.verifyEmail(code);
  //   await userRepository.update(user);

  //   return user;
  // }

  public sendEmailVerificationCode(): void {
    this.assertActive();

    if (this.emailVerification.isVerified()) {
      throw new Error("Email is already verified.");
    }

  } 

  /* ----------------------------- EMAIL ----------------------------- */
  changeEmail(newEmail: string): void {
    this.assertActive();

    const email = Email.create(newEmail);

    // no change if it's the same email
    if (email.equals(this.email)) return;

    // update the email
    this.email = email;

    // reset verification for the new email
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

  public async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
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
      }), now
    );
  }

  revokeRole(role: Role, actorId: string, actorRoles: Role[]): void {
    this.assertActive();
    this.assertAdmin(actorRoles);

    if (!this.roles.has(role)) return;

    if (this.roles.size === 1)
      throw new Error("User must have at least one role.");

    this.roles.delete(role);
    const now = this.dateProvider.now();

    this.record(
      new UserRoleRevokedEvent(this.getId(), {
        roleId: role.getId(),
        revokedBy: actorId
      })
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

  
  public static rehydrate(props: {
    id: string;
    username: string;
    email: string;
    passwordHash: string;
    roles: Role[];

    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;

    emailVerified: boolean;
    emailVerificationCode: string | null;
    emailVerificationExpiresAt: Date | null;

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

  /* ----------------------------- EVENTS ----------------------------- */

  private record(event: DomainEvent, eventTime?: Date): void {
    const now = eventTime ?? this.dateProvider.now();

    this.updatedAt = now;
    this.version += 1;

    this.domainEvents.push(event);
  }

  public pullDomainEvents(): DomainEvent[] {
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
  getEmailVerificationCode(): string | null {
      return this.emailVerification.getCode(); // read-only
    }

    // getEmailVerificationExpiresAt(): Date | null {
    //   return this.emailVerification.getExpiresAt(); // read-only
    // }
  /* ----------------------------- INVARIANTS ----------------------------- */

  private assertActive(): void {
    if (this.deletedAt) throw new Error("User is deleted.");
  }

  private assertAdmin(actorRoles: readonly Role[]): void {
    const isAdmin = actorRoles.some((r) => r.equals(Role.ADMIN));
    if (!isAdmin) throw new Error("Admin privileges required.");
  }

  private assertHasAtLeastOneRole(): void {
    if (this.roles.size === 0)
      throw new Error("User must have at least one role.");
  }

  public equals(other: User): boolean {
    return this.id.equals(other.id);
  }
  
}

export interface RegisterUserDTO {
  email: string;
  password: string;
  username: string;
  roles?: string[]; 
}

// For repository layer operations where roles and timestamps may come from the DB,
// you can define additional DTOs as needed.
export type userDTO = RegisterUserDTO;