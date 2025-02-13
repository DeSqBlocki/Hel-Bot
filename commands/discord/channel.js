const { SlashCommandBuilder, ChannelType, MessageFlags } = require('discord.js')
const { mClient } = require('../..')

async function setChannel(interaction) {
    const event = interaction.options.getString('event')
    const channel = interaction.options.getChannel('channel')
    const db = mClient.db('guilds')
    const coll = db.collection(interaction.guild.id)

    try {
        const res = await coll.findOneAndUpdate({
            event: event
        }, {
            $set: {
                channel: channel.id
            }
        }, {
            upsert: true
        })

        return interaction.editReply({
            content: `${channel} now set for Event: ${event}`,
            flags: MessageFlags.Ephemeral
        })
    } catch (error) {
        return interaction.editReply({
            content: `**[ERROR]:** There was an error updating the database: ${error}`,
            flags: MessageFlags.Ephemeral
        }).then(setTimeout(() => {
            interaction.deleteReply()
        }, 5000))
    }
}
async function getChannel(interaction) {
    const event = interaction.options.getString('event')
    const db = mClient.db('guilds')
    const coll = db.collection(interaction.guild.id)

    try {
        const res = await coll.findOne({
            event: event
        })

        return interaction.editReply({
            content: `<#${res.channel}> was previously set for Event: ${event}`,
            flags: MessageFlags.Ephemeral
        })
    } catch (error) {
        return interaction.editReply({
            content: `**[ERROR]:** ${event} is currently not set to any channel`,
            flags: MessageFlags.Ephemeral
        }).then(setTimeout(() => {
            interaction.deleteReply()
        }, 5000))
    }
}
async function unsetChannel(interaction) {
    const event = interaction.options.getString('event')
    const db = mClient.db('guilds')
    const coll = db.collection(interaction.guild.id)

    try {
        await coll.deleteOne({
            event: event
        })

        return interaction.editReply({
            content: `Channel for Event: ${event} has been unset`,
            flags: MessageFlags.Ephemeral
        })
    } catch (error) {
        return interaction.editReply({
            content: `**[ERROR]:** ${event} is currently not set to any channel`,
            flags: MessageFlags.Ephemeral
        }).then(setTimeout(() => {
            interaction.deleteReply()
        }, 5000))
    }
}
module.exports = {
    data: new SlashCommandBuilder()
        .setName('channel')
        .setDescription('channel manager')
        .addSubcommand(s =>
            s
                .setName('set')
                .setDescription('set channel for certain events')
                .addStringOption(o =>
                    o
                        .setName('event')
                        .setDescription('choose the event')
                        .addChoices([
                            { "name": "When a user joins this server", "value": "GuildMemberAdd" },
                            { "name": "When a user left this server", "value": "GuildMemberRemove" },
                            { "name": "When it's a users birthday", "value": "Discord/Birthday" },
                            { "name": "When debug logs are sent", "value": "Discord/Logs" },
                            { "name": "When stream is live", "value": "Twitch/Online" }
                        ])
                        .setRequired(true)
                )
                .addChannelOption(o =>
                    o
                        .setName('channel')
                        .setDescription('where should it be sent to')
                        .setRequired(true)
                        .addChannelTypes(ChannelType.GuildText)
                )
        )
        .addSubcommand(s =>
            s
                .setName('get')
                .setDescription('get channel for certain events')
                .addStringOption(o =>
                    o
                        .setName('event')
                        .setDescription('choose the event')
                        .addChoices([
                            { "name": "When a user joins this server", "value": "GuildMemberAdd" },
                            { "name": "When a user left this server", "value": "GuildMemberRemove" },
                            { "name": "When it's a users birthday", "value": "Discord/Birthday" },
                            { "name": "When debug logs are sent", "value": "Discord/Logs" },
                            { "name": "When stream is live", "value": "Twitch/Online" }
                        ])
                        .setRequired(true)
                )
        )
        .addSubcommand(s =>
            s
                .setName('unset')
                .setDescription('unset channel for certain events')
                .addStringOption(o =>
                    o
                        .setName('event')
                        .setDescription('choose the event')
                        .addChoices([
                            { "name": "When a user joins this server", "value": "GuildMemberAdd" },
                            { "name": "When a user left this server", "value": "GuildMemberRemove" },
                            { "name": "When it's a users birthday", "value": "Discord/Birthday" },
                            { "name": "When debug logs are sent", "value": "Discord/Logs" },
                            { "name": "When stream is live", "value": "Twitch/Online" }
                        ])
                        .setRequired(true)
                )
        ),
    async execute(interaction) {
        if (!interaction.member.permissions.has("ADMINISTRATOR")) {
            return await interaction.reply({
                content: "Unprivileged Access!",
                flags: MessageFlags.Ephemeral
            })
        }
        await interaction.deferReply({ flags: MessageFlags.Ephemeral })
        switch (interaction.options._subcommand) {
            case "set":
                setChannel(interaction)
                break;
            case "get":
                getChannel(interaction)
                break;
            case "unset":
                unsetChannel(interaction)
                break;
            default:
                break;
        }
    }
}