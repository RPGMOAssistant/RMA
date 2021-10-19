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

class DumbAction extends Action {
    constructor(label) {
        super(label);
    }

    getDescription() {
        return `${this.label}`;
    }

    getRegex() {
        return new RegExp(`${this.label}`);
    }

    getDefaultLabel() {
        return this.label;
    }
}

class CloseAllWindows extends DumbAction {
    constructor() {
        super("Close all windows");
    }

    async execute() {
        return new Promise((resolve, reject) => {
            closeAllActiveWindows();
            resolve();
        });
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

class InteractWith extends Action {
    i; j; option;

    constructor(i, j, option) {
        super("Interact with");
        this.i = i;
        this.j = j;
        this.option = option;
    }

    getDescription() {
        return `${this.label} [${this.i},${this.j}], select [${this.option}]`;
    }

    getRegex() {
        return /^Interact with \[(?<i>\d+),(?<j>\d+)\], select \[(?<option>\d)\]$/;
    }

    getDefaultLabel() {
        return "Interact with [i,j], select [option]";
    }

    async execute() {
        return new Promise((resolve, reject) => {
            selected_object = obj_g(on_map[current_map][this.i][this.j]);
            ActionMenu.act(this.option - 1);
            resolve();
        });
    }
}

class WaitForInventoryFreeSpaceEqual extends Action {
    amount; // The amount of free slots we are waiting for

    constructor(amount) {
        super("Wait for inventory free slots to be");
        this.amount = amount;
    }

    getDescription() {
        return `${this.label} [${this.amount}]`;
    }

    getRegex() {
        return /^Wait for inventory free slots to be \[(?<amount>\d+)\]$/;
    }

    getDefaultLabel() {
        return "Wait for inventory free slots to be [x]";
    }

    async execute() {
        return new Promise((resolve, reject) => {
            waitFor(() => getInventoryFreeSpace() <= this.amount, () => {
                resolve();
            });
        });
    }
}

// Proxy to WaitForInventoryFreeSpaceEqual with amount = 0
class WaitForFullInventory extends Action {
    constructor(amount) {
        super("Wait for full inventory");
    }

    getDescription() {
        return `${this.label}`;
    }

    getRegex() {
        return /^Wait for full inventory$/;
    }

    getDefaultLabel() {
        return "Wait for full inventory";
    }
}

class StoreAllInClosestChest extends DumbAction {
    constructor() {
        super("Store all in closest chest");
    }

    async execute() {
        return new Promise(async (resolve, reject) => {
            await openClosestChest();
            Chest.deposit_all();
            resolve();
        });
    }
}

const ALL_ACTIONS = [
    MoveTo,
    InteractWith,
    WaitForInventoryFreeSpaceEqual,
    WaitForFullInventory,
    StoreAllInClosestChest,
    CloseAllWindows
]