/**
 * Inject menu.html into page and create <script> tags containing all scripts
 **/

fetch(chrome.runtime.getURL('/menu.html')).then(r => r.text()).then(html => {
    document.querySelector("#wrapper").insertAdjacentHTML('beforeend', html);

    const scripts = ["utils.js", "captcha-notifier.js", "automation/healing.js", "automation/fight.js"];

    for (const filename of scripts) {
        var s = document.createElement('script');

        console.log(filename);
        s.src = chrome.runtime.getURL(filename);
        s.onload = function () {
            this.remove();
        };

        (document.head || document.documentElement).appendChild(s);
    }

    window.addEventListener("PassToBackground", function (evt) {
        chrome.runtime.sendMessage(evt.detail);
    }, false);
});