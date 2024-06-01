const EventNotifier = require('./eventNotifier');
const notifier = new EventNotifier();

class PhotoEventWatcher {
    static photoUploaded(photo) {
        notifier.notify('photoUploaded', photo);
    }

    static photoUpdated(photo) {
        notifier.notify('photoUpdated', photo);
    }

    static photoDeleted(photo) {
        notifier.notify('photoDeleted', photo);
    }

    static addObserver(observer) {
        notifier.addObserver(observer);
    }

    static removeObserver(observer) {
        notifier.removeObserver(observer);
    }
}

module.exports = PhotoEventWatcher;
