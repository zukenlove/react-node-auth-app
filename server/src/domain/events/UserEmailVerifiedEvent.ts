import { BaseDomainEvent } from "../events/BaseDomainEvent";

export interface UserEmailVerifiedPayload {
  verifiedAt: Date;
}

export class UserEmailVerifiedEvent extends BaseDomainEvent<UserEmailVerifiedPayload> {
  constructor(
    aggregateId: string,
    payload: UserEmailVerifiedPayload,
    occurredAt?: Date
  ) {
    super(
      "user.email.verified",
      aggregateId,
      payload,
      occurredAt
    );
  }
}