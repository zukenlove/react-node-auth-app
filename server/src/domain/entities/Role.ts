export type RoleId = "admin" | "user" | "moderator";

export class Role {
  private constructor(
    private readonly id: RoleId,
    private readonly title: string
  ) {}

  // Predefined static instances
  public static readonly ADMIN = new Role("admin", "Administrator");
  public static readonly USER = new Role("user", "Regular User");
  public static readonly MODERATOR = new Role("moderator", "Moderator");

  // Immutable list of roles
  public static readonly ALL = Object.freeze([
    Role.ADMIN,
    Role.USER,
    Role.MODERATOR,
  ]);

  // Fast lookup map
  private static readonly MAP = new Map<RoleId, Role>(
    Role.ALL.map((r) => [r.id, r])
  );

  // Getters
  public getId(): RoleId {
    return this.id;
  }

  public getTitle(): string {
    return this.title;
  }

  // Lookup by ID
  public static fromId(id: RoleId): Role {
    const role = this.MAP.get(id);
    if (!role) {
      throw new Error(`Invalid role ID: ${id}`);
    }
    return role;
  }

  // Rehydrate from plain object
  public static rehydrate(obj: { id: RoleId; title?: string }): Role {
    // Use the id to get the canonical instance
    return this.fromId(obj.id);
  }

  // Equality check
  public equals(other: Role): boolean {
    return this.id === other.id;
  }

  public toString(): RoleId {
    return this.id;
  }
}
