import { BaseDomainEvent } from "../events/BaseDomainEvent";

export interface UserCreatedPayload {
  userId: string;
  email: string;
  username: string;
  createdAt: Date;
  createdBy?: string;
}

export class UserCreatedEvent extends BaseDomainEvent<UserCreatedPayload> {
  constructor(aggregateId: string, payload: UserCreatedPayload) {
    super("user.created", aggregateId, payload);
  }
}