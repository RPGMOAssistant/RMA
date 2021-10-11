let lastNotificationSent = new Date();

setInterval(() => {
    if (document.querySelector('#captcha_menu').style.display === "block") {
        // 20 seconds between each notification
        if ((new Date().getTime() / 1000) - (lastNotificationSent.getTime() / 1000) >= 20) {
            notify("RMA_CAPTCHA_ACTIVE");
            lastNotificationSent = new Date();
        }
    }
    // players[0].params.penalty
}, 2000);