class Action {
    label; isRunning; isFinished;

    constructor(label) {
        this.label = label;
        this.isRunning = false;
        this.isFinished = false;
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

    async execute(){
        return new Promise((resolve, reject) => {
            players[0].path = findPathFromTo(players[0], { i: this.i, j: this.j }, players[0]);

            waitFor(() => {
                console.log("waiting");
                return !movementInProgress(players[0]) && players[0].i == this.i && players[0].j == this.j;
            }, () => {
                console.log("resolve");
                resolve();
            });
        });
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