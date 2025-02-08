const { mClient } = require("../..")

// Event triggered by SubscribersOnly mode
module.exports = {
    name: 'Twitch/Subscribers',
    once: false,
    async execute(channel, enabled) {

        let db = mClient.db('shoutouts')
        let col = db.collection(channel)

        // Drop Shoutout Collection to reset 
        try {
            await col.drop()
        } catch (error) {
            return
        }
    }
}