let lastNotificationSent = new Date();
//let solvingCaptcha = false;

setInterval(async () => {
    if (!document.querySelector('#captcha_form')){
        return;           
    }

   /* if (solvingCaptcha) {
        return;
    }*/

    if (document.querySelector('#captcha_form').style.display === "block") {
        // 20 seconds between each notification
        if ((new Date().getTime() / 1000) - (lastNotificationSent.getTime() / 1000) >= 20) {
            notify("RMA_CAPTCHA_ACTIVE");
            lastNotificationSent = new Date();
        }

        /*solvingCaptcha = true;

        const backgroundImageStyle = document.querySelector("#captcha_form_content #captcha_img_div").style.backgroundImage;
        const regex = /url\("(?<base64>data:image\/jpeg\;base64.+)\"\)/m;

        const matches = backgroundImageStyle.match(regex);

        if (!matches) {
            solvingCaptcha = false;
            return;
        }

        const solution = await solveCaptcha(matches.groups.base64).catch(e => {
            solvingCaptcha = false;
        });

        // Type captcha and submit
        document.getElementById("captcha_input").value = solution;
        Captcha.submit();

        solvingCaptcha = false;*/
    }
}, 2000);

const solveCaptcha = async (base64) => new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:3000/tasks", true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        img: base64,
        token: ""
    }));

    xhr.onload = function async () {
        let data = JSON.parse(this.responseText);

        setTimeout(async () => {
            let xhr = new XMLHttpRequest();
            xhr.open("POST", `http://localhost:3000/result/${data.taskId}`, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify({
                token: ""
            }));

            xhr.onload = function async () {
                const data = JSON.parse(xhr.responseText);
                solvingCaptcha = false;
                resolve(data.solution);
            }
        }, 20000);
    }
});
