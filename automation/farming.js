// Click on the Fight automation button in the menu
const refreshSeedsButton = document.querySelector('#automation #farming .refresh');
refreshSeedsButton.addEventListener('click', (e) => {
    // Find all seeds we have in our chest, with the count
    const allSeeds = item_base.filter(item => item.name.includes('Seed'));
    const seedsInChest = allSeeds.map(seed => seed.b_i).filter(seedId => Chest.player_chest_item_count(0, seedId)).map(seedId => ({
        seed: item_base[seedId],
        count: Chest.player_chest_item_count(0, seedId)
    }));

    buildSeedsList(seedsInChest);
});

setInterval(async () => {
    if (!state.farming.seed) {
        return;
    }

    if (!Player.is_player_map(current_map)) {
        log("Cannot start farming. You're not on your island!");
        return;
    }

    if (state.farming.isRaking || state.farming.isGettingSeeds || state.farming.isSeeding || state.farming.isHarvesting || state.farming.isStoringHarvest) {
        return;
    }

    // Check if we have a rake or multitool equipped, if not, equip it
    const rakeId = 767;
    const multitoolId = 2807;

    if (!Inventory.has_equipped(players[0], rakeId) && !Inventory.has_equipped(players[0], multitoolId)) {
        if (inventoryHasItem(rakeId)) {
            equip(rakeId);
        } else if (inventoryHasItem(multitoolId)) {
            equip(multitoolId);
        } else {
            log("Cannot farm without rake or multitool. Go get your tools!");
        }
    }

    for (let index = 0; index < 5; index++) {
        console.log("loop harvest");
        await harvestAll();
        await storeAll();
    }

    for (let index = 0; index < 5; index++) {
        await rakeAllSoil();
    }

    await getSeeds();

    // Make sure we have required seeds in our inventory now
    if (!inventoryHasItem(state.farming.seed.b_i)) {
        log("Required seeds not inventory");
        return;
    }

    equip(state.farming.seed.b_i);

    await plantAllSeeds();
    await harvestAll();
    await storeAll();

    resetState();
}, 5000);

const rakeAllSoil = async() => {
    return new Promise((resolve, reject) => {
        // Find all soils
        const soils = findReachableObjects(obj => obj.name === "Soil");

        if (soils.length === 0) {
            resolve();
        }

        state.farming.isRaking = true;

        // Add all Rake actions to the farming queue
        for (const soil of soils) {
            Mods.Farming.addToQueue(on_map[current_map][soil.i][soil.j]);
        }

        waitFor(() => Object.keys(Mods.Farming.queue).length === 0, () => {
            log('Queue is empty. All soil have been raked');
            state.farming.isRaking = false;
            resolve();
        });
    });
}

const plantAllSeeds = async () => {
    return new Promise((resolve, reject) => {
        const rakedSoils = findReachableObjects(obj => obj.name === "Raked Soil");

        if (rakedSoils.length === 0) {
            resolve();
        }

        state.farming.isSeeding = true;

        // Add all planting actions to the queue
        const seedsInInventoryCount = inventoryItemCount(state.farming.seed.b_i);
        for (const rakedSoil of rakedSoils) {
            if (Object.keys(Mods.Farming.queue).length < seedsInInventoryCount) {
                Mods.Farming.addToQueue(on_map[current_map][rakedSoil.i][rakedSoil.j]);
            }
        }

        waitFor(() => Object.keys(Mods.Farming.queue).length === 0, () => {
            log('Queue is empty. All seeds have been planted');
            state.farming.isSeeding = false;
            resolve();
        });
    });
}


const buildSeedsList = (seedsWithCount) => {
    const seeds = document.querySelector('#seeds');

    // Clear cards
    seeds.querySelectorAll('.seedCard').forEach(card => card.parentElement.removeChild(card));

    for (const seedWithCount of seedsWithCount) {
        const { seed, count } = seedWithCount;
        const newCard = document.createElement('div');
        newCard.classList.add('seedCard');

        newCard.innerHTML = `
            <div class="name">${seed.name}</div>
            <div class="count">${count}</div>
        `;

        newCard.addEventListener('click', (e) => {
            if (newCard.classList.contains('active')) {
                state.farming.seed = null;
                newCard.classList.remove('active');
            } else {
                state.farming.seed = seed;
                newCard.classList.add('active');
            }
        });

        seeds.appendChild(newCard);

        // Todo: integrate seed image
        //const seedItemElement = getItemElement(seed.b_i);
        //newCard.append(seedItemElement);
    }
}

const getSeeds = async () => {
    return new Promise(async (resolve, reject) => {
        if (getInventoryFreeSpace() === 0 && inventoryHasItem(state.farming.seed.b_i)){
            resolve();
        }

        // Do we have the required seeds in our chest?
        if (!chestHasItem(state.farming.seed.b_i)) {
            log(`No more ${state.farming.seed.name} in your chest`);
            resolve();
        }

        state.farming.isGettingSeeds = true;

        // Walk to closest chest, open it, withdraw all seeds
        await openClosestChest();

        // Search the item name to only get one result, click on it and withdraw all
        Mods.Chestm.chest_search_update(state.farming.seed.name);

        waitFor(() => chests[0].length === 1, () => {
            selected_chest = '0';
            Chest.withdraw(99);

            closeAllActiveWindows();

            state.farming.isGettingSeeds = false;
            resolve();
        });
    });
}

const harvestAll = () => {
    return new Promise((resolve, reject) => {
        console.log("harvestAll");
        const allHarvestableObjects = object_base.filter(obj => obj.activities.includes(ACTIVITIES.HARVEST));
        const allHarvestableObjectsIds = allHarvestableObjects.map(obj => obj.b_i);

        const harvestableReachableObjects = findReachableObjects(obj => allHarvestableObjectsIds.includes(obj.b_i));

        if (harvestableReachableObjects.length === 0) {
            resolve();
        }

        state.farming.isHarvesting = true;

        // Queue as many harvest actions as we have free space in your inventory
        const freeSpace = getInventoryFreeSpace();
        for (const harvestable of harvestableReachableObjects) {
            if (Object.keys(Mods.Farming.queue).length < freeSpace) {
                Mods.Farming.addToQueue(on_map[current_map][harvestable.i][harvestable.j]);
            }
        }

        waitFor(() => Object.keys(Mods.Farming.queue).length === 0, () => {
            log('Queue is empty. All plots have been harvested');
            state.farming.isHarvesting = false;
            resolve();
        });
    });
}

const storeAll = async () => {
    return new Promise(async (resolve, reject) => {
        if (!inventoryHasItemsNotSelected()) {
            resolve();
        }

        state.farming.isStoringHarvest = true;

        // Walk to closest chest, open it, deposit all
        console.log("open closests chest");
        await openClosestChest();

        console.log("deposit all");

        Chest.deposit_all();
        closeAllActiveWindows();

        state.farming.isStoringHarvest = false;
        resolve();
    });
    
}

const resetState = () => {
    state.farming = { ...DEFAULT_FARMING_STATE, seed: state.farming.seed };
}

