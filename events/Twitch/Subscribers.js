// Event triggered by SubscribersOnly mode
module.exports = {
    name: 'Twitch/Subscribers',
    once: false,
    execute(stream) {
        console.log(`Connected to ${stream.address}`)
    }
}