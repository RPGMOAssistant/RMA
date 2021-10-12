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

setInterval(() => {
    if (!state.farming.seed) {
        return;
    }

    if (!Player.is_player_map(current_map)) {
        log("Cannot start farming. You're not on your island!");
        return;
    }

    if (state.farming.isRaking || state.farming.isGettingSeeds || state.farming.isSeeding) {
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

    rakeAllSoil();
    getSeeds();

    // Make sure the chest is closed
    while (Chest.is_open()) {
        closeAllActiveWindows();
    }

    // Make sure we have required seeds in our inventory now
    if (!inventoryHasItem(state.farming.seed.b_i)) {
        log("Required seeds not inventory");
        return;
    }

    equip(state.farming.seed.b_i);

    plantAllSeeds();
}, 5000);

const rakeAllSoil = () => {
    // Find all soils
    const soils = findReachableObjects(obj => obj.name === "Soil");

    if (soils.length === 0) {
        return;
    }

    state.farming.isRaking = true;

    // Add all Rake actions to the farming queue
    for (const soil of soils) {
        Mods.Farming.addToQueue(on_map[current_map][soil.i][soil.j]);
    }

    waitFor(() => Object.keys(Mods.Farming.queue).length === 0, () => {
        log('Queue is empty. All soil have been raked');
        state.farming.isRaking = false;
    });
}

const plantAllSeeds = () => {
    const rakedSoils = findReachableObjects(obj => obj.name === "Raked Soil");

    if (rakedSoils.length === 0) {
        return;
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

const getSeeds = () => {
    if(inventoryHasItem(state.farming.seed.b_i)){
        return;
    }

    // Do we have the required seeds in our chest?
    if (!chestHasItem(state.farming.seed.b_i)) {
        log(`No more ${state.farming.seed.name} in your chest`);
        return;
    }

    state.farming.isGettingSeeds = true;

    // Walk to closest chest, open it, withdraw all seeds
    if (!Chest.is_open()) {
        openClosestChest();

        waitFor(() => Chest.is_open(), () => {
            // Search the item name to only get one result, click on it and withdraw all
            Mods.Chestm.chest_search_update(state.farming.seed.name);
            setTimeout(() => {
                selected_chest = '0';
                Chest.withdraw(99);

                setTimeout(() => {
                    addClass(document.getElementById("chest"), "hidden");
                    Mods.Chestm.chest_search_hidden || getElem("chest_search").click();
                    state.farming.isGettingSeeds = false;
                }, 1000);
            }, 1000);
        });
    }
}