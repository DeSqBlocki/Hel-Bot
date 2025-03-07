const { SlashCommandBuilder, Events, MessageFlags } = require('discord.js')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('simjoin')
        .setDescription('simulates a join event')
        .addMentionableOption((option) => 
            option.setName('target').setDescription('user')),
    async execute(interaction) {
        
        if(!interaction.member.permissions.has("ADMINISTRATOR")){ 
            return await interaction.reply({
                content: "Unprivileged Access!",
                flags: MessageFlags.Ephemeral
            })
        }
        
        let target = interaction.options.getMentionable('target')
        if(!target){
            target = interaction.member
        }
        try {
            if(target.user.username){
                interaction.client.emit(Events.GuildMemberAdd, target)
                await interaction.reply({
                    content: "Done!",
                    flags: MessageFlags.Ephemeral
                })
            }
        } catch (error) {
            await interaction.reply({
                content: "Invalid Mentionable!",
                flags: MessageFlags.Ephemeral
            })
        }
        
        
        
    }
}