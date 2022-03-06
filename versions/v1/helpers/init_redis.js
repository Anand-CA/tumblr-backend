const redis = require('redis');

const client = redis.createClient({
    port: 6379,
    host : "127.0.0.1"
})

client.on('connect',()=>{
    console.log("Connected To Redis")
})

client.on('ready',()=>{
    console.log("Ready")
})

client.on('error',(err)=>{
    console.log(err.message)
})

client.on('end',()=>{
    console.log("Disconnected From Redis")
})

process.on('SIGINT',()=>{
    client.quit()
})


module.exports = client