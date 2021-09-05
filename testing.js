
// IMPORTING MODULES
const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals: { GoalNear } } = require('mineflayer-pathfinder')
const blockFinderPlugin = require('mineflayer-blockfinder')(mineflayer);
const inventoryViewer = require('mineflayer-web-inventory')
// IMPORTING MODULES


// CREATING BOT
if (process.argv.length < 4 || process.argv.length > 6) {
    console.log('Usage : node gps.js <host> <port> [<name>] [<password>]')
    process.exit(1)
}
const bot = mineflayer.createBot({
    host: process.argv[2],
    port: parseInt(process.argv[3]),
    username: process.argv[4] ? process.argv[4] : 'gps',
    password: process.argv[5]
})
// CREATING BOT


const RANGE_GOAL = 1 // get within this radius of the player
bot.loadPlugin(blockFinderPlugin);
bot.loadPlugin(pathfinder)
bot.version='1.8.9'
inventoryViewer(bot)

let mcData
bot.once('inject_allowed', () => {
    mcData = require('minecraft-data')(bot.version)
})
// COMMAND LIST
bot.on('chat', async (username, message) => {
    if (username === bot.username) return
    switch (message) {
        case 'loaded':
            await bot.waitForChunksToLoad()
            bot.chat('Ready!')
            break
        case 'dest':
                move(username, 10)
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

    }
})

// COMMAND LIST


// FUNCTIONS
function move(username, i){
    if(isInventoryFull()){
        return;
    }
    const mcData = require('minecraft-data')(bot.version)
    const defaultMove = new Movements(bot, mcData)
    const target = bot.players[username]?.entity
    if (!target) {
        bot.chat("I don't see you !")
        return
    }


    bot.findBlock({
        point: bot.entity.position,
        matching: 17,
        maxDistance: 32,
        count: 1,
    },function(err, blocks) {
        if (err) {
            return bot.chat('Error trying to find Diamond Ore: ' + err)
        }
        if (blocks.length) {
            bot.chat('I found a log at ' + blocks[0].position + '.')
            const { x: playerX, y: playerY, z: playerZ } = blocks[0].position
            bot.pathfinder.setMovements(defaultMove)
            bot.pathfinder.goto(new GoalNear(playerX, playerY, playerZ, 2),
                function(err,result){blockBreak(blocks[0], username, i)}
            )


        } else {
            bot.chat("I couldn't find any log blocks within 32.")
        }

    }
    )
}

function blockBreak(block, username, i){
    let target=block
    if (bot.targetDigBlock) {
        bot.chat(`already digging ${bot.targetDigBlock.name}`)
    } else {
        // target = blocco da rompere
        //




        //target = bot.blockAt(bot.entity.position.offset(0, -1, 0))
        if (target && bot.canDigBlock(target)) {
            bot.chat(`starting to dig ${target.name}`)
            bot.dig(target, onDiggingCompleted)
        } else {
            bot.chat('cannot dig')
        }
    }

    function onDiggingCompleted (err) {
        if (err) {
            console.log(err.stack)
            return
        }
        bot.chat(`finished digging ${target.name}`)
        move(username,i-1)
    }
}

function equipAxe(){
    bot.equip(279, 'hand', (err) => {
        if (err) {
            bot.chat(`unable to equip diamond axe`)
            bot.equip(258, 'hand', (err) => {
                if (err) {
                    bot.chat(`unable to equip iron axe`)
                    bot.equip(275, 'hand', (err) => {
                        if (err) {
                            bot.chat(`unable to equip stone axe`)
                            bot.equip(271, 'hand', (err) => {
                                if (err) {
                                    bot.chat(`unable to equip wooden axe`)
                                } else {
                                    bot.chat('equipped wooden axe')
                                }
                            })
                        } else {
                            bot.chat('equipped stone axe')
                        }
                    })
                } else {
                    bot.chat('equipped iron axe')
                }
            })
        } else {
            bot.chat('equipped diamond axe')
        }
    })
}

//CHECK WHEN INVENTORY IS FULL
function isInventoryFull(){
    let window = bot.inventory
    if(window.emptySlotCount()===0){
        bot.chat('Inventory FULL!!')
        //goHome()
        return true
    }
    return false
}

/*
//HOME COORDS
const home={x:48,y:73,z:157}
//GO HOME
function goHome(){
    const mcData = require('minecraft-data')(bot.version)
    const defaultMove = new Movements(bot, mcData)
    bot.pathfinder.setMovements(defaultMove)
    bot.chat('test')

    bot.pathfinder.goto(new GoalNear(home.x, home.y, home.z, 1), function(err,result){chestHandler()})
    bot.chat('test')

}*/

/*
async function chestHandler(){
    bot.chat('test3')

    bot.chat('test3.5')
    let chestToOpen
    chestToOpen = bot.findBlock({
            matching: 49,
            maxDistance: 6
        },(err) => {
        if (err) {
            return bot.chat('Error trying to find Diamond Ore: ' + err)
        }
    })
        if (!chestToOpen) {
            bot.chat('no chest found')
            return
        }
    bot.chat('test4')
    const chest = await bot.openChest(chestToOpen)
    bot.chat('test5')
    await depositItem("log",10000)
    bot.chat('test6')
    async function depositItem (name, amount) {
        const item = itemByName(chest.items(), name)
        if (item) {
            try {
                await chest.deposit(item.type, null, amount)
                bot.chat(`deposited ${amount} ${item.name}`)
            } catch (err) {
                bot.chat(`unable to deposit ${amount} ${item.name}`)
            }
        } else {
            bot.chat(`unknown item ${name}`)
        }
    }
}*/


function itemByName (items, name) {
    let item
    let i
    for (i = 0; i < items.length; ++i) {
        item = items[i]
        if (item && item.name === name) return item
    }
    return null
}
