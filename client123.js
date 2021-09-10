var mc = require('minecraft-protocol');
var mineflayer = require('mineflayer');

var client = mc.createClient({
    // host: "localhost",   // optional
    // port: 25565,         // optional
    host: "mc.thearchon.net",   // optional
    username: 'mckayladupart@gmail.com', // minecraft username
    password: 'Snowflake15!',
    version: "1.8.9",
    auth: 'mojang' // optional; by default uses mojang, if using a microsoft account, set to 'microsoft'
});
const bot = mineflayer.createBot({
    client: client
    // host: process.argv[2],
    // port: parseInt(process.argv[3]),
    // username: process.argv[4] ? process.argv[4] : 'gps',
    // password: process.argv[5]
})

bot.on("spawn", function (){
    bot.chat("/outlands")
})

client.on('packet', function (json,packetData,buffer,dullBuffer){
    //console.log(packetData)
    //console.log(json)
    //console.log(buffer)
});

// client.on('chat', function(packet) {
//     // Listen for chat messages and echo them back.
//     var jsonMsg = JSON.parse(packet.message);
//     if(jsonMsg.translate === 'chat.type.announcement' || jsonMsg.translate === 'chat.type.text') {
//         var username = jsonMsg.with[0].text;
//         var msg = jsonMsg.with[1];
//         if(username === client.username) return;
//         client.write('chat', {message: msg});
//     }
//     console.log(packet)
//     console.log(jsonMsg)
// });

// client.on('keep_alive', function(packet) {
//     console.log(packet)
// });

client.on('transaction', function(packet) {
    packet.accepted=true;
    client.write('transaction', packet)
});

bot.once('resourcePack', () => { // resource pack sent by server
    setTimeout(function (){
        bot.acceptResourcePack()
        console.log('ResourcePack Done')
    }, 2000)
})


bot.once("kicked", (reason) => {
    console.log(reason)
})