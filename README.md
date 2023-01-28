![rpg-mo-assistant-real](https://user-images.githubusercontent.com/92334493/215270313-7a2ac6d8-ca2f-4c57-ab3e-891e03aefc0b.png | width=200)

# RPG MO Assistant - Automation tool

A chrome extension that lets you automate the boring grind in the game.

## Warning

This is a project I've worked on for fun and it should only be used for learning purpose.
You shouldn't be botting in any game and you will get banned for using this tool.

## Features

- Auto combat
- Auto interaction (fishing, woodcutting, etc.) and item storing in banks
- Scripts builder
- Captcha alert

## Installation

This is a Chrome extension that you need to install like so :
- Download the latest release or clone the repository
- Go to manage extensions (chrome://extensions/)
- Click "Load unpacked"
- Select the RMA folder

## How to use

- Play the game from your Chrome browser (https://data.mo.ee/)
- You should see the RMA window on the top-left corner
- Write and your script, compile it, and run

The script will be played from top to bottom, and loop until stopped

## Write your own scripts

[writing-script.webm](https://user-images.githubusercontent.com/92334493/215268502-9375f174-5dfc-43ef-8a8e-6c4ad39f6333.webm)

The script builder lets you write your own scripts with actions to execute :

- Move to [i,j]
- Interact with [i,j], select [option]
- Buy [amount] [item_name]
- Wait for inventory free slots to be [x]
- Wait for full inventory
- Store all in chest
- Store all in closest chest (buggy, use a combination of Interact with and Store all in chest)
- Withdraw [amount] [item_name] from closest chest
- Equip [item_name]
- Close all windows

To write a script : 

- Write your actions
- Use the target button to get the [i,j] coordinates
- Click Compile
- Click Run

## Fight ennemies

[fighting.webm](https://user-images.githubusercontent.com/92334493/215268516-9a0cd14c-40ae-40c4-961b-7ad682ee3105.webm)

- Click "Refresh ennemies" to get a list of nearby ennemies
- Click on the ennemy you want to fight

Healing items in your inventory will be used to heal if your health goes below "MIN_HEALTH_HEALING_THRESHOLD" (set in utils.js)

## Captcha alert

![captcha-alert](https://user-images.githubusercontent.com/92334493/215268527-a44be0f4-544a-4c6f-881d-bbecc42a9106.png)

You'll get a notification when the game wants you to solve a captcha
