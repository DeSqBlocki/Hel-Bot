const { dClient } = require("../..")

// Event triggered by client connected to server
module.exports = {
    name: 'Twitch/Connected',
    once: false,
    async execute(address, port) {
        console.log(`Connected to ${address}:${port}`)
        dClient.emit('Twitch/EventSub')
    }
}