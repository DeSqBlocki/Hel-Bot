const { mClient, tClient } = require("../..");

module.exports = {
    name: 'Command/settings',
    once: false,
    async execute(channel, userstate, message, self, state, name) {
        if (userstate.badges.moderator != 1 && userstate.badges.broadcaster != 1) { return }
        const db = mClient.db('commands')
        const coll = db.collection(channel)
        const command = await coll.findOne({ name: 'settings' })

        // create in disabled state if not exists
        if (!command) {
            await coll.insertOne({
                name: 'settings',
                enabled: true,
                default: true
            })
        }
        if (!command?.enabled) { return tClient.say(channel, `This command is currently disabled `) }

        const db2 = mClient.db('settings')
        const coll2 = db2.collection(channel)

        // Default non-admin mode, give list of all enabled commands
        if (!name) {
            const settings = await coll2.find({}).toArray()
            var settingsList = []
            console.log(settings)
            settings.forEach((setting) => {
                settingsList.push(` ${setting.name}(${setting.enabled?'✅':'❌'})`)
            })
            if (settingsList.length == 0) {
                return await tClient.say(channel, `No settings available in this channel`)
            }
            return await tClient.say(channel, `Settings List: ${settingsList.toString()}`)
        }

        if (!state) { return }

        // Parameters are valid
        switch (state) {
            case 'enable':
                state = true
                break;
            case 'disable':
                state = false
                break;
            default:
                return tClient.say(channel, `invalid state, expecting 'enable' or 'disable'`)
        }
        // command is valid
        
        const findSetting = await coll2.findOne({ name: name })
        if (!findSetting) { return await tClient.say(channel, `Setting [${name}] not found.`) }


        await coll2.findOneAndUpdate({
            name: name
        }, {
            $set: { enabled: state }
        }, {
            upsert: true
        })

        return await tClient.say(channel, `[${name}] has been set to [${state}]`)

    }
}