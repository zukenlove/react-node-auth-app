export interface DomainEvent<T = unknown> {
  readonly eventName: string;
  readonly aggregateId: string;
  readonly occurredAt: Date;
  readonly payload: T;
}