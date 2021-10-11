const RMA_CONFIG = {
    MIN_HEALTH_HEALING_THRESHOLD: 85 
};

const log = (message) => {
    console.log(`RPG MO Assistant - ${message}`);
}

const waitFor = (condition, callback) => {
    if (!condition()) {
        window.setTimeout(waitFor.bind(null, condition, callback), 1000);
    } else {
        callback();
    }
}

const notify = (type) => {
    var event = new CustomEvent("PassToBackground", { detail: { notification: type } });
    window.dispatchEvent(event);
}