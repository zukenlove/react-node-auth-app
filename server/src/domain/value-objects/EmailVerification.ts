export class EmailVerification {
  private constructor(
    private readonly verified: boolean,
    private readonly code: string | null,
    private readonly expiresAt: Date | null
  ) {}

  /* ----------------------------- FACTORIES ----------------------------- */

  static unverified(): EmailVerification {
    return new EmailVerification(false, null, null);
  }

  static rehydrate(props: {
    verified: boolean;
    code: string | null;
    expiresAt: Date | null;
  }): EmailVerification {
    return new EmailVerification(
      props.verified,
      props.code,
      props.expiresAt
    );
  }

  /* ----------------------------- GENERATE CODE ----------------------------- */

  generate(now: Date, ttlMinutes = 10): { verification: EmailVerification; code: string } {
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const expiresAt = new Date(now.getTime() + ttlMinutes * 60 * 1000);

    const verification = new EmailVerification(
      false,
      code,
      expiresAt
    );

    return { verification, code };
  }

  /* ----------------------------- VERIFY ----------------------------- */

  verify(code: string, now: Date): EmailVerification {
    if (!this.code) {
      throw new Error("Verification code not generated.");
    }

    if (!this.expiresAt || this.expiresAt < now) {
      throw new Error("Verification code expired.");
    }

    if (this.code !== code) {
      throw new Error("Invalid verification code.");
    }

    return new EmailVerification(true, null, null);
  }

  /* ----------------------------- GETTERS ----------------------------- */

  isVerified(): boolean {
    return this.verified;
  }

  getCode(): string | null {
    return this.code;
  }

  getExpiresAt(): Date | null {
    return this.expiresAt;
  }
}