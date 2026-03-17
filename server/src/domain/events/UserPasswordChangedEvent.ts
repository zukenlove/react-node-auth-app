import { BaseDomainEvent } from "../events/BaseDomainEvent";

export interface UserPasswordChangedPayload {
  changedAt: Date;
}

export class UserPasswordChangedEvent extends BaseDomainEvent<UserPasswordChangedPayload> {
  constructor(aggregateId: string, payload: UserPasswordChangedPayload) {
    super("user.password.changed", aggregateId, payload);
  }
}