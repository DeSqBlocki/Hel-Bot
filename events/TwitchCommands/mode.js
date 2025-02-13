const { mClient, tClient } = require('../..')
const { updateChatMode, getIDByName } = require('../../functions')
module.exports = {
    name: 'Command/mode',
    once: false,
    async execute(channel, userstate, message, self, params) {
        const db = mClient.db('commands')
        const coll = db.collection(channel)
        const command = await coll.findOne({ name: 'mode' })

        // create in disabled state if not exists
        if (!command) {
            await coll.insertOne({
                name: 'mode',
                enabled: false // default
            })
        }
        if (!command?.enabled){ return tClient.say(channel, `This command is currently disabled `) }

        if (userstate.badges.moderator != 1 && userstate.badges.broadcaster != 1) { return }
        let regex = /^(on|off)$/
        if (!params.match(regex)) { return }
        updateChatMode(await getIDByName(channel.substring(1)), params)
    }
}