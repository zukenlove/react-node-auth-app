import { BaseDomainEvent } from "../events/BaseDomainEvent";

export interface UserDeletedPayload {
  deletedBy?: string;
  deletedAt: Date;
}

export class UserDeletedEvent extends BaseDomainEvent<UserDeletedPayload> {
  constructor(aggregateId: string, payload: UserDeletedPayload) {
    super("user.deleted", aggregateId, payload);
  }
}