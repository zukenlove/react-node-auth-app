import type { DomainEvent } from "./DomainEvent.js";

/* ----------------------------- PAYLOAD ----------------------------- */
export interface UserRoleAssignedPayload {
  roleId: string;
  assignedBy: string; // renamed for clarity to match your User aggregate
}

/* ----------------------------- EVENT ----------------------------- */
export class UserRoleAssignedEvent
  implements DomainEvent<UserRoleAssignedPayload>
{
  public readonly eventName = "user.role.assigned";
  public readonly occurredAt: Date;

  constructor(
    public readonly aggregateId: string, // e.g., userId
    public readonly payload: UserRoleAssignedPayload,
    occurredAt?: Date
  ) {
    this.occurredAt = occurredAt ?? new Date();
  }
}