let rmaBuilder = new Reef('#rma-builder', {
    data: {
        title: 'Script builder',
        actions: [],
        availableActions: ALL_ACTIONS.map(action => new action()),
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
                <button data-rma-action="builder-target" id="builder-target" class="with-horizontal-margin"></button>
            </div>

            ${props.badLinesKeys.length > 0 ? `<div id="builder-errors">
                Invalid lines : ${props.badLinesKeys.join(', ')}
            </div>` : ``}

            <textarea data-rma-action="change-builder-script" id="builder-script" rows="20"></textarea>

            <div><button data-rma-action="builder-compile-script" id="builder-compile-script">Compile</button></div>

            <div id="actions">
                ${props.actions.map(action => `<div class="action ${action.isRunning ? 'is-running' : ''}">${action.getDescription()}</div>`).join('')}
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

const executeScript = async () => {
    for (const action of rmaBuilder.data.actions) {
        await sleep(getRandomInt(1500, 2500));
        action.isRunning = true;

        let successful = false;

        while (!successful) {
            await action.execute()
                .then(() => {
                    action.isRunning = false;
                    successful = true;
                }).catch(e => {
                    successful = false;
                });
            await sleep(getRandomInt(500, 1000));
        }
    }

    await sleep(getRandomInt(2000, 10000));

    await executeScript().catch(e => {});
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

                    case "InteractWith":
                        actions.push(new InteractWith(
                            parseInt(matches.groups.i, 10),
                            parseInt(matches.groups.j, 10),
                            parseInt(matches.groups.option, 10),
                        ));
                        break;

                    case "Buy":
                        actions.push(new Buy(
                            parseInt(matches.groups.amount, 10),
                            String(matches.groups.itemName)
                        ));
                        break;

                    case "WaitForInventoryFreeSpaceEqual":
                        actions.push(new WaitForInventoryFreeSpaceEqual(
                            parseInt(matches.groups.amount, 10)
                        ));
                        break;

                    case "WaitForFullInventory":
                        actions.push(new WaitForInventoryFreeSpaceEqual(
                            parseInt(0, 10)
                        ));
                        break;

                    case "StoreAllInChest":
                        actions.push(new StoreAllInChest());
                        break;

                    case "StoreAllInClosestChest":
                        actions.push(new StoreAllInClosestChest());
                        break;

                    case "WithdrawFromClosestChest":
                        actions.push(new WithdrawFromClosestChest(
                            String(matches.groups.itemName),
                            parseInt(matches.groups.amount, 10)
                        ));
                        break;

                    case "EquipItem":
                        actions.push(new EquipItem(
                            String(matches.groups.itemName),
                        ));
                        break;

                    case "CloseAllWindows":
                        actions.push(new CloseAllWindows());
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
