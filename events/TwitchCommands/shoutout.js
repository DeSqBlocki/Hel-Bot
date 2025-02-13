const { mClient, dClient, tClient } = require('../..')
const { updateChatMode, getIDByName } = require('../../functions')
module.exports = {
    name: 'Command/so',
    once: false,
    async execute(channel, userstate, message, self, name) {
        if (userstate.badges.moderator != 1 && userstate.badges.broadcaster != 1) { return }
        const db = mClient.db('commands')
        const coll = db.collection(channel)
        const command = await coll.findOne({ name: 'so' })

        // create in disabled state if not exists
        if (!command) {
            await coll.insertOne({
                name: 'so',
                enabled: false // default
            })
        }
        if (!command?.enabled) { return tClient.say(channel, `This command is currently disabled `) }

        dClient.emit('Twitch/Shoutout', 'command', channel, name)
    }
}