# RPG MO code research

This file is a documentation about RPG MO's code. It's used to take notes about how things work and can be used to automate tasks on the game


## Player

### Access current player

```js
players[0]

players[0].params.health; // max health

skills[0].health.current / skills[0].health.level * 100 // current health percentage
```

## Positions

The `i` and `j` variables are used to store objects positions

- `i`: east/west axis
- `j`: north/south axis

For example to access the current player's locations :

```js
players[0].i
players[0].j
```

The findPathFromTo method is used to calculate the path between two positions.
It returns an array of `{i,j}` positions that makes a path to the target position.

A path can be assigned to the current player to make it move.

```js
const pathToB = findPathFromTo(a, b, d); // a = object, b = position, d = object. Not sure what is a and d, but you can pass it the current player in both
players[0].path = pathToB; // Makes your character move to position b

```

### Map tiles

- map[current_map] : stores data about tiles
- on_map[current_map] : stores data about objects/NPCs/etc. on tiles

**Access map tile informations**

```js
    // Access current map data at coordinates
    map[current_map][i][j]

    // The last line gives limited informations about the object, you can use obj_g to get more info
    obj_g(map[current_map][i][j])

    /**
     * 
     * {
        "id": -1,
        "b_i": 390,
        "b_t": "2",
        "i": -1,
        "j": -1,
        "params": {},
        "name": "Water Top",
        "img": {
            "sheet": "2",
            "x": 0,
            "y": 13
        },
        "type": 0,
        "activities": [],
        "top": {
            "sheet": "36",
            "x": 2,
            "y": 13
        },
        "temp": {},
        "fn": {},
        "blocking": true
    } */
```

We can iterate over the map data to find informations about all the tiles and objects on the map.

```js
    // Find all Fire Imp on the current map
    for(var i = 0; i < on_map[current_map].length; i++) {
        var thing = on_map[current_map][i];
        for(var j = 0; j < thing.length; j++) {
            if (obj_g(thing[j])?.name === "Fire Imp") {
                console.log(`Fire Imp at position ${i},${j}`)
            }
        }
    }
```

on_map has data about all the tiles, even the ones we can't see or interact with.
We can use the findPathFromTo to know if we can walk there.

In this example, we find the shortest path to an ennemy and attack it

```js

    // Find the closest Fire Imp and attack it
    let shortestPathTo;
    for(var i = 0; i < on_map[current_map].length; i++) {
        var thing = on_map[current_map][i];
        for(var j = 0; j < thing.length; j++) {
            if (obj_g(thing[j])?.name === "Fire Imp") {
                const pathTo = findPathFromTo(players[0], {i, j}, players[0]);
                if (pathTo.length > 0){
                    console.log(pathTo);

                    if (!shortestPathTo || pathTo.length < shortestPathTo.length) {
                        shortestPathTo = pathTo;
                    }
                }
            }
        }
    }

    const lastPositionInPath = shortestPathTo.slice(-1)[0];
    console.log(`Closest ennemy is at ${lastPositionInPath.i},${lastPositionInPath.j}`);
    players[0].path = pathTo;
    ActionMenu.act(0);
```

#### Mouse position to i,j position

```js
translateMousePosition(mouse_screen.x, mouse_screen.y);
```

### Images

```js
Items.get_background_image(item_b_i);
```

### Bases

Every item, NPC, etc. are stored in global variables. Known ones are :
- item_base
- npc_base
- objects_data

players[0].path = findPathFromTo(players[0], { i: 100, j: 100 }, players[0]);
var a = { i: players[0].i - 1, j: players[0].j };
players[0].path = findPathFromTo(players[0], { i: 7, j: 18 }, players[0]);

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

