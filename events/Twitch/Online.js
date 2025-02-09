const { EmbedBuilder, escapeMarkdown, MessageFlags } = require("discord.js")
const { mClient, dClient } = require("../..")
const { getStreams } = require('../../functions')

module.exports = {
    name: 'Twitch/Online',
    once: false,
    async execute(stream) {
        const db = mClient.db('guilds')
        const res = await db.listCollections().toArray()
        const streamer = stream.broadcaster_user_login

        res.forEach(async (guildColl) => {
            const guildId = guildColl.name
            const coll = db.collection(guildId)
            const res = await coll.findOne({ event: 'Twitch/Online' })
            if(!res){
                return // ignore if no live channel set
            }
            const guild = dClient.guilds.cache.get(guildId)
            const channel = guild.channels.cache.get(res.channel)

            try {
                const streamData = await getStreams(streamer)

                if (streamData?.data[0]) {
                    let liveData = {
                        streamer: streamData.data[0].user_name,
                        game: streamData.data[0].game_name,
                        title: streamData.data[0].title,
                        thumbnail: streamData.data[0].thumbnail_url.replace('-{width}x{height}', ''),
                        tags: streamData.data[0].tags
                    }

                    const embed = new EmbedBuilder()
                        .setTitle(`${escapeMarkdown(liveData.streamer)} is live!`)
                        .setDescription(`They're playing ${liveData.game}`)
                        .addFields(
                            { name: '\u200B', value: `${liveData.title}` })
                        .setImage(liveData.thumbnail)
                        .setURL(`https://twitch.tv/${streamer}`)
                    let footer = ""
                    liveData.tags.forEach((tag) => {
                        footer += `#${tag} `
                    })
                    embed.setFooter({
                        text: footer
                    })

                    return channel.send({
                        embeds: [embed],
                        flags: MessageFlags.Ephemeral
                    }).then(message => setTimeout(() => {
                        message.deleteReply()
                    }, 60000))
                } else {
                    const embed = new EmbedBuilder()
                        .setTitle(`${escapeMarkdown(streamer)} is currently offline!`)
                        .setImage('https://media.discordapp.net/attachments/1061304429724319794/1319800268770250883/no-signal-tv-descendant-network-rainbow-bars-abstract-background-vector.jpg?ex=67674748&is=6765f5c8&hm=d539944a67fccec461b0183a9f0300e19ac485deda7b23090165088567f2c84f&=&format=webp')
                        .setURL(`https://twitch.tv/${streamer}`)
                    return channel.send({
                        embeds: [embed],
                        flags: MessageFlags.Ephemeral
                    })
                }
            } catch (error) {
                return console.error
            }
        })

    }
}