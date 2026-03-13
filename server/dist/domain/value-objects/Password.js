import bcrypt from 'bcrypt';
export class Password {
    value;
    constructor(value) {
        this.value = value;
    }
    static async create(value) {
        const trimmed = value.trim();
        if (trimmed.length === 0) {
            throw new Error("Field password is required.");
        }
        if (trimmed.length < 9) {
            throw new Error("Password must be at least 9 characters long");
        }
        if (!/[A-Z]/.test(trimmed)) {
            throw new Error("Password must contain at least one uppercase letter");
        }
        if (!/[!@#$%^&*(),.?\":{}|<>]/.test(trimmed)) {
            throw new Error("Password must contain at least one special character");
        }
        const hashpassword = await bcrypt.hash(trimmed, 10);
        return new Password(hashpassword);
    }
    // Compare a raw password with the stored hash
    async compare(raw) {
        return bcrypt.compare(raw, this.value);
    }
    // Return the hashed password as string
    toString() {
        return this.value;
    }
    static fromHash(hash) {
        return new Password(hash);
    }
}
//# sourceMappingURL=Password.js.map