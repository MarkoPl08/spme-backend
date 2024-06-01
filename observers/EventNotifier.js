class EventNotifier {
    constructor() {
        this.observers = [];
    }

    addObserver(observer) {
        this.observers.push(observer);
    }

    removeObserver(observer) {
        this.observers = this.observers.filter(obs => obs !== observer);
    }

    notify(eventType, data) {
        this.observers.forEach(observer => observer.update(eventType, data));
    }
}

module.exports = EventNotifier;
