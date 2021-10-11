
// Dorpat fishing

// Move to fishing location
players[0].path = findPathFromTo(players[0], { i: 7, j: 18 }, players[0]);

// start fishing
var a = { i: 6, j: 18 };
selected_object = obj_g(on_map[current_map][a.i] && on_map[current_map][a.i][a.j]);
ActionMenu.act(0);

// Is my inventory full ?
Inventory.is_full(players[0])

If it's full then :

// open chest
var a = { i: 22, j: 17 };
selected_object = obj_g(on_map[current_map][a.i] && on_map[current_map][a.i][a.j]);
ActionMenu.act(0);

Wait until players[0].i = 21 && players[0].j = 17 then

// deposit everything in chest
Chest.deposit_all();

// Close chest
addClass(document.getElementById("chest"), "hidden");

