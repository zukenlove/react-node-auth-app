export class UserPasswordChangedEvent {
    eventName;
    aggregateId;
    occurredAt;
    constructor(aggregateId) {
        this.aggregateId = aggregateId;
        this.eventName = "UserPasswordChanged";
        this.occurredAt = new Date();
    }
}
//# sourceMappingURL=UserPasswordChangedEvent.js.map