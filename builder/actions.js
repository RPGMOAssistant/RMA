class Action {
    label;

    constructor(label) {
        this.label = label;
    }

    getLabel() {
        return this.label;
    }
}

class MoveTo extends Action {
    i; j;

    constructor(i,j) {
        super("Move to");
        this.i = i;
        this.j = j;
    }

    getDescription() {
        return `${this.label} [${this.i},${this.j}]`;
    }

    getRegex() {
        return /^Move to \[(?<i>\d+),(?<j>\d+)\]$/;
    }

    getDefaultLabel() {
        return "Move to [i,j]";
    }
}

class StoreInventoryInClosestChest extends Action {

    constructor() {
        super("Store inventory in closest chest");
    }

    getDescription() {
        return `${this.label}`;
    }

    getRegex() {
        return /^Store inventory in closest chest$/;
    }

    getDefaultLabel() {
        return "Store inventory in closest chest";
    }
}

const ALL_ACTIONS = [
    MoveTo,
    StoreInventoryInClosestChest
]