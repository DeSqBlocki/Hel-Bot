const { Events, ActivityType } = require('discord.js')
module.exports = {
    name: Events.ClientReady,
    once: false,
    execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`)
        client.user.setActivity("chaos & comf", {
            type: ActivityType.Streaming,
            url: "https://www.twitch.tv/x__hel__x"
        });
    }
}