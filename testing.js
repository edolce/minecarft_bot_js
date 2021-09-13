// IMPORTING MODULES
const mineflayer = require('mineflayer')
const {pathfinder, Movements, goals: {GoalNear}} = require('mineflayer-pathfinder')
const {GoalGetToBlock} = require('mineflayer-pathfinder').goals
const blockFinderPlugin = require('mineflayer-blockfinder')(mineflayer);
const inventoryViewer = require('mineflayer-web-inventory')
// IMPORTING MODULES
var mc = require('minecraft-protocol');
const {Vec3} = require("vec3");


// CREATING CLIENT
var client = mc.createClient({
    //host: 'mc.thearchon.net', // minecraft server ip
    host: 'localhost', // minecraft server ip
    port: '59348', // minecraft server ip
    //username: 'alexander.jonsson2006@outlook.com', // minecraft username
    username: 'mckay',
    password: 'Pappa001+',
    version: "1.8.9"
});


// CREATING BOT
// if (process.argv.length < 4 || process.argv.length > 6) {
//     console.log('Usage : node gps.js <host> <port> [<name>] [<password>]')
//     process.exit(1)
// }

// CREATING BOT
const bot = mineflayer.createBot({
    client: client,
    // host: 'localhost', // minecraft server ip
    // port: '52905', // minecraft server ip
    // username: 'mckayladupart@gmail.com', // minecraft username
    // password: 'Snowflake15!',
    // version: "1.8.9"
})

// TRANSACTION PACKET
client.on('transaction', function (packet) {
    packet.accepted = true;
    client.write('transaction', packet)
});

// LOAD PLUGIN
bot.loadPlugin(blockFinderPlugin);
bot.loadPlugin(pathfinder)
inventoryViewer(bot)

let mcData = require('minecraft-data')(bot.version)
const defaultMove = new Movements(bot, mcData)

bot.once('inject_allowed', () => {
    mcData = require('minecraft-data')(bot.version)
})

// TO DO WHEN SPAWN
bot.on("spawn", function () {
    bot.chat("/outlands")


})

let home = new Vec3(820,88,-932)

// LOAD resourcePack
bot.once('resourcePack', () => { // resource pack sent by server
    setTimeout(function () {
        bot.acceptResourcePack()
        console.log('ResourcePack Done')
    }, 2000)
})
bot.once("kicked", (reason) => {
    console.log(reason)
})

// COMMANDS TO THE BOT
bot.on('chat', async (username, message) => {
    if (username === bot.username) return
    switch (message) {
        case 'first time':
            let blocks = bot.findBlocks({
                matching: 64,
                maxDistance: 2,
                count: 1,
            })
            console.log("looking the door")
            await bot.lookAt(blocks[0])
            console.log("clocking the door")
            await bot.activateBlock(bot.blockAt(blocks[0]))
            console.log("insert code")
            await insertCode()
            console.log("done")
            break
        case 'sethome':
            console.log(message)
            console.log(username)
            const target_ = bot.players["edolce"]?.entity
            home = target_.position.clone()
            break
        case 'start':
            start()
            break
        case 'dest':
            move(username, 10)
            break
        case 'come':
            const mcData = require('minecraft-data')(bot.version)
            const defaultMove = new Movements(bot, mcData)
            const target = bot.players["Edolce"].entity

            if (!target) {
                return
            }

            const {x: playerX, y: playerY, z: playerZ} = target.position
            bot.pathfinder.setMovements(defaultMove)
            bot.pathfinder.setGoal(new GoalNear(playerX, playerY, playerZ, 1))
            break
        case 'go home':
            // Vai a casa
            console.log("Going home")
            await goHome()
            console.log("exit go home function")
            break
        case 'exit home':
            // Vai a casa
            console.log("Exiting home")
            await exitHome()
            console.log("exit exit home function")
            break
        case 'equip':
            equipAxe()
            break
        case 'chest':
            chestHandler()
            break
        case 'cipriano':
            console.log(bot.blockAt(new Vec3(49, 73, 150)))
            break
        case 'tpa edolce':
            console.log()
            bot.chat("/tpa edolce")
            break
    }
})



// FUNCTIONS
function searchResources() {
    return new Promise((resolve) => {
        let blocks = bot.findBlocks({
            matching: (block) => {
                return block && ((block.type === 1 && block.metadata === 5) || (block.type === 14) || (block.type === 15) || (block.type === 16) || (block.type === 17))
            },
            maxDistance: 64,
            count: 1
        })

        if (blocks.length) {
            const {x: playerX, y: playerY, z: playerZ} = blocks[0]
            bot.pathfinder.setMovements(defaultMove)
            bot.pathfinder.goto(new GoalNear(playerX, playerY, playerZ, 1), () => {
                let itemToEquip = bot.pathfinder.bestHarvestTool(bot.blockAt(blocks[0]))
                bot.equip(itemToEquip,"hand").then ((r, err) => {
                    if (err) {
                        console.log('[Start][Resources][Equip]:nessun attrezzo equipaggiabile.')
                    } else {
                        console.log("[Start][Resources][Equip]:Attrezzo equipaggiato.")
                    }
                })
                blockBreak(bot.blockAt(blocks[0]))
            })
        } else {
            console.log("[Start][Resources][Scan]:I couldn't find any log blocks within 64.")
        }
        setTimeout(resolve, 1000)
    })


}

function blockBreak(block) {
    let target = block
    if (bot.targetDigBlock) {
        console.log(`[Start][Resources][Breaking]:Already digging ${bot.targetDigBlock.name}.`)
    } else {
        if (target && bot.canDigBlock(target)) {
            bot.dig(target).then(() => console.log('[Start][Resources][Breaking]:Digg a block of '+target.name))
        } else {
            console.log('cannot dig')
        }
    }
}

function equipAxe() {
    bot.equip(279, 'hand', (err) => {
        if (err) {
            console.log(`unable to equip diamond axe`)
            bot.equip(258, 'hand', (err) => {
                if (err) {
                    console.log(`unable to equip iron axe`)
                    bot.equip(275, 'hand', (err) => {
                        if (err) {
                            console.log(`unable to equip stone axe`)
                            bot.equip(271, 'hand', (err) => {
                                if (err) {
                                    console.log(`unable to equip wooden axe`)
                                } else {
                                    console.log('equipped wooden axe')
                                }
                            })
                        } else {
                            console.log('equipped stone axe')
                        }
                    })
                } else {
                    console.log('equipped iron axe')
                }
            })
        } else {
            console.log('equipped diamond axe')
        }
    })
}

async function firstTimeDoor() {
    let DoorToClick
    bot.findBlock({
            point: bot.entity.position,
            matching: [330, 324],
            maxDistance: 1,
            count: 1
        }, function (err, blocks) {
            secondFunction(err, blocks)
        }
    )


    bot.findBlock({
            point: bot.entity.position,
            matching: 17,
            maxDistance: 32,
            count: 1,
        }, function (err, blocks) {
            secondFunction(err, blocks)
        }
    )


    function firstFunction(err, blocks) {

        if (blocks.length) {
            console.log('I found a door at ' + blocks[0].position + '.')
            const {x: playerX, y: playerY, z: playerZ} = blocks[0].position
            bot.pathfinder.setMovements(defaultMove)
            bot.pathfinder.goto(new GoalNear(playerX, playerY, playerZ, 2),
                function (err, result) {
                    insertCode()
                }
            )


        } else {
            console.log("I couldn't find any door blocks within 32.")
        }

        if (err) {
            return console.log('Error trying to find door: ' + err)
        }
        if (blocks.length) {
            console.log('I found a door at ' + blocks[0].position + '.')
            DoorToClick = blocks[0]
        }
    }


    const secondFunction = async (err, blocks) => {
        await firstFunction(err, blocks)

        if (!DoorToClick) {
            console.log('no door found')
            return
        }
        await bot.activateBlock(DoorToClick)
        insertCode()
    }
}

async function insertCode() {

    bot.clickWindow(12, 0, 0)
    console.log("first click")

    await setTimeout(function () {
        bot.clickWindow(22, 0, 0)
        console.log("second click")
    }, 1000);


    await setTimeout(function () {
        bot.clickWindow(32, 0, 0)
        console.log("thirdt click")
    }, 2000);

    await setTimeout(function () {
        bot.clickWindow(14, 0, 0)
    }, 3000);
    await setTimeout(function () {
        bot.clickWindow(30, 0, 0)
    }, 4000);
    await setTimeout(function () {
        bot.clickWindow(41, 0, 0)
    }, 5000);
}

function joinOutlands() {
    bot.simpleClick.rightMouse(4)
    bot.clickWindow(12, 0, 0)
}

function walkAround() {
}

//CHECK WHEN INVENTORY IS FULL
function isInventoryFull() {
    let window = bot.inventory
    return window.emptySlotCount() === 0;

}

//CHECK IF CHEST IS FULL
function isChestFull(chest) {
    console.log(chest.firstEmptyContainerSlot())
    if (chest.firstEmptyContainerSlot() === null) {
        console.log('Chest FULL')
        return true
    }
    return false
}


//HOME COORDS
// const home = {x: 48, y: 73, z: 157}

//GO HOME
async function goHome() {
    bot.pathfinder.setMovements(defaultMove)
    await bot.pathfinder.goto(new GoalNear(home.x, home.y, home.z, 8), function () {
        console.log("[Start][Home]:Searching door.")
    })
    await enterHome()
    console.log("[Start][Resources]:Destination of home reached.")
}


async function chestHandler() {
    let chestToOpen
    bot.findBlock({
            point: bot.entity.position,
            matching: 54,
            maxDistance: 6,
            count: 1
        }, function (err, blocks) {
            secondFunction(err, blocks)
        }
    )

    function firstFunction(err, blocks) {
        // do some asynchronous work
        // and when the asynchronous stuff is complete

        if (err) {
            return console.log('Error trying to find chest: ' + err)
        }
        if (blocks.length) {
            console.log('I found a chest at ' + blocks[0].position + '.')
            chestToOpen = blocks[0]

        }


    }


    const secondFunction = async (err, blocks) => {
        await firstFunction(err, blocks)
        // do something else here after firstFunction completes
        if (!chestToOpen) {
            console.log('no chest found')
            return
        }
        const chest = await bot.openChest(chestToOpen)
        await depositItem("log", 10000)

        async function depositItem(name, amount) {
            const item = itemByName(chest.items(), name)
            if (item) {
                try {
                    await chest.deposit(item.type, null, amount)
                    console.log(`deposited ${amount} ${item.name}`)
                } catch (err) {
                    console.log(`unable to deposit ${amount} ${item.name}`)
                }
            } else {
                console.log(`unknown item ${name}`)
            }
            closeChest()
        }

        function closeChest() {
            chest.close()
            bot.removeListener('chat', onChat)
        }
    }
}

async function chestHandler_2(chestToOpen) {
    let continue_ = false

    if (!chestToOpen) {
        console.log('[Start][Chest][Scan]:No chest found.')
        return false
    }

    const chest = await bot.openChest(chestToOpen)

    console.log('[Start][Chest][Scan]:Checking if chest is full.')
    if (isChestFull(chest)) {
        console.log('[Start][Chest][Scan]:Chest is full close chest.')
        closeChest()
        return true
    }
    console.log('[Start][Chest][Deposit]:Chest is not full, start depositing items.')
    await depositItem("log", 10000)
    await depositItem("feather", 10000)
    await depositItem("paper", 10000)
    await depositItem("leather", 10000)
    await depositItem("diamond", 10000)
    await depositItem("porkchop", 10000)
    await depositItem("iron_ingot", 10000)
    await depositItem("chicken", 10000)
    await depositItem("beef", 10000)
    await depositItem("bone", 10000)
    await depositItem("gold_ingot", 10000)
    await depositItem("mutton", 10000)

    if (chest.emptySlotCount() < 27) {
        console.log('[Start][Chest][Deposit]:not enough space to deposit item searching for new chest.')
        continue_ = true
    }


    await closeChest()

    console.log('[Start][Chest][Deposit]:Deposit complete.')
    return continue_

    async function depositItem(name, amount) {
        const item = itemByName(chest.items(), name)
        if (item) {
            try {
                await chest.deposit(item.type, null, amount)
                console.log(`[Start][Chest][Deposit]:Deposited ${amount} ${item.name}.`)
            } catch (err) {
                console.log(`[Start][Chest][Scan]:Unable to deposit ${amount} ${item.name}.`)
            }
        } else {
            console.log(`[Start][Chest][Scan]:The bot doesn't have ${name}.`)
        }
    }

    function closeChest() {
        chest.close()
    }


}

function itemByName(items, name) {
    let item
    let i
    for (i = 0; i < items.length; ++i) {
        item = items[i]
        if (item && item.name === name) return item
    }
    return null
}

// START FUNCTION
async function start() {
    while (true) {
        //Check if inventory is full
        if (isInventoryFull()) {
            console.log("[Start][Inventory]:Inventory is full.")

            // Vai a casa
            console.log("[Start][Home]:Going home.")
            await goHome()
            console.log("[Start][Home]:Exit go home function.")

            // Scan all the chests
            console.log("[Start][Deposit]:Starting to scan all the chests.")
            await scanChests()
            console.log("[Start][Deposit]:exit scan chests function.")

            // Exit Home
            await exitHome()
        }
        console.log("[Start][Resources]:Staring searching for resources.")
        //Search nearby resources

        await searchResources()

        console.log("[Start][end]:End of cycle.")
    }


}

// Scan all chests
function scanChests() {


    bot.findBlock({
            point: bot.entity.position,
            matching: 54,
            maxDistance: 10,
            count: 50,
        },
        async function (err, blocks) {
            if (err) {
                console.log("[ERROR] => [Start][Chest][Scan]:Error searching for chests.")
            }
            if (blocks.length) {
                console.log(blocks.length + " chest founded")
                let nextChest = true
                for (let i = 0; nextChest; i++) {

                    nextChest = false
                    bot.pathfinder.setMovements(defaultMove)
                    console.log("[Start][Chest][Scan]:Going near chest.")
                    await bot.pathfinder.goto(new GoalGetToBlock(blocks[i].position.x, blocks[i].position.y, blocks[i].position.z), async function () {
                        console.log("[Start][Chest][Scan]:Chest reached.")
                    })
                    nextChest = await chestHandler_2(blocks[i])
                }
            } else {
                console.log("[Start][Chest][Scan]:No chests found.")
            }
        });
}

// Enter Home
async function enterHome() {
    let blocks = bot.findBlocks({
        matching: 64,
        maxDistance: 10,
        count: 1,
    })
    console.log(blocks)
    let target = blocks[0]
    bot.pathfinder.setMovements(defaultMove)
    console.log("[Start][Door][Enter]:Going near door.")
    await bot.pathfinder.goto(new GoalGetToBlock(target.x, target.y, target.z), function () {
        console.log("[Start][Door][Enter]:Door reached.")
    })
    console.log("[Start][Resources][Enter]:Opening the door")
    await bot.activateBlock(bot.blockAt(target))

    // await bot.clickWindow(0, 0, 0, err => {
    //     if(err){
    //
    //     }else {
    //         firstTimeDoor()
    //     }
    // })
    console.log("[Start][Door][Enter]:Entering inside home.")
    await goForward()

}

// Exit Home
async function exitHome() {
    let blocks = bot.findBlocks({
        matching: 64,
        maxDistance: 10,
        count: 1,
    })
    console.log(blocks)
    let target = blocks[0]
    bot.pathfinder.setMovements(defaultMove)
    console.log("[Start][Door][Exit]:Going near door.")
    await bot.pathfinder.goto(new GoalGetToBlock(target.x, target.y, target.z), function () {
        console.log("[Start][Door][Exit]:Door reached.")
    })
    console.log("[Start][Door][Exit]:Opening the door.")
    await bot.activateBlock(bot.blockAt(target))
    console.log("[Start][Door][Exit]:Exit from home.")
    await goForward()

}

function goForward() {
    return new Promise((resolve) => {
        bot.setControlState('forward', true)
        setTimeout(() => {
            bot.setControlState('forward', false)
        }, 1000)
        setTimeout(resolve, 1000);
    })
}