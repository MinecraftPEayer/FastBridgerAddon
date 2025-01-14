import * as Minecraft from "@minecraft/server";
import * as MUI from "@minecraft/server-ui";
function runCommand(command) {
    Minecraft.world.getDimension("overworld").runCommandAsync(command);
}
let islandTypeName = {
    short: "Short",
    diagonal: "Diagonal",
};
let islands = {};
let isGenData = {
    short: {
        type: "short",
        spawn: [-96, -12, 80],
        from: [-128, -18, 75],
        to: [-91, 8, 85],
        z_offset: -12,
        island_count: 20,
    },
    diagonal: {
        type: "diagonal",
        spawn: [6, -12, 84],
        from: [-16, -18, 62],
        to: [12, 3, 90],
        z_offset: -31,
        island_count: 10,
    },
};
let playerIslands = {};
let islandBlockData = {};
let speedCaculate = {};
let islandBrigingStatus = {};
let timer = {};
let leaderboard = {};
let bypassArenaBorder = [];
function generateIsland() {
    for (let type of Object.keys(isGenData)) {
        islands[type] = [];
        islandBlockData[type] = [];
        islandBrigingStatus[type] = {};
        for (let i = 0; i < isGenData[type].island_count; i++) {
            islands[type].push({
                type: isGenData[type].type,
                spawn: [
                    isGenData[type].spawn[0],
                    isGenData[type].spawn[1],
                    isGenData[type].spawn[2] + isGenData[type].z_offset * i,
                ],
                from: [
                    isGenData[type].from[0],
                    isGenData[type].from[1],
                    isGenData[type].from[2] + isGenData[type].z_offset * i,
                ],
                to: [
                    isGenData[type].to[0],
                    isGenData[type].to[1],
                    isGenData[type].to[2] + isGenData[type].z_offset * i,
                ],
            });
            islandBlockData[type].push({ events: [] });
            islandBrigingStatus[type][i] = false;
        }
    }
}
generateIsland();
let items = [new Minecraft.ItemStack("minecraft:white_wool", 64), new Minecraft.ItemStack("minecraft:white_wool", 64)];
let navigator = new Minecraft.ItemStack("minecraft:compass", 1);
navigator.nameTag = "§r§fIsland Selector";
let aquaTheGod = new Minecraft.ItemStack("minecraft:cyan_dye", 1);
aquaTheGod.nameTag = "§r§bAqua The God";
aquaTheGod.setLore(["§l§bAqua The God"]);
Minecraft.system.runInterval(() => {
    var _a, _b, _c, _d;
    let players = Minecraft.world.getPlayers();
    for (let player of players) {
        (_b = (_a = player.getComponent("inventory")) === null || _a === void 0 ? void 0 : _a.container) === null || _b === void 0 ? void 0 : _b.setItem(8, navigator);
        (_d = (_c = player.getComponent("inventory")) === null || _c === void 0 ? void 0 : _c.container) === null || _d === void 0 ? void 0 : _d.setItem(7, aquaTheGod);
    }
}, 20);
Minecraft.system.runInterval(() => {
    var _a;
    let players = Minecraft.world.getPlayers();
    for (let player of players) {
        if (!speedCaculate[player.name])
            speedCaculate[player.name] = { previosPos: player.location, nowPos: player.location };
        speedCaculate[player.name].previosPos = speedCaculate[player.name].nowPos;
        speedCaculate[player.name].nowPos = player.location;
        let distance = Math.sqrt(Math.pow(speedCaculate[player.name].nowPos.x - speedCaculate[player.name].previosPos.x, 2) +
            Math.pow(speedCaculate[player.name].nowPos.y - speedCaculate[player.name].previosPos.y, 2) +
            Math.pow(speedCaculate[player.name].nowPos.z - speedCaculate[player.name].previosPos.z, 2));
        if (!timer[player.name])
            timer[player.name] = 0;
        if (!playerIslands[player.name])
            return;
        if (islandBrigingStatus[playerIslands[player.name].type][playerIslands[player.name].id]) {
            timer[player.name] += 0.05;
        }
        runCommand(`title ${player.name} actionbar §aSpeed: ${(distance * 20).toFixed(2)} blocks/s\n${islandBrigingStatus[playerIslands[player.name].type][playerIslands[player.name].id]
            ? `§cTime: ${timer[player.name].toFixed(2)}s`
            : ""}`);
        let lbArray = Object.entries(leaderboard);
        lbArray.sort((a, b) => b[1] - a[1]);
        runCommand(`scoreboard players reset * display`);
        runCommand(`scoreboard players set "§l§dSession-Top 5§r" display 6`);
        runCommand(`scoreboard players set "§eminecraftpeayer.me" display 0`);
        for (let i = 0; i < lbArray.length; i++) {
            let name = lbArray[i][0];
            if (name.length > 10)
                name = name.slice(0, 10) + "...";
            runCommand(`scoreboard players set "§7${name} - §e${lbArray[i][1].toFixed(2)}" display ${i + 1}`);
        }
        if (!islands[playerIslands[player.name].type][playerIslands[player.name].id])
            return;
        let plIs = playerIslands[player.name];
        let pos = {
            x: player.location.x,
            y: player.location.y,
            z: player.location.z,
        }, islandPos1 = islands[plIs.type][plIs.id].from, islandPos2 = islands[plIs.type][plIs.id].to;
        if ((pos.x < islandPos1[0] ||
            pos.x > islandPos2[0] ||
            pos.y < islandPos1[1] ||
            pos.y > islandPos2[1] ||
            pos.z < islandPos1[2] ||
            pos.z > islandPos2[2]) &&
            !bypassArenaBorder.includes(player.nameTag)) {
            timer[player.nameTag] = 0;
            islandBrigingStatus[plIs.type][plIs.id] = false;
            player.teleport({
                x: islands[plIs.type][plIs.id].spawn[0],
                y: islands[plIs.type][plIs.id].spawn[1],
                z: islands[plIs.type][plIs.id].spawn[2],
            });
            let playerContainer = (_a = player.getComponent("inventory")) === null || _a === void 0 ? void 0 : _a.container;
            for (let i = 0; i < items.length; i++) {
                playerContainer === null || playerContainer === void 0 ? void 0 : playerContainer.setItem(i, items[i]);
            }
            for (let i = 0; i < islandBlockData[plIs.type][plIs.id].events.length; i++) {
                let block = islandBlockData[plIs.type][plIs.id].events[i];
                Minecraft.system.runTimeout(() => {
                    var _a, _b;
                    if (block.event === "place") {
                        (_a = Minecraft.world
                            .getDimension("overworld")
                            .getBlock({
                            x: block.pos.x,
                            y: block.pos.y,
                            z: block.pos.z,
                        })) === null || _a === void 0 ? void 0 : _a.setType("minecraft:air");
                    }
                    if (block.event === "break") {
                        (_b = Minecraft.world
                            .getDimension("overworld")
                            .getBlock({
                            x: block.pos.x,
                            y: block.pos.y,
                            z: block.pos.z,
                        })) === null || _b === void 0 ? void 0 : _b.setType(block.block);
                    }
                    if (i === islandBlockData[plIs.type][plIs.id].events.length - 1) {
                        islandBlockData[plIs.type][plIs.id].events = [];
                    }
                }, i);
            }
        }
    }
}, 1);
Minecraft.world.afterEvents.playerJoin.subscribe((event) => {
    runCommand(`tellraw @a {"rawtext":[{"text":"§f[§a+§f] §7${event.playerName}"}]}`);
    let islandForPlayer = 0;
    while (Object.values(playerIslands["short"]).includes(islandForPlayer)) {
        islandForPlayer = ++islandForPlayer;
    }
    playerIslands[event.playerName] = {
        type: "short",
        id: islandForPlayer,
    };
});
let ranks = {
    MinecraftPEayer: "§c[OWNER]",
};
Minecraft.world.beforeEvents.playerLeave.subscribe((event) => {
    runCommand(`tellraw @a {"rawtext":[{"text":"§f[§c-§f] §7${event.player.nameTag}"}]}`);
});
Minecraft.world.beforeEvents.chatSend.subscribe((event) => {
    event.cancel = true;
    if (event.message.startsWith("!is")) {
        let args = event.message.split(" ");
        args.shift();
        let unavailableIslands = {
            short: [],
            diagonal: [],
        };
        for (let is in playerIslands) {
            unavailableIslands[playerIslands[is].type].push(playerIslands[is].id);
        }
        if (!args[0]) {
            let islandForPlayer = 0;
            while (unavailableIslands["short"].includes(parseInt(args[1]))) {
                islandForPlayer = ++islandForPlayer;
            }
            playerIslands[event.sender.name] = {
                type: "short",
                id: islandForPlayer,
            };
        }
        else {
            if (unavailableIslands["short"].includes(parseInt(args[1]) - 1)) {
                runCommand(`tellraw ${event.sender.nameTag} {"rawtext":[{"text":"§cIsland already taken"}]}`);
                return;
            }
            playerIslands[event.sender.nameTag] = {
                type: args[0],
                id: parseInt(args[0]) - 1,
            };
        }
    }
    else {
        runCommand(`tellraw @a {"rawtext":[{"text":"${ranks[event.sender.nameTag] ? `${ranks[event.sender.nameTag]} ` : "§7"}${event.sender.nameTag} §f» §7${event.message}"}]}`);
    }
});
Minecraft.world.afterEvents.playerPlaceBlock.subscribe((event) => {
    let player = event.player;
    if (!playerIslands[player.name])
        return;
    if (!islands[playerIslands[player.name].type][playerIslands[player.name].id])
        return;
    let island = playerIslands[player.nameTag];
    let block = event.block;
    if (!islandBrigingStatus[island.type][island.id])
        islandBrigingStatus[island.type][island.id] = true;
    islandBlockData[island.type][island.id].events.push({
        block: block.typeId,
        pos: {
            x: block.x,
            y: block.y,
            z: block.z,
        },
        event: "place",
    });
});
Minecraft.world.beforeEvents.playerBreakBlock.subscribe((event) => {
    let player = event.player;
    if (!playerIslands[player.name])
        return;
    if (!islands[playerIslands[player.name].type][playerIslands[player.name].id])
        return;
    let island = playerIslands[player.nameTag];
    let block = event.block;
    islandBlockData[island.type][island.id].events.push({
        block: block.typeId,
        pos: {
            x: block.x,
            y: block.y,
            z: block.z,
        },
        event: "break",
    });
});
Minecraft.world.afterEvents.pressurePlatePush.subscribe((event) => {
    if (event.block.typeId === "minecraft:light_weighted_pressure_plate") {
        let player = event.source;
        let island = playerIslands[player.nameTag];
        if (!islands[island.type][island.id])
            return;
        if (!islandBrigingStatus[island.type][island.id])
            return;
        runCommand(`title ${player.nameTag} title §eTIME: §b${timer[player.nameTag].toFixed(2)}§es`);
        player.setGameMode(Minecraft.GameMode.adventure);
        runCommand(`summon fireworks_rocket ${player.location.x} ${player.location.y + 3} ${player.location.z}`);
        Minecraft.system.runTimeout(() => {
            runCommand(`playsound firework.blast @a ${player.location.x} ${player.location.y} ${player.location.z}`);
            Minecraft.system.runTimeout(() => {
                runCommand(`playsound firework.twinkle @a ${player.location.x} ${player.location.y} ${player.location.z}`);
            }, 10);
        }, 30);
        if (!leaderboard[player.nameTag])
            leaderboard[player.nameTag] = timer[player.nameTag];
        if (leaderboard[player.nameTag] && timer[player.nameTag] < leaderboard[player.nameTag]) {
            leaderboard[player.nameTag] = timer[player.nameTag];
        }
        runCommand(`tellraw @a {"rawtext":[{"text":"§eFastBridger >> ${player.nameTag} completed in §b${timer[player.nameTag].toFixed(2)}§es"}]}`);
        timer[player.nameTag] = 0;
        islandBrigingStatus[island.type][island.id] = false;
        for (let i = 0; i < islandBlockData[island.type][island.id].events.length; i++) {
            let block = islandBlockData[island.type][island.id].events[i];
            Minecraft.system.runTimeout(() => {
                var _a, _b;
                if (block.event === "place") {
                    (_a = Minecraft.world
                        .getDimension("overworld")
                        .getBlock({
                        x: block.pos.x,
                        y: block.pos.y,
                        z: block.pos.z,
                    })) === null || _a === void 0 ? void 0 : _a.setType("minecraft:air");
                }
                if (block.event === "break") {
                    (_b = Minecraft.world
                        .getDimension("overworld")
                        .getBlock({
                        x: block.pos.x,
                        y: block.pos.y,
                        z: block.pos.z,
                    })) === null || _b === void 0 ? void 0 : _b.setType(block.block);
                }
                if (i === islandBlockData[island.type][island.id].events.length - 1) {
                    islandBlockData[island.type][island.id].events = [];
                }
            }, i);
        }
        bypassArenaBorder.push(player.nameTag);
        Minecraft.system.runTimeout(() => {
            var _a;
            let playerContainer = (_a = player.getComponent("inventory")) === null || _a === void 0 ? void 0 : _a.container;
            for (let i = 0; i < items.length; i++) {
                playerContainer === null || playerContainer === void 0 ? void 0 : playerContainer.setItem(i, items[i]);
            }
            let bab = bypassArenaBorder.filter((name) => name !== player.nameTag);
            bypassArenaBorder = bab;
            player.setGameMode(Minecraft.GameMode.survival);
            player.teleport({
                x: islands[island.type][island.id].spawn[0],
                y: islands[island.type][island.id].spawn[1],
                z: islands[island.type][island.id].spawn[2],
            });
        }, 60);
    }
});
Minecraft.world.afterEvents.itemUse.subscribe((event) => {
    if (event.itemStack.typeId !== "minecraft:compass")
        return;
    let ui = new MUI.ActionFormData();
    ui.title(`Island Selector`);
    for (let type of Object.keys(isGenData)) {
        ui.button(islandTypeName[isGenData[type].type]);
    }
    ui.show(event.source).then((data) => {
        if (data === null)
            return;
        if (data.selection === undefined)
            return;
        let types = {
            0: "short",
            1: "diagonal",
        };
        let subUI = new MUI.ActionFormData();
        let subIslands = islands[types[data.selection]].filter((is) => { var _a; return is.type === types[(_a = data.selection) !== null && _a !== void 0 ? _a : 0]; });
        let unavailableIslands = {
            short: [],
            diagonal: [],
        };
        for (let is in playerIslands) {
            unavailableIslands[playerIslands[is].type].push(playerIslands[is].id);
        }
        for (let i = 0; i < isGenData[types[data.selection]].island_count; i++) {
            subUI.button(`${islandTypeName[subIslands[i].type]} ${i + 1}\n${unavailableIslands[types[data.selection]].includes(i) ? "§c§l[Unavailable]" : "§a§l[Available]"}`);
        }
        subUI.show(event.source).then((subData) => {
            var _a, _b, _c;
            if (subData === null)
                return;
            if (subData.selection === undefined)
                return;
            if (unavailableIslands[types[(_a = data.selection) !== null && _a !== void 0 ? _a : 0]].includes(subData.selection)) {
                runCommand(`tellraw ${event.source.nameTag} {"rawtext":[{"text":"§cIsland is not available"}]}`);
                return;
            }
            playerIslands[event.source.nameTag] = {
                type: types[(_b = data.selection) !== null && _b !== void 0 ? _b : 0],
                id: subData.selection,
            };
            islandBrigingStatus[types[(_c = data.selection) !== null && _c !== void 0 ? _c : 0]][subData.selection] = false;
        });
    });
});
//# sourceMappingURL=main.js.map