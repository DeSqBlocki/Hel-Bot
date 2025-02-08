const { SlashCommandBuilder, MessageFlags } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('simlive')
        .setDescription('simulates a live event'),
    async execute(interaction) {
        if(!interaction.member.permissions.has("ADMINISTRATOR")){ 
            return await interaction.reply({
                content: "Unprivileged Access!",
                flags: MessageFlags.Ephemeral
            })
        }
        
        const streamer = 'x__hel__x'
        interaction.client.emit('Twitch/Live', streamer)
        await interaction.reply({
            content: "Done!",
            flags: MessageFlags.Ephemeral
        })
    }
}