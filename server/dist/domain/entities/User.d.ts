import type { DomainEvent } from "../events/DomainEvent.js";
export declare enum RoleIds {
    ADMIN = "admin",
    USER = "user",
    MODERATOR = "moderator"
}
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
export declare class User {
    private id;
    private username;
    private email;
    private roles;
    private password;
    private createdAt;
    private updatedAt;
    private deletedAt;
    private domainEvents;
    private constructor();
    static create(params: {
        username: string;
        email: string;
        roles?: RoleIds[];
        password: string;
    }): Promise<User>;
    static fromPrisma(prismaUser: PrismaUser): User;
    private addDomainEvent;
    pullDomainEvents(): DomainEvent[];
    getDomainEvents(): readonly DomainEvent[];
    getId(): string;
    getUsername(): string;
    getEmail(): string;
    getRoles(): readonly RoleIds[];
    getPasswordHash(): string;
    getCreatedAt(): Date;
    getUpdatedAt(): Date;
    getDeletedAt(): Date | null;
    hasRole(role: RoleIds): boolean;
    addRole(role: RoleIds): void;
    removeRole(role: RoleIds): void;
    changePassword(newPassword: string): Promise<void>;
    comparePassword(raw: string): Promise<boolean>;
    softDelete(): void;
    restore(): void;
    equals(other: User): boolean;
    toJSON(): {
        id: string;
        username: string;
        email: string;
        roles: RoleIds[];
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    };
}
//# sourceMappingURL=User.d.ts.map