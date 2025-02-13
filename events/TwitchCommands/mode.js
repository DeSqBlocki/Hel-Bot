const { mClient } = require('../..')
const { updateChatMode, getIDByName } = require('../../functions')
module.exports = {
    name: 'Command/mode',
    once: false,
    async execute(channel, userstate, message, self, params) {
        const db = mClient.db('channels')
        const coll = db.collection(channel)
        const command = await coll.findOne({ name: 'mode' })

        // create if not exists
        if (!command) {
            await coll.insertOne({
                name: 'mode',
                enabled: false // default
            })
        }
        if (!command.enabled){ return }

        if (userstate.badges.moderator != 1 && userstate.badges.broadcaster != 1) { return }
        let regex = /^(on|off)$/
        if (!params.match(regex)) { return }
        updateChatMode(await getIDByName(channel.substring(1)), params)
    }
}