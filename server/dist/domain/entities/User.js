import { v4 as uuidv4 } from "uuid";
import { Password } from "../value-objects/Password.js";
import { UserPasswordChangedEvent } from "../events/UserPasswordChangedEvent.js";
import { UserCreatedEvent } from "../events/UserCreatedEvent.js";
/* ----------------------------- ROLES ----------------------------- */
export var RoleIds;
(function (RoleIds) {
    RoleIds["ADMIN"] = "admin";
    RoleIds["USER"] = "user";
    RoleIds["MODERATOR"] = "moderator";
})(RoleIds || (RoleIds = {}));
/* ----------------------------- USER ENTITY ----------------------------- */
export class User {
    id;
    username;
    email;
    roles;
    password;
    createdAt;
    updatedAt;
    deletedAt;
    domainEvents = [];
    /* ----------------------------- CONSTRUCTOR ----------------------------- */
    constructor(id, username, email, roles, password, createdAt, updatedAt, deletedAt) {
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
    static async create(params) {
        const { username, email, roles = [RoleIds.USER], password } = params;
        const now = new Date();
        const id = uuidv4();
        const passwordVO = await Password.create(password);
        const user = new User(id, username, email, roles, passwordVO, now, now, null);
        user.addDomainEvent(new UserCreatedEvent(user.id));
        return user;
    }
    /* ----------------------------- PRISMA MAPPER ----------------------------- */
    static fromPrisma(prismaUser) {
        const passwordVO = Password.fromHash(prismaUser.password);
        const roles = prismaUser.roles.map((r) => {
            if (!Object.values(RoleIds).includes(r)) {
                throw new Error(`Invalid role in DB: ${r}`);
            }
            return r;
        });
        return new User(prismaUser.id, prismaUser.username, prismaUser.email, roles, passwordVO, prismaUser.createdAt, prismaUser.updatedAt, prismaUser.deletedAt ?? null);
    }
    /* ----------------------------- DOMAIN EVENTS ----------------------------- */
    addDomainEvent(event) {
        this.domainEvents.push(event);
    }
    pullDomainEvents() {
        const events = [...this.domainEvents];
        this.domainEvents = [];
        return events;
    }
    getDomainEvents() {
        return this.domainEvents;
    }
    /* ----------------------------- GETTERS ----------------------------- */
    getId() {
        return this.id;
    }
    getUsername() {
        return this.username;
    }
    getEmail() {
        return this.email;
    }
    getRoles() {
        return this.roles;
    }
    getPasswordHash() {
        return this.password.toString();
    }
    getCreatedAt() {
        return this.createdAt;
    }
    getUpdatedAt() {
        return this.updatedAt;
    }
    getDeletedAt() {
        return this.deletedAt;
    }
    hasRole(role) {
        return this.roles.includes(role);
    }
    /* ----------------------------- DOMAIN METHODS ----------------------------- */
    addRole(role) {
        if (!this.roles.includes(role)) {
            this.roles.push(role);
            this.updatedAt = new Date();
        }
    }
    removeRole(role) {
        this.roles = this.roles.filter((r) => r !== role);
        this.updatedAt = new Date();
    }
    async changePassword(newPassword) {
        this.password = await Password.create(newPassword);
        this.updatedAt = new Date();
        this.addDomainEvent(new UserPasswordChangedEvent(this.id));
    }
    async comparePassword(raw) {
        return this.password.compare(raw);
    }
    softDelete() {
        this.deletedAt = new Date();
        this.updatedAt = new Date();
    }
    restore() {
        this.deletedAt = null;
        this.updatedAt = new Date();
    }
    /* ----------------------------- UTILS ----------------------------- */
    equals(other) {
        return this.id === other.id;
    }
    toJSON() {
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
//# sourceMappingURL=User.js.map