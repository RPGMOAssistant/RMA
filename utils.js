/**
 * Utility functions and global configuration objects
 */

const RMA_CONFIG = {
    MIN_HEALTH_HEALING_THRESHOLD: 85 
};

const STATE_BUILDER_RUNNING = 'STATE_BUILDER_RUNNING';
const STATE_BUILDER_STOPPED = 'STATE_BUILDER_STOPPED';
const STATE_BUILDER_TARGETING = 'STATE_BUILDER_TARGETING';

const DEFAULT_FARMING_STATE = {
    seed: null,
    isRaking: false,
    isGettingSeeds: false,
    isSeeding: false,
    isHarvesting: false,
    isStoringHarvest: false,
};

let state = {
    target: null,
    farming: { ...DEFAULT_FARMING_STATE }
};

/**
 * ===============================
 *  Non-RPG MO specific functions
 * ===============================
 */

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * @param {function(): *} callback
 * @param {number} retryMs
 * @param {number} timeoutMs
 */
const waitUntil = async (
    callback,
    retryMs = 1500,
    timeoutMs = 5000
) =>
    new Promise(async (resolve, reject) => {
        let retryHandle = null;
        let timeoutHandle = setTimeout(() => {
            if (retryHandle) {
                clearTimeout(retryHandle);
            }
            return reject("Waiting timeout");
        }, timeoutMs);

        const retryFunction = async () => {
            const callbackValue = await callback();
            if (callbackValue) {
                if (timeoutHandle) {
                    clearTimeout(timeoutHandle);
                }
                return resolve(callbackValue);
            }

            retryHandle = setTimeout(retryFunction, retryMs);
        };

        await retryFunction();
    });

/**
 * Send a notification to the background script, which will trigger a Chrome notification
 * @param {string} type : The notification type. Hardcoded string. Check background.js to know which types can be used 
 */
const passToBackground = (detail) => {
    var event = new CustomEvent("PassToBackground", { detail });
    window.dispatchEvent(event);
}

const notify = (type) => {
    passToBackground({ notification: type });
}

const download = (content, filename) => {
    passToBackground({ download: { content, filename }});
}

/**
 * ===========================
 *  RPG MO specific functions
 * ===========================
 */

/**
 * Find all reachable objects (on_map) that match the filter callback.
 * Can be used to find all nearby ennemies, all soils, etc.
 * @param {Function} filterCallback : Return true if the object should be returned. Returns objects with an Attack activity by default.
 * @returns {Array} : Array of Objects from objects_data[on_map[current_map]
 */
const findReachableObjects = (filterCallback = (obj) => obj.activities && obj.activities.includes('Attack')) => {
    const reachables = [];

    for (var i = 0; map_size_x > i; i++) for (var j = 0; map_size_y > j; j++) {
        if (on_map[current_map][i] && on_map[current_map][i][j]) {
            var obj = objects_data[on_map[current_map][i][j].id];
            if (!obj) {
                continue;
            }

            const pathTo = findPathFromTo(players[0], { i, j }, players[0]);

            if (pathTo.length === 0) {
                continue;
            }

            if (filterCallback(obj)) {
                reachables.push(obj);
            }
        }
    }
    
    return reachables;
}

/**
 * Find the closest item in an array of objects. All objects should have a i and j property
 * @param {array} array containing objects with i and j coordinates
 * @returns {object}
 */
const findClosest = (items) => {
    let shortestPath;
    let closestItem;

    for (const item of items) {
        if (!item?.i || !item?.j) {
            continue;
        }

        const pathTo = findPathFromTo(players[0], { i: item.i, j: item.j }, players[0]);

        if (!shortestPath || pathTo.length < shortestPath.length) {
            shortestPath = pathTo;
            closestItem = item;
        }
    }

    return { path: shortestPath, item: closestItem };
}

const findClosestReachableObject = (filterCallback = (obj) => obj.activities && obj.activities.includes('Attack')) => {
    const reachables = findReachableObjects(filterCallback);
    return findClosest(reachables);
}

const getItemElement = (item_b_i) => {
    let div = document.createElement('div');
    
    div.classList.add('item');
    div.style = Items.get_background_image(item_b_i);

    return div;
}

const equip = (id) => {
    Inventory.equip(players[0], id);
    Socket.send("equip", { data: { id } });
    BigMenu.init_inventory();
}

const equipByName = (itemName) => {
    const id = players[0].temp.inventory.find(item => item_base[item.id].name === itemName).id;
    equip(id);
}

const inventoryItemCount = (id) => Inventory.get_item_count(players[0], id);

const inventoryHasItem = (id) => inventoryItemCount(id) >= 1;

const chestHasItem = (id) => !!chest_content.find(item => item.id == id)?.count > 0;

const openClosestChest = async () => {
    return new Promise(async (resolve, reject) => {
        const { path: pathToChest, item: closestChest } = findClosestReachableObject(obj => obj?.name.includes("Chest"));
        selected_object = obj_g(on_map[current_map][closestChest.i] && on_map[current_map][closestChest.i][closestChest.j]);
        selected = { i: closestChest.i, j: closestChest.j };
        
        ActionMenu.act(0);

        await waitUntil(() => Chest.is_open()).catch(e => reject());
        resolve();
    });
}

const getInventoryFreeSpace = () => Inventory.slots - players[0].temp.inventory.length;
const inventoryHasItemsNotSelected = () => Inventory.slots - players[0].temp.inventory.filter(obj => obj.selected).length;

const searchChest = (text) => {
    Mods.Chestm.chest_search_update(text);
}

const hasHealthItem = () => {
    let result = false;

    for (var b = 0; b < players[0].temp.inventory.length; b++) {
        if ("undefined" == typeof item_base[players[0].temp.inventory[b].id].params.no_auto_eat &&
            "undefined" != typeof item_base[players[0].temp.inventory[b].id].params.heal) {
            result = true;
            break;
        }
    }

    return result;
}