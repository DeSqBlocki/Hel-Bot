const { SlashCommandBuilder, Events } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('simlive')
        .setDescription('simulates a live event'),
    async execute(interaction) {
        if(!interaction.member.permissions.has("ADMINISTRATOR")){ 
            return await interaction.reply({
                content: "Unprivileged Access!",
                ephemeral: true
            })
        }
        
        const streamer = 'x__hel__x'
        interaction.client.emit('TwitchLive', streamer)
        await interaction.reply({
            content: "Done!",
            ephemeral: true
        })
        
    }
}