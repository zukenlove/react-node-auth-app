import { v4 as uuidv4 } from 'uuid';
class User {
    id;
    username;
    email;
    role;
    password;
    createdAt;
    updatedAt;
    deletedAt;
    constructor(id, username, email, role, password, createdAt, updatedAt, deletedAt = null) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = role;
        this.password = password;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }
    // create method 
    static async create(params) {
        const { username, email, role, password } = params;
        const now = new Date();
        const id = uuidv4();
        return new User(id, username, email, role, password, now, now, null);
    }
    // Example getter methods
    getId() {
        return this.id;
    }
    getUsername() {
        return this.username;
    }
    getEmail() {
        return this.email;
    }
    getRole() {
        return this.role;
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
}
//# sourceMappingURL=User.js.map