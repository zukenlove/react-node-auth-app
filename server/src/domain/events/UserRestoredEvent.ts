import type { DomainEvent } from "./DomainEvent.js";

export interface UserRestoredPayload {
  restoredAt: Date;
  restoredBy?: string;
}

export class UserRestoredEvent implements DomainEvent<UserRestoredPayload> {
  public readonly eventName = "user.restored";
  public readonly occurredAt: Date;

  constructor(
    public readonly aggregateId: string,
    public readonly payload: UserRestoredPayload,
    occurredAt?: Date
  ) {
    this.occurredAt = occurredAt ?? new Date();
  }
}