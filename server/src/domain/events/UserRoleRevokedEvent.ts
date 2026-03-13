import type { DomainEvent } from "./DomainEvent.js";

/* ----------------------------- PAYLOAD ----------------------------- */
export interface UserRoleRevokedPayload {
  roleId: string;
  revokedBy: string; // clearer and consistent with "assignedBy"
}

/* ----------------------------- EVENT ----------------------------- */
export class UserRoleRevokedEvent
  implements DomainEvent<UserRoleRevokedPayload>
{
  public readonly eventName = "user.role.revoked";
  public readonly occurredAt: Date;

  constructor(
    public readonly aggregateId: string, // e.g., userId
    public readonly payload: UserRoleRevokedPayload,
    occurredAt?: Date
  ) {
    this.occurredAt = occurredAt ?? new Date();
  }
}