let rma = new Reef('#rma', {
    data: {
        title: 'RPG MO Assistant',
    },
    template: function (props) {
        return `
            <div id="rma-menu">
                <div id="automation">
                    <div id="fight">
                        <div class="sub-section">Fight</div>
                        <div id="enemies"></div>
                        <button class="start">Refresh ennemies</button>
                    </div>
                </div>

                <div id="rma-builder"></div>
            </div>
        `;
    }
});

/*
<div id="farming">
    <div class="sub-section">Farming</div>
    <div id="seeds"></div>
    <button class="refresh">Refresh available seeds</button>
</div>
 */

rma.render();

const addTextToScript = (text, newLine = true) => {
    const scriptElement = document.getElementById("builder-script");

    if (scriptElement.value === '') {
        scriptElement.value = `${text}`;
    } else {
        scriptElement.value = `${scriptElement.value}${newLine ? '\n' : ''}${text}`;
    }
}

const addOrReplaceSelection = (newText, newLine = true) => {
    const textarea = document.getElementById("builder-script");

    var len = textarea.value.length;
    var start = textarea.selectionStart;
    var end = textarea.selectionEnd;
    var sel = textarea.value.substring(start, end);

    if (sel === '') {
        addTextToScript(newText, newLine);
    }

    textarea.value = textarea.value.substring(0, start) + newText + textarea.value.substring(end, len);
}

const clickHandler = async function (event) {
    var action = event.target.getAttribute('data-rma-action');

    if (event.target.id === "hud" && rmaBuilder.data.state === STATE_BUILDER_TARGETING) {
        const clickedPosition = translateMousePosition(mouse_screen.x, mouse_screen.y);
        addOrReplaceSelection(`[${clickedPosition.i},${clickedPosition.j}]`, false);

        rmaBuilder.data.state = STATE_BUILDER_STOPPED;
    }

    switch (action) {
        case 'builder-add-action':
            const selectedActionValue = document.getElementById("builder-available-actions").value;
            addTextToScript(selectedActionValue);
            break;

        case 'builder-run':
            rmaBuilder.data.state = STATE_BUILDER_RUNNING;
            await executeScript().catch(e => { });
            break;

        case 'builder-stop':
            rmaBuilder.data.state = STATE_BUILDER_STOPPED;
            rmaBuilder.data.actions = rmaBuilder.data.actions.map(action => {
                action.isRunning = false;
                action.isFinished = true;
                return action;
            })
            break;

        case 'builder-target':
            rmaBuilder.data.state = STATE_BUILDER_TARGETING;
            break;

        case 'builder-reset':
            rmaBuilder.data.actions = []
            break;

        case 'builder-save':
            const scriptText = document.getElementById("builder-script").value;
            var a = document.createElement("a");
            a.download = "my-script.rma";
            a.href = window.URL.createObjectURL(new Blob([scriptText], { type: "text/plain" }));
            a.click();
            break;

        case "builder-compile-script":
            compileScript();
            break;
    }
};

document.addEventListener('click', clickHandler, false);

const keyupHandler = function (event) {
    // Don't let the game handle keyup when writing inside the script builder
    if (event.target.id === "builder-script") {
        event.stopPropagation();
        event.preventDefault();
        event.stopImmediatePropagation();
    }
};

document.addEventListener('keyup', keyupHandler, false);

const changeHandler = function (event) {
    // Don't let the game handle onchange when writing inside the script builder
    if (event.target.id === "builder-script") {
        event.stopPropagation();
        event.preventDefault();
        event.stopImmediatePropagation();
    }

    var action = event.target.getAttribute('data-rma-action');

    if (!action) return;
};

document.addEventListener('change', changeHandler, false);
