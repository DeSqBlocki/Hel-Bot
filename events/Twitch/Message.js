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
        async function sendPositivity() {
            // Function sends a random string of predetermined positivity, Donothon Top Donator Reward
            let positive_Messages = [
                "You are so very worthy of all the love and support that may come your way.",
                "There are many things which draw us together. In this time and place, that lovely subject is you, Hel.",
                "The happiness and joy you add to the world is worth more than most anything.",
                "You deserve every warm laugh, bright smile, and all the genuine kindness given to you.",
                "There are few things as precious as your time. Thank you for sharing with us.",
                "Your feelings are valid and you are not less than for having them.",
                "I've seen all the work you do and I'm so very proud of you.",
                "You are dearly cherished and I want to thank you for being so wonderfully you.",
                "You. Are. Worthy. Enough. And I will tell you as many times as it takes for you to believe it.",
                "Every day you give your best and that is so admirable. Don't let anyone tell you otherwise.",
                "Your light is like that of the full moon, brightening our lives even in our darkest moments.",
                "It's okay to take a moment to catch your breath. Even machines require maintenance from time to time.",
                "Watching you succeed and achieve your heart's desires gives me so much motivation and I am very grateful for it."
            ]

            let rdm = Math.floor(Math.random() * positive_Messages.length)
            return tClient.say(channel, positive_Messages[rdm])
        }
        async function sendDonationAd() {
            // Function to send static donate ad
            const links = [
                "https://bit.ly/heltwittergoals",
                "https://bit.ly/donatetohel",
                "http://bit.ly/donothon_goals"
            ];
        
            const messages = [
                "Hel is currently celebrating her birthday with a donathon!",
                `You can see goals and incentives here: ${links[0]}`,
                `You can donate here: ${links[1]}`,
                `Terms, conditions, rules and how rewards work are found here: ${links[2]}`,
                "All donations and gifts are greatly appreciated, but please do so responsibly!"
            ];
        
            for (const message of messages) {
                await tClient.say(channel, message);
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
                    if (userstate.badges.moderator != 1 && userstate.badges.broadcaster != 1) { break } // return stops all further operations, so you should just break out of switch
                    let regex = /^(on|off)$/
                    if (!args[1].match(regex)) { break }
                    updateChatMode(await getIDByName(channel.substring(1)), args[1])
                    break;
                case "donate":
                    sendDonationAd()
                    break;
                case "positivity":
                    sendPositivity()
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