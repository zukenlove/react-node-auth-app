import type { DomainEvent } from "./DomainEvent";

export abstract class BaseDomainEvent<T>implements DomainEvent<T>
{
  public readonly occurredAt: Date;

  constructor(
    public readonly eventName: string,
    public readonly aggregateId: string,
    public readonly payload: T,
    occurredAt?: Date
  ) {
    this.occurredAt = occurredAt ?? new Date();
  }
}