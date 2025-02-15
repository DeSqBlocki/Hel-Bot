const { EmbedBuilder, escapeMarkdown, MessageFlags } = require("discord.js")
const { mClient, dClient } = require("../..")
const { getStreams } = require('../../functions')

module.exports = {
    name: 'Twitch/Online',
    once: false,
    async execute(stream) {
        const db = mClient.db('guilds')
        const guilds = await db.listCollections().toArray()
        const streamer = stream.broadcaster_user_login
        console.log(`${streamer} went live!`)

        guilds.forEach(async (guildData) => {
            const guildId = guildData.name
            const coll = db.collection(guildId)
            const res = await coll.findOne({ event: 'Twitch/Online' })
            if (!res) {
                return // ignore if no live channel set
            }
            const guild = dClient.guilds.cache.get(guildId)
            const channel = guild.channels.cache.get(res.channel)

            try {
                const streamData = await getStreams(streamer)
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
                    content: `@everyone ${escapeMarkdown(streamer)} is live`,
                    embeds: [embed]
                })

            } catch (error) {
                return console.error
            }
        })

    }
}