// IMPORTING MODULES
const mineflayer = require('mineflayer')
const {pathfinder, Movements, goals: {GoalNear}} = require('mineflayer-pathfinder')
const blockFinderPlugin = require('mineflayer-blockfinder')(mineflayer);
const inventoryViewer = require('mineflayer-web-inventory')
// IMPORTING MODULES
var mc = require('minecraft-protocol');

var client = mc.createClient({
    host: 'mc.thearchon.net', // minecraft server ip
    username: 'mckayladupart@gmail.com', // minecraft username
    password: 'Snowflake15!',
    version: "1.8.9"
});


// CREATING BOT
// if (process.argv.length < 4 || process.argv.length > 6) {
//     console.log('Usage : node gps.js <host> <port> [<name>] [<password>]')
//     process.exit(1)
// }
const bot = mineflayer.createBot({
    client: client,
    // host: process.argv[2],
    // port: parseInt(process.argv[3]),
    // username: process.argv[4] ? process.argv[4] : 'gps',
    // password: process.argv[5]
})
// CREATING BOT
client.on('transaction', function(packet) {
    packet.accepted=true;
    client.write('transaction', packet)
});

bot.loadPlugin(blockFinderPlugin);
bot.loadPlugin(pathfinder)
inventoryViewer(bot)

let mcData
bot.once('inject_allowed', () => {
    mcData = require('minecraft-data')(bot.version)
})
bot.on("spawn", function (){
    bot.chat("/outlands")
})
bot.once('resourcePack', () => { // resource pack sent by server
    setTimeout(function (){
        bot.acceptResourcePack()
        console.log('ResourcePack Done')
    }, 2000)
})
bot.once("kicked", (reason) => {
    console.log(reason)
})

// COMMAND LIST
bot.on('chat', async (username, message) => {
    if (username === bot.username) return
    switch (message) {
        case 'loaded':
            await bot.waitForChunksToLoad()
            console.log('Ready!')
            break
        case 'dest':
            move(username, 10)
            break
        case 'come':
            const mcData = require('minecraft-data')(bot.version)
            const defaultMove = new Movements(bot, mcData)
            const target = bot.players[username]?.entity

            if (!target) {
                bot.chat("I don't see you !")
                return
            }

            const { x: playerX, y: playerY, z: playerZ } = target.position
            bot.pathfinder.setMovements(defaultMove)
            bot.pathfinder.setGoal(new GoalNear(playerX, playerY, playerZ, 1))
            break
        case 'break':
            blockBreak()
            break
        case 'equip':
            equipAxe()
            break
        case 'chest':
            chestHandler()
            break
        case 'cipriano':
            joinOutlands()
            break
        case 'tpa edolce':
            console.log()
            bot.chat("/tpa edolce")
            break
    }
})

// COMMAND LIST


// FUNCTIONS
function move(username, i) {
    if (isInventoryFull()) {
        chestHandler()
        return;
    }
    const mcData = require('minecraft-data')(bot.version)
    const defaultMove = new Movements(bot, mcData)


    bot.findBlock({
            point: bot.entity.position,
            matching: 17,
            maxDistance: 32,
            count: 1,
        }, function (err, blocks) {
            if (blocks.length) {
                const {x: playerX, y: playerY, z: playerZ} = blocks[0].position
                bot.pathfinder.setMovements(defaultMove)
                bot.pathfinder.goto(new GoalNear(playerX, playerY, playerZ, 2),
                    function (err, result) {
                        blockBreak(blocks[0], username, i)
                    }
                )


            } else {
                console.log("I couldn't find any log blocks within 32.")
            }

        }
    )
}

function blockBreak(block, username, i) {
    let target = block
    if (bot.targetDigBlock) {
        console.log(`already digging ${bot.targetDigBlock.name}`)
    } else {
        // target = blocco da rompere
        //


        //target = bot.blockAt(bot.entity.position.offset(0, -1, 0))
        if (target && bot.canDigBlock(target)) {
            bot.dig(target, onDiggingCompleted)
        } else {
            console.log('cannot dig')
        }
    }

    function onDiggingCompleted(err) {
        if (err) {
            console.log(err.stack)
            return
        }
        move(username, i - 1)
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

async function firstTimeDoor(){
    let DoorToClick
    bot.findBlock({
            point: bot.entity.position,
            matching: [330,324],
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


    function firstFunction(err,blocks){

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

function insertCode(){
    bot.clickWindow(12,0,0)
    setTimeout(function (){
        bot.clickWindow(22,0,0)
    }, 1000);
    setTimeout(function (){
        bot.clickWindow(32,0,0)
    }, 2000);
    setTimeout(function (){
        bot.clickWindow(14,0,0)
    }, 3000);
    setTimeout(function (){
        bot.clickWindow(30,0,0)
    }, 4000);
    setTimeout(function (){
        bot.clickWindow(41,0,0)
    }, 5000);
}

function joinOutlands(){
    bot.simpleClick.rightMouse(4)
    bot.clickWindow(12,0,0)
}

function walkAround(){}

//CHECK WHEN INVENTORY IS FULL
function isInventoryFull() {
    let window = bot.inventory
    if (window.emptySlotCount() === 0) {
        console.log('Inventory FULL!!')
        goHome()
        return true
    }
    return false
}

//CHECK IF CHEST IS FULL
function isChestFull(chest){
    if (chest.emptySlotCount() === 0) {
        console.log('Chest FULL')
        return true
    }
}


//HOME COORDS
const home={x:48,y:73,z:157}
//GO HOME
function goHome(){
    const mcData = require('minecraft-data')(bot.version)
    const defaultMove = new Movements(bot, mcData)
    bot.pathfinder.setMovements(defaultMove)
    bot.pathfinder.goto(new GoalNear(home.x, home.y, home.z, 1), function(err,result){chestHandler()})
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


    function firstFunction(err,blocks){
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

        function closeChest () {
            chest.close()
            bot.removeListener('chat', onChat)
        }
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
