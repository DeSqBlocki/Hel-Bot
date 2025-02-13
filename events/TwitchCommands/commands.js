const { mClient, tClient } = require("../..");

module.exports = {
    name: 'Command/commands',
    once: false,
    async execute(channel, userstate, message, self, name, state) {
        const db = mClient.db('channels')
        const coll = db.collection(channel)
        const command = await coll.findOne({ name: 'commands' })

        // create if not exists
        if (!command) {
            await coll.insertOne({
                name: 'commands',
                enabled: false // default
            })
        }

        // Default non-admin mode, give list of all enabled commands
        if (!name) {
            const commands = await coll.find({ enabled: true }).toArray()
            var commandList = []
            commands.forEach((command) => {
                if (command.enabled) {
                    commandList.push(command.name)
                }
            })
            if (commandList.length == 0) {
                return await tClient.say(channel, `No commands enabled in this channel`)
            }
            console.log(commandList)
            await tClient.say(channel, `Command List: ${commandList.toString()}`)
        }

        if (userstate.badges.moderator != 1 && userstate.badges.broadcaster != 1) { return }

        if (!state) { return }

        // Admin Mode & Additional Parameters were given

        // Parameters are valid
        switch (state) {
            case 'on':
                state = true
                break;
            case 'off':
                state = false
                break;
            default:
                break;
        }

        // command is valid
        const findCommand = await coll.findOne({ name: name })
        if (!findCommand) { return await tClient.say(channel, `Command [${name}] not found. Try using it first if it exists`) }


        await coll.findOneAndUpdate({
            name: name
        }, {
            $set: { enabled: state }
        }, {
            upsert: true
        })

        await tClient.say(channel, `[${name}] has been set to [${state}]`)
    }
}