import { version } from "node:os"
import { User } from "../../domain/aggregate/User"
import { Role, type RoleId } from "../../domain/entities/Role"

export class UserMapper {

  /* ----------------------------- DB → DOMAIN ----------------------------- */

  static toDomain(record: any): User {
    return User.rehydrate({
      id: record.id,
      username: record.username,
      email: record.email,
      passwordHash: record.password,

      roles: record.roles?.map((r: any) =>
        Role.rehydrate({
          id: r.role.id as RoleId,
          title: r.role.title
        })
      ) ?? [],

      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      deletedAt: record.deletedAt,
      version: record.version,

      emailVerified: record.emailVerified,
      emailVerificationCode: record.emailVerificationCode,
      emailVerificationExpiresAt: record.emailVerificationExpiresAt
    })
  }

  /* ----------------------------- DOMAIN → DB ----------------------------- */

  static toPersistence(user: User) {
    return {
      id: user.getId(),
      email: user.getEmail(),
      password: user.getPasswordHash(),
      username: user.getUsername(),

      createdAt: user.getCreatedAt(),
      updatedAt: user.getUpdatedAt(),
      deletedAt: user.getDeletedAt(),

      emailVerified: user.isEmailVerified(),
      emailVerificationCode: user.getEmailVerificationCode(),
      emailVerificationExpiresAt: user.getEmailVerificationExpiresAt(),
      version: user.getVersion(),

      roles: user.getRoles().map(role => ({
        roleId: role.getId(),
        title: role.getTitle()
      }))
    }
  }

}