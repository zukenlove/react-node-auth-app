import type { DomainEvent } from "./DomainEvent.js";
export declare class UserPasswordChangedEvent implements DomainEvent {
    readonly eventName: string;
    readonly aggregateId: string;
    readonly occurredAt: Date;
    constructor(aggregateId: string);
}
//# sourceMappingURL=UserPasswordChangedEvent.d.ts.map