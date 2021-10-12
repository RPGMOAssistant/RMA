// Click on the Fight automation button in the menu
const findRecheableEnnemiesButton = document.querySelector('#automation #fight .start');
findRecheableEnnemiesButton.addEventListener('click', (e) => {

    // Find all reachable targets (ennemies we can walk to)
    const reachableTargets = findReachableObjects((obj) => obj?.activities.includes("Attack"));

    const uniqueEnemies = reachableTargets.reduce((acc, target) => {
        if (!acc.some(t => t.name === target.name)) {
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

    const { path: pathToTarget, item: closestTarget } = findClosestReachableObject(obj => obj?.name === state.target.name);
    players[0].path = pathToTarget;

    waitFor(() => !movementInProgress(players[0]) && !Timers.running("set_target"), () => {
        selected = obj_g(on_map[current_map][closestTarget.i][closestTarget.j]);
        selected_object = obj_g(on_map[current_map][closestTarget.i][closestTarget.j]);
        Player.set_target({ i: closestTarget.i, j: closestTarget.j});
    });
}, 5000);