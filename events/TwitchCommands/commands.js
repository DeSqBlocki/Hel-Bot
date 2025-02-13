const { mClient, tClient } = require("../..");

module.exports = {
    name: 'Command/commands',
    once: false,
    async execute(channel, userstate, message, self, state, name) {
        const db = mClient.db('commands')
        const coll = db.collection(channel)
        const defaultCommands = await coll.find({ default: true}).toArray()
        var isDefault = false
        defaultCommands.forEach((command) => {
            if(command.default && command.name == name ){ 
                isDefault = true
            }
        })
        if (isDefault){
            return tClient.say(channel, `${name} can't be modified`) 
        }
        const command = await coll.findOne({ name: 'commands' })

        // create in disabled state if not exists
        if (!command) {
            await coll.insertOne({
                name: 'commands',
                enabled: true,
                default: true
            })
        }

        // Default non-admin mode, give list of all enabled commands
        if (!name) {
            const commands = await coll.find({}).toArray()
            var commandList = []
            commands.forEach((command) => {
                if(userstate.badges.moderator != 1 && userstate.badges.broadcaster != 1){
                    commandList.push(` ${command.name}`)
                } else {
                    commandList.push(` ${command.name}(${command.enabled?'✅':'❌'})`)
                }
                
            })
            if (commandList.length == 0) {
                return await tClient.say(channel, `No commands available in this channel`)
            }
            return await tClient.say(channel, `Command List: ${commandList.toString()}`)
        }

        if (userstate.badges.moderator != 1 && userstate.badges.broadcaster != 1) { return }

        if (!state) { return }
        
        // Admin Mode & Additional Parameters were given

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
        
        const findCommand = await coll.findOne({ name: name })
        if (!findCommand) { return await tClient.say(channel, `Command [${name}] not found. Try using it first if it exists`) }


        await coll.findOneAndUpdate({
            name: name
        }, {
            $set: { enabled: state }
        }, {
            upsert: true
        })

        return await tClient.say(channel, `[${name}] has been set to [${state}]`)
    }
}