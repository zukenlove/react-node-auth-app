export interface DomainEvent {
  eventName: string;
  aggregateId: string;
  occurredAt: Date;
}