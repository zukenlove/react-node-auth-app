import { BaseDomainEvent } from "./BasedomainEvent";

export interface UserEmailChangedPayload {
  newEmail: string;
  changedAt: Date;
}

export class UserEmailChangedEvent extends BaseDomainEvent<UserEmailChangedPayload> {
  constructor(aggregateId: string, payload: UserEmailChangedPayload) {
    super("user.email.changed", aggregateId, payload);
  }
}