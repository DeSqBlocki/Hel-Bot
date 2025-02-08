// Event triggered by Raid
module.exports = {
    name: 'Twitch/Raided',
    once: false,
    execute(stream) {
        console.log(`Connected to ${stream.address}`)
    }
}