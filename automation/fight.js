let state = {
    target: null,
};

// Click on the Fight automation button in the menu
const findRecheableEnnemiesButton = document.querySelector('#automation #fight .start');
findRecheableEnnemiesButton.addEventListener('click', (e) => {

    // Find all reachable targets (ennemies we can walk to)
    const reachableTargets = findReachableTargets();

    const uniqueEnemies = reachableTargets.reduce((acc, target) => {
        if (!acc.some(t => t.b_i === target.b_i)) {
            acc.push(target);
        }
        return acc;
    }, []);

    // Build the list of ennemies and place it into the DOM
    buildReachableEnnemiesList(uniqueEnemies);
});

const buildReachableEnnemiesList = (uniqueEnemies) => {
    const enemies = document.querySelector('#enemies');

    // Clear cards
    enemies.querySelectorAll('.enemyCard').forEach(card => card.parentElement.removeChild(card));

    for (const enemy of uniqueEnemies) {
        const newCard = document.createElement('div');
        newCard.classList.add('enemyCard');
        newCard.innerHTML = `<div class="name">${enemy.name}</div>`;

        newCard.addEventListener('click', (e) => {
            if (newCard.classList.contains('active')) {
                state.target = null;
                newCard.classList.remove('active');
            } else {
                state.target = enemy;
                newCard.classList.add('active');
            }
        });

        enemies.appendChild(newCard);
    }
}

const findReachableTargets = (target) => {
    let reachableTargets = [];

    for (var i = 0; i < on_map[current_map].length; i++) {
        var thing = on_map[current_map][i];
        for (var j = 0; j < thing.length; j++) {
            if (!target || obj_g(thing[j])?.b_i === target.b_i) {
                const pathTo = findPathFromTo(players[0], { i, j }, players[0]);
                if (pathTo.length > 0 && obj_g(thing[j])?.activities && obj_g(thing[j]).activities.includes('Attack')) {
                    reachableTargets.push(obj_g(thing[j]));
                }
            }
        }
    }

    return reachableTargets;
}

setInterval(() => {
    if (!state.target) {
        return;
    }

    /**
     * Do not find a new target if :
     **/

    //  We already have one
    if (players[0].temp.target_id !== -1) {
        return;
    }

    // We're moving
    if (movementInProgress(players[0]) || Timers.running("set_target")) {
        return;
    }

    // We need healing
    if (currentHealthPercentage <= RMA_CONFIG.MIN_HEALTH_HEALING_THRESHOLD) {
        return;
    }

    console.log(`Target set to ${state.target.name}`);

    const targets = findReachableTargets(state.target);

    const paths = targets.map(target => ({
        target,
        path: findPathFromTo(players[0], { i: target.i, j: target.j }, players[0])
    }));

    let shortest;
    for (const path of paths) {
        if (path.path.length > 0 && (!shortest || path.path.length < shortest.length)) {
            shortest = path;
        }
    }

    players[0].path = shortest.path;

    waitFor(() => !movementInProgress(players[0]) && !Timers.running("set_target"), () => {
        selected = obj_g(on_map[current_map][shortest.target.i][shortest.target.j]);
        selected_object = obj_g(on_map[current_map][shortest.target.i][shortest.target.j]);
        Player.set_target({ i: shortest.target.i, j: shortest.target.j});
    });
}, 5000);