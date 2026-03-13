import type { DomainEvent } from "./DomainEvent.js";
export declare class UserCreatedEvent implements DomainEvent {
    aggregateId: string;
    eventName: string;
    occurredAt: Date;
    constructor(aggregateId: string);
}
//# sourceMappingURL=UserCreatedEvent.d.ts.map