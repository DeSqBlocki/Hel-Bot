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
        
        const stream = {
            broadcaster_user_login: 'x__hel__x'
        }
        
        interaction.client.emit('Twitch/Online', stream)
        await interaction.reply({
            content: "Done!",
            flags: MessageFlags.Ephemeral
        })
    }
}