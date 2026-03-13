import { v4 as uuidv4 } from "uuid";

export class UserId {
  private constructor(private readonly value: string) {}

  /** Generate new UUID */
  public static create(): UserId {
    return new UserId(uuidv4());
  }

  /** From existing ID (DB or API) */
  public static fromString(id: string): UserId {
    if (!UserId.isValid(id)) {
      throw new Error(`Invalid User ID: ${id}`);
    }
    return new UserId(id);
  }

  /** Simple UUID v4 validation */
  private static isValid(id: string): boolean {
    const uuidV4Regex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidV4Regex.test(id);
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: UserId): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}