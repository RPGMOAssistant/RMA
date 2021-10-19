let rma = new Reef('#rma', {
    data: {
        title: 'RPG MO Assistant',
    },
    template: function (props) {
        return `
            <h2 id="title">${props.title}</h1>

            <div id="rma-menu">
                <div id="automation">
                    <div class="main-section">Automation</div>
                    <div id="fight">
                        <div class="sub-section">Fight</div>
                        <div id="enemies"></div>
                        <button class="start">Refresh ennemies</button>
                    </div>

                    <div id="farming">
                        <div class="sub-section">Farming</div>
                        <div id="seeds"></div>
                        <button class="refresh">Refresh available seeds</button>
                    </div>
                </div>

                <div id="rma-builder"></div>
            </div>
        `;
    }
});

rma.render();

const addTextToScript = (text) => {
    const scriptElement = document.getElementById("builder-script");

    if (scriptElement.value === '') {
        scriptElement.value = `${text}`;
    } else {
        scriptElement.value = `${scriptElement.value}\n${text}`;
    }
}

const clickHandler = function (event) {
    var action = event.target.getAttribute('data-rma-action');

    if (event.target.id === "hud" && rmaBuilder.data.state === STATE_BUILDER_TARGETING) {
        const clickedPosition = translateMousePosition(mouse_screen.x, mouse_screen.y);
        addTextToScript(`[${clickedPosition.i},${clickedPosition.j}]`);

        rmaBuilder.data.state = STATE_BUILDER_STOPPED;
    }

    if (!action) return;

    switch(action) {
        case 'builder-add-action':
            const selectedActionValue = document.getElementById("builder-available-actions").value;
            addTextToScript(selectedActionValue);
            break;

        case 'builder-run':
            log("Running script");
            rmaBuilder.data.state = STATE_BUILDER_RUNNING;
            run_builder();
            break;

        case 'builder-stop':
            log("Stopping script");
            rmaBuilder.data.state = STATE_BUILDER_STOPPED;
            break;

        case 'builder-target':
            log("Targeting position");
            rmaBuilder.data.state = STATE_BUILDER_TARGETING;
            break;

        case 'builder-save':
            log("Saving script");
            download(["toto", "tata"], "My RPG MO script");
            break;

        case "builder-compile-script":
            compileScript();
            break;
    }
};

document.addEventListener('click', clickHandler, false);

const keyupHandler = function (event) {
    // Don't let the game handle keyup when writing inside the script builder
    if(event.target.id === "builder-script") {
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