let currentHealthPercentage;

setInterval(() => {
    currentHealthPercentage = skills[0].health.current / skills[0].health.level * 100;

    if (currentHealthPercentage <= RMA_CONFIG.MIN_HEALTH_HEALING_THRESHOLD && players[0].temp.target_id === -1) {
        log(`Heals below ${currentHealthPercentage}%. Let's eat!`);
        Player.eat_food();
    }
}, 1000);