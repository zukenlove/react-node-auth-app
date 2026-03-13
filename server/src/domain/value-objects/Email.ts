export class Email {
  private constructor(private readonly value: string) {}

  /** Factory method with validation */
  public static create(email: string): Email {
    if (!Email.isValid(email)) {
      throw new Error(`Invalid email address: ${email}`);
    }
    return new Email(email);
  }

  /** Create VO from existing string (e.g., DB) */
  public static fromString(email: string): Email {
    return new Email(email);
  }

  /** Simple email regex validation */
  private static isValid(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.toLowerCase());
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: Email): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}