const { mClient, dClient, tClient } = require('../..')
const { updateChatMode, getIDByName } = require('../../functions')

require('dotenv').configDotenv
module.exports = {
    name: 'Twitch/Message',
    once: false,
    async execute(channel, userstate, message, self) {
        const knownBots = new Set(['streamlabs', 'nightbot', 'moobot', 'soundalerts', 'streamelements', 'remasuri_bot', 'commanderroot', 'x__hel_bot__x'])
        async function emitShoutoutInfo(channel, username) {
            // Function sends information to the Shoutout Handler if they haven't been shouted out before, default target: VIPs
            let db = mClient.db("shoutouts")
            let col = db.collection(channel)
            let status = await col.findOne({ user: username })

            if (!status) {
                dClient.emit('Twitch/Shoutout', "VIP", channel, username, tClient)
                await col.insertOne({
                    user: username,
                    created_at: Date()
                })
            }
        }
        
        if (self) { return }
        if (knownBots.has(userstate.username)) { return }

        const reactTriggers = {
            caw: 'CAW!',
            kaw: 'KAW!',
            kweh: 'KWEH!'
        }

        const reactRegex = /(caw|kweh|kaw)/i // Non-Strict Trigger
        // const reactRegex = /\b(caw|kaw|kweh)\b/i; // Strict Trigger 

        if (reactRegex.test(message)) {
            const match = message.match(reactRegex)[0].toLowerCase();
            tClient.say(channel, reactTriggers[match]);
        }


        if (message.startsWith(process.env.PREFIX)) {
            const args = message.substring(1).split(" ")
            const cmd = args[0]
            switch (cmd) {
                case "mode":
                    dClient.emit('Command/mode', channel, userstate, message, self, args[1])
                    break;
                case "donate":
                    dClient.emit('Command/donate', channel, userstate, message, self)
                    break;
                case "positivity":
                    dClient.emit('Command/positivity', channel, userstate, message, self)
                    break;
                case "commands":
                    dClient.emit('Command/commands',  channel, userstate, message, self, args[1], args[2])
                    break;
                default:
                    break;
            }
        }

        // ---------------VIP Handler-------------------
        if (!userstate.badges?.vip) { return }
        emitShoutoutInfo(channel, userstate.username)
        // ---------------------------------------------
    }

}