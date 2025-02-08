// Event triggered by client connected to server
module.exports = {
    name: 'Twitch/Connected',
    once: false,
    execute(address, port) {
        console.log(`Connected to ${address}:${port}`)
    }
}