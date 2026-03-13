import type { DomainEvent } from "./DomainEvent.js";

export class UserPasswordChangedEvent implements DomainEvent {
    readonly eventName: string;
    readonly aggregateId: string;
    readonly occurredAt: Date;

    constructor(aggregateId: string) {
        this.aggregateId = aggregateId;
        this.eventName = "UserPasswordChanged";
        this.occurredAt = new Date();
    }
}