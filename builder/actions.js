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
        return new Promise(async (resolve, reject) => {
            active_menu = -1;
            BigMenu.show(active_menu);
            selected = { i: this.i, j: this.j };
            players[0].path = findPathFromTo(players[0], selected, players[0]);

            await waitUntil(() => !movementInProgress(players[0]) && players[0].i == this.i && players[0].j == this.j).catch(e => reject());

            resolve();
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
        return `${this.label} [${this.i},${this.j}], select option n°${this.option}`;
    }

    getRegex() {
        return /^Interact with \[(?<i>\d+),(?<j>\d+)\], select \[(?<option>\d)\]$/;
    }

    getDefaultLabel() {
        return "Interact with [i,j], select [option]";
    }

    async execute() {
        return new Promise((resolve, reject) => {
            active_menu = -1;
            BigMenu.show(active_menu);

            selected = { i: this.i, j: this.j };
            selected_object = obj_g(on_map[current_map][this.i] && on_map[current_map][this.i][this.j]);
            selected_object.fn(selected_object.activities[this.option - 1].toLowerCase(), selected_object, players[0]);

            //ActionMenu.act(this.option - 1);
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
        return `Wait until we have ${this.amount}(or less) free slots in inventory`;
    }

    getRegex() {
        return /^Wait for inventory free slots to be \[(?<amount>\d+)\]$/;
    }

    getDefaultLabel() {
        return "Wait for inventory free slots to be [x]";
    }

    async execute() {
        return new Promise(async (resolve, reject) => {
            await waitUntil(() => getInventoryFreeSpace() <= this.amount).catch(e => reject());
            resolve();
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
            await waitUntil(() => Chest.is_open()).catch(e => reject());
            Chest.deposit_all();

            active_menu = -1;
            BigMenu.show(active_menu);

            document.getElementById("chest_close").click();
            resolve();
        });
    }
}

class StoreAllInChest extends DumbAction {
    constructor() {
        super("Store all in chest");
    }

    async execute() {
        return new Promise(async (resolve, reject) => {
            await waitUntil(() => Chest.is_open()).catch(e => reject());
            Chest.deposit_all();

            active_menu = -1;
            BigMenu.show(active_menu);

            document.getElementById("chest_close").click();

            resolve();
        });
    }
}


class WithdrawFromClosestChest extends Action {
    itemName; amount;

    constructor(itemName, amount) {
        super("Withdraw from closest chest");
        this.itemName = itemName;
        this.amount = amount;
    }

    getDescription() {
        return `Withdraw ${this.amount} "${this.itemName}" from closest chest`;
    }

    getRegex() {
        return /^Withdraw \[(?<amount>\d+)\] \[(?<itemName>.+)\] from closest chest$/;
    }

    getDefaultLabel() {
        return "Withdraw [amount] [item_name] from closest chest";
    }

    async execute() {
        return new Promise(async (resolve, reject) => {
            await openClosestChest();
            
            searchChest(this.itemName);

            await waitUntil(() => chests[0].length === 1).catch(e => reject());

            selected_chest = '0';
            BigMenu.update_chest_selection(true);

            Chest.withdraw(this.amount);

            closeAllActiveWindows();
            await waitUntil(() => !Chest.is_open()).catch(e => reject());
            resolve();
        });
    }
}

class EquipItem extends Action {
    itemName;

    constructor(itemName) {
        super("Equip item");
        this.itemName = itemName;
    }

    getDescription() {
        return `Equip "${this.itemName}"`;
    }

    getRegex() {
        return /^Equip \[(?<itemName>.+)\]$/;
    }

    getDefaultLabel() {
        return "Equip [item_name]";
    }

    async execute() {
        return new Promise(async (resolve, reject) => {
            equipByName(this.itemName);
            resolve();
        });
    }
}

class Buy extends Action {
    itemName; amount;

    constructor(amount, itemName) {
        super("Buy");
        this.amount = amount;
        this.itemName = itemName;
    }

    getDescription() {
        return `Buy ${this.amount} ${this.itemName}`;
    }

    getRegex() {
        return /^Buy \[(?<amount>\d+)\] \[(?<itemName>.+)\]$/;
    }

    getDefaultLabel() {
        return "Buy [amount] [item_name]";
    }

    async execute() {
        return new Promise(async (resolve, reject) => {
            await waitUntil(() => (shop_opened ?? false) && shop_content?.length > 0).catch(e => reject());

            const itemInShop = shop_content.find((item) => item_base[item.id]?.name == this.itemName);
            const itemIdInShop = shop_content.indexOf(itemInShop);

            selected_shop = itemIdInShop;
            BigMenu.update_shop_selection();

            Shop.buy_x(this.amount);

            closeAllActiveWindows();
            await waitUntil(() => !shop_opened).catch(e => reject());
            resolve();
        });
    }
}

const ALL_ACTIONS = [
    MoveTo,
    InteractWith,
    Buy,
    WaitForInventoryFreeSpaceEqual,
    WaitForFullInventory,
    StoreAllInChest,
    StoreAllInClosestChest,
    WithdrawFromClosestChest,
    EquipItem,
    CloseAllWindows,
]
