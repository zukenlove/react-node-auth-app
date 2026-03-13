import type { DomainEvent } from "./DomainEvent.js";

export class UserCreatedEvent implements DomainEvent {
  eventName = "user.created";
  occurredAt: Date;

  constructor(public aggregateId: string) {
    this.occurredAt = new Date();
  }
}