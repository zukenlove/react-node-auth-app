import bcrypt from 'bcrypt';

export class Password {
    private constructor(private readonly value: string) {}

    public static async create(value: string): Promise<Password> {
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

        if (!/[!@#$%^&*(),.?":{}|<>]/.test(trimmed)) {
            throw new Error("Password must contain at least one special character");
        }

        const hashpassword = await bcrypt.hash(trimmed, 10);
        return new Password(hashpassword);
    }

    // Compare a raw password with the stored hash
    public async compare(raw: string): Promise<boolean> {
        return bcrypt.compare(raw, this.value);
    }

    // Return the hashed password as string
    public toString(): string {
        return this.value;
    }

    public equals(other: Password): boolean {
        return this.value === other.value;
    }

    // Return the hashed password explicitly
    public getHash(): string {
        return this.value;
    }
    
    public static fromHash(hash: string): Password {
        return new Password(hash);
    }
}