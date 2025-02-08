require('dotenv').configDotenv
module.exports = {
    name: 'Twitch/Message',
    once: false,
    async execute(channel, userstate, message, self, tClient) {
        const { dClient, mClient } = require('../../index')
        const knownBots = new Set(['streamlabs', 'nightbot', 'moobot', 'soundalerts', 'streamelements', 'remasuri_bot', 'commanderroot', 'x__hel_bot__x'])
async function updateChatMode(userID, setTo) {
    let state
    if (setTo === 'on') {
        state = true
    } else if (setTo === 'off') {
        state = false
    } else {
        return
    }
    await Helix.chat.updateSettings(userID, process.env.mod_id, {
        follower_mode: state,
        follower_mode_duration: 0,
        subscriber_mode: state,
        emote_mode: state
    });
    
}
async function getIDByName(user) {
    const result = await Helix.users.get(user);
    return result.data[0].id
}
async function verifyUser(channel, username) {
    let db = mClient.db("shoutouts")
    let col = db.collection(channel)

    let query = { user: username }
    let status = await col.findOne(query)
    if (!status) {
        dClient.emit('TwitchShoutout', "VIP", channel, username)
        await col.insertOne({
            user: username
        })
    }
}
        if (self) { return }
        if (knownBots.has(userstate.username)) { return }

        if (message.toLowerCase().includes('caw')) {
            tClient.say(channel, 'CAW!')
        } else if (message.toLowerCase().includes('kweh')) {
            tClient.say(channel, 'KWEH!')
        } else if (message.toLowerCase().includes('kaw')) {
            tClient.say(channel, 'KAW!')
        }

        
        if (message.startsWith(process.env.prefix)) {
            const args = message.substring(1).split(" ")
            const cmd = args[0]
            switch (cmd) {
                // case "test":
                //     tClient.say(channel, "/me This is a test message")
                //     break;
                case "mode":
                    if (userstate.badges.moderator != 1 && userstate.badges.broadcaster != 1) { break } // return stops all further operations, so you should just break out of switch
                    let regex = /^(on|off)$/
                    if (!args[1].match(regex)) { break }
                    updateChatMode(await getIDByName(channel.substring(1)), args[1])
                    break;
                // case "donate":
                //     const links = ["https://bit.ly/heltwittergoals", "https://bit.ly/donatetohel","http://bit.ly/donothon_goals"]
                //     tClient.say(channel, "Hel is currently celebrating her birthday with a donathon!")
                //     tClient.say(channel, `You can see goals and incentives here: ${links[0]}`)
                //     tClient.say(channel, `You can donate here: ${links[1]}`)
                //     tClient.say(channel, `Terms, conditions, rules and how rewards work are found here: ${links[2]}`)
                //     tClient.say(channel, `All donations and gifts are greatly appreciated, but please do so responsibly!`)
                //     break;
                case "positivity":
                    let positive_Messages = ["You are so very worthy of all the love and support that may come your way.",
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
                    "Watching you succeed and achieve your heart's desires gives me so much motivation and I am very grateful for it."]

                    let rdm = Math.floor(Math.random() * positive_Messages.length)
                    tClient.say(channel, positive_Messages[rdm])
                    
                    break;
                default:
                    break;
            }
        }
        // ---------------VIP Handler-------------------
        if (!userstate.badges?.vip) { return }
        verifyUser(channel, userstate.username)
        // ---------------------------------------------
    }

}