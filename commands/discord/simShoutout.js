const { SlashCommandBuilder } = require('discord.js')
const { mClient } = require('../..')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('simshoutout')
        .setDescription('simulates a shoutout event'),
    async execute(interaction) {
        await interaction.deferReply()
        if (!interaction.member.permissions.has("ADMINISTRATOR")) {
            return await interaction.editReply({
                content: "Unprivileged Access!",
                ephemeral: true
            })
        }
        let channel = '#desq_blocki'
        let username = 'desq_blocki'
        
        let db = mClient.db("shoutouts")
        let col = db.collection(channel)

        let query = { user: username }
        let status = await col.findOne(query)
        if (!status) {
            interaction.client.emit("TwitchShoutout", "TEST", channel, username)
            await col.insertOne({
                user: username
            })
            await interaction.editReply({
                content: "Done!",
                ephemeral: true
            })
        } else {
            await interaction.editReply({
                content: "Already in Database",
                ephemeral: true
            })
        }


    }
}