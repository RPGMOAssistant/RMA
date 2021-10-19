let rmaBuilder = new Reef('#rma-builder', {
    data: {
        title: 'Script builder',
        actions: [],
        availableActions: [new MoveTo(), new StoreInventoryInClosestChest()],
        state: STATE_BUILDER_STOPPED,
        badLinesKeys: [] // Lines that could not be matched with an action
    },
    template: function (props) {
        return `
            <div class="main-section">${props.title}</div>
            
            <div class="flex justifySpaceBetween alignItemsCenter" id="builder-action-adder-container">
                <select name="builder-available-actions" id="builder-available-actions">
                    ${props.availableActions.map(action => {
                        return `<option value="${action.getDefaultLabel()}">${action.getLabel()}</option>`;
                    })}
                </select> 

                <button data-rma-action="builder-add-action" id="builder-add-action" class="with-horizontal-margin">+</button>
                <button data-rma-action="builder-target" id="builder-target" class="with-horizontal-margin">
                T
                </button>
            </div>

            ${props.badLinesKeys.length > 0 ? `<div id="builder-errors">
                Invalid lines : ${props.badLinesKeys.join(', ')}
            </div>` : ``}

            <textarea data-rma-action="change-builder-script" id="builder-script" rows="20">Move to [5,6]</textarea>

            <div><button data-rma-action="builder-compile-script" id="builder-compile-script">Compile</button></div>

            <div id="actions">
                ${props.actions.map(action => `<div class="action">${action.getDescription()}</div>`).join('')}
            </div>
            

            <div class="flex justifySpaceBetween alignItemsCenter gap-10">
                ${props.state === STATE_BUILDER_RUNNING ? 
                `<button data-rma-action="builder-stop" id="builder-stop">Stop</button>` : 
                `<button data-rma-action="builder-run" id="builder-run">Run</button>`}

                <button data-rma-action="builder-save" id="builder-save">Save</button>
            </div>
        `;
    },
    attachTo: rma
});

rmaBuilder.render();

const run_builder = async () => {
    log("Next loop");

    if (rmaBuilder.data.state === STATE_BUILDER_STOPPED) {
        return;
    }

    // Execute every action in order
    const stack = [...rmaBuilder.data.actions];
    console.log(stack);
    for (const action of stack) {
        console.log("executing action");
        console.log(action);
        await action.execute();
    }

    setTimeout(() => {
        run_builder();
    }, 1000);
}

const compileScript = () => {
    const scriptText = document.getElementById("builder-script").value;
    const lines = scriptText.split("\n");

    let actions = [];

    rmaBuilder.data.badLinesKeys = [];

    for (const [key, line] of Object.entries(lines)) {
        let matched = false;
        for (const action of ALL_ACTIONS) {
            const matches = line.match((new action()).getRegex());

            if (matches) {
                matched = true;

                switch (action.name) {
                    case "MoveTo":
                        actions.push(new MoveTo(
                            parseInt(matches.groups.i, 10),
                            parseInt(matches.groups.j, 10)
                        ));
                        break;

                    case "StoreInventoryInClosestChest":
                        actions.push(new StoreInventoryInClosestChest());
                        break;

                    default:
                        break;
                }
            }
        }

        if (!matched) {
            rmaBuilder.data.badLinesKeys.push(key);
        }
    }

    rmaBuilder.data.actions = actions;

    setTimeout(function () {
        document.getElementById("builder-script").focus();
    }, 0);

    return actions;
}