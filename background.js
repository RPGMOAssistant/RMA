chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        switch(request?.notification) {
            case "RMA_CAPTCHA_ACTIVE":
                chrome.notifications.create('RMA_CAPTCHA_ACTIVE', {
                    type: 'basic',
                    iconUrl: 'img/notification.png',
                    title: 'RPG MO Captcha',
                    message: 'You need to answer the captcha !',
                    priority: 2,
                });

                chrome.windows.getCurrent(function (w) {
                    w.focus();
                    chrome.tabs.getSelected(w.id,
                        function (response) {
                            alert(response.url);
                        });
                });

                window.focus();
        }

        if (request?.download) {
            // todo download file with request.download.content and request.download.filename
        }
    }
);