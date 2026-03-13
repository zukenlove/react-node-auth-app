export class UserCreatedEvent {
    aggregateId;
    eventName = "user.created";
    occurredAt;
    constructor(aggregateId) {
        this.aggregateId = aggregateId;
        this.occurredAt = new Date();
    }
}
//# sourceMappingURL=UserCreatedEvent.js.map