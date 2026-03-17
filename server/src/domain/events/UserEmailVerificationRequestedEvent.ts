import { BaseDomainEvent } from "../events/BaseDomainEvent";

type Payload = {
  requestedAt: Date;
};

export class UserEmailVerificationRequestedEvent
  extends BaseDomainEvent<Payload> {

  static EVENT_NAME = "user.email_verification_requested";

  constructor(
    aggregateId: string,
    payload: Payload,
    occurredAt?: Date
  ) {
    super(
      UserEmailVerificationRequestedEvent.EVENT_NAME,
      aggregateId,
      payload,
      occurredAt
    );
  }
}