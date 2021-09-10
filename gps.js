const mineflayer = require('mineflayer')

const bot = mineflayer.createBot({
    host: 'mc.thearchon.net', // minecraft server ip
    username: 'mckayladupart@gmail.com', // minecraft username
    password: 'Snowflake15!',
    version: "1.8.9"
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


bot.on('resourcePack', (url, hash) => console.log(url + ' | ' + hash))