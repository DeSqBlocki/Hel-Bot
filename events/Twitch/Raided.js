const { dClient, tClient } = require("../..")

// Event triggered by Raid
module.exports = {
    name: 'Twitch/Raided',
    once: false,
    execute(channel, username, raiders) {
        tClient.say(channel, `${username} entrusted us with ${raiders} people of their community, welcome xhelxBlankie`)
        dClient.emit('Twitch/Shoutout', "RAID", channel, username)
    }
}