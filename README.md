# easy-execute
Allows you to execute scripts from VSCode to compatible roblox executors.

## Requirements:
- Roblox executor with `WebSockets`
- [Node.js](https://nodejs.org)
- [Visual Studio Code](https://code.visualstudio.com)

## How To Install (VSCode)

### Step 1
Download the latest release from the [releases](https://github.com/Nicuse101/easy-execute/releases)
### Step 2
Go to the **Extensions** tab in VSCode, press the three horizontal dots and click `Install from VSIX...`
### Step 3
Select the file you have downloaded from the releases and you're finished!

## Example Usage (Roblox):
```lua
loadstring(game:HttpGet("https://raw.githubusercontent.com/Nicuse101/easy-execute/refs/heads/master/loader.lua"))(8080)
```
The port can be changed aswell (in this case the `8080`)

Note: The port must match on the VSCode extension to work. You can change this in extension settings.
