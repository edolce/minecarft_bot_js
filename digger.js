/*
 * Never spend hours mining from ground to bedrock again!
 *
 * Learn how to create a simple bot that is capable of digging the block
 * below his feet and then going back up by creating a dirt column to the top.
 *
 * As always, you can send the bot commands using chat messages, and monitor
 * his inventory at any time.
 *
 * Remember that in survival mode he might not have enough dirt to get back up,
 * so be sure to teach him a few more tricks before leaving him alone at night.
 */
const mineflayer = require('mineflayer')
const vec3 = require('vec3')



const bot = mineflayer.createBot({
    host: 'mc.thearchon.net', // minecraft server ip
    username: 'mckayladupart@gmail.com', // minecraft username
    password: 'Snowflake15!',
    version: "1.8.9"
    // host: process.argv[2],
    // port: parseInt(process.argv[3]),
    // username: process.argv[4] ? process.argv[4] : 'gps',
    // password: process.argv[5]
})

bot.on('chat', async (username, message) => {
    if (username === bot.username) return
    switch (message) {
        case 'loaded':
            await bot.waitForChunksToLoad()
            bot.chat('Ready!')
            break
        case 'list':
            sayItems()
            break
        case 'dig':
            dig()
            break
        case 'build':
            build()
            break
        case 'equip dirt':
            equipDirt()
            break
    }
})

function sayItems (items = bot.inventory.items()) {
    const output = items.map(itemToString).join(', ')
    if (output) {
        bot.chat(output)
    } else {
        bot.chat('empty')
    }
}

function dig () {
    let target
    if (bot.targetDigBlock) {
        bot.chat(`already digging ${bot.targetDigBlock.name}`)
    } else {
        target = bot.blockAt(bot.entity.position.offset(0, -1, 0))
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
    }
}

function build () {
    const referenceBlock = bot.blockAt(bot.entity.position.offset(0, -1, 0))
    const jumpY = Math.floor(bot.entity.position.y) + 1.0
    bot.setControlState('jump', true)
    bot.on('move', placeIfHighEnough)

    let tryCount = 0

    function placeIfHighEnough () {
        if (bot.entity.position.y > jumpY) {
            bot.placeBlock(referenceBlock, vec3(0, 1, 0), (err) => {
                if (err) {
                    tryCount++
                    if (tryCount > 10) {
                        bot.chat(err.message)
                        bot.setControlState('jump', false)
                        bot.removeListener('move', placeIfHighEnough)
                        return
                    }
                    return
                }
                bot.setControlState('jump', false)
                bot.removeListener('move', placeIfHighEnough)
                bot.chat('Placing a block was successful')
            })
        }
    }
}

function equipDirt () {
    const mcData = require('minecraft-data')(bot.version)
    let itemsByName
    if (bot.supportFeature('itemsAreNotBlocks')) {
        itemsByName = 'itemsByName'
    } else if (bot.supportFeature('itemsAreAlsoBlocks')) {
        itemsByName = 'blocksByName'
    }
    bot.equip(mcData[itemsByName].dirt.id, 'hand', (err) => {
        if (err) {
            bot.chat(`unable to equip dirt: ${err.message}`)
        } else {
            bot.chat('equipped dirt')
        }
    })
}

function itemToString (item) {
    if (item) {
        return `${item.name} x ${item.count}`
    } else {
        return '(nothing)'
    }
}