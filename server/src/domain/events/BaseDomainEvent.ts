import type { DomainEvent } from "./DomainEvent";

export abstract class BaseDomainEvent<T> implements DomainEvent<T> {
  public readonly occurredAt: Date;
  public readonly eventId: string;

  protected constructor(
    public readonly eventName: string,
    public readonly aggregateId: string,
    public readonly payload: Readonly<T>,
    occurredAt?: Date,
    eventId?: string
  ) {
    this.occurredAt = occurredAt ?? new Date();
    this.eventId = eventId ?? crypto.randomUUID();
  }

  toPrimitives() {
    return {
      eventId: this.eventId,
      eventName: this.eventName,
      aggregateId: this.aggregateId,
      payload: this.payload,
      occurredAt: this.occurredAt
    };
  }
}