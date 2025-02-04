const { MessageEmbed } = require("discord.js")
const TwitchApi = require("node-twitch").default
const twitch = new TwitchApi({
    client_id: process.env.TTV_ID,
    client_secret: process.env.TTV_SECRET
  });
module.exports = {
    category: 'Twitch',
    description: 'Shows You If A Stream Is Online',
    testOnly: true,
    expectedArgs: '<channel>',
    callback: async ({ client, args, interaction, message }) => {
        var channel = args[0]
        if (!args.length) {
            channel = 'x__hel__x' //default
        }

        async function Twitch(stream) {
            var streamData = undefined
            await twitch.getStreams({ channel: stream }).then(async data => {
                const r = data.data[0]
                if (r) {
                    streamData = {
                        "game": r.game_name,
                        "title": r.title,
                    }
                } else {

                }
            })
            return streamData
        }
        const streamdata = await Twitch(channel)
        var reply
        var embed

        if (!streamdata || streamdata === undefined) {
            reply = `<https://twitch.tv/${channel}> is currently offline!`
        } else {
            const imageUrl = `https://static-cdn.jtvnw.net/previews-ttv/live_user_${channel.toLowerCase()}.jpg`
            embed = new MessageEmbed()
            .setTitle(`twitch.tv/${channel}`)
            .setURL(`https://twitch.tv/${channel}`)
            .setDescription(`${channel} is **live**!\n\nThey're playing **${streamdata.game}**\n [${streamdata.title}]`)
            .setTimestamp()
            .setFooter('HelBot by DeSqBlocki', 'https://cdn.discordapp.com/attachments/345238918582763520/901262809466282034/HelBotIcon.png')
            .setImage(imageUrl)
        }

        if (interaction){
            if(!streamdata || streamdata === undefined){
                return reply
            } else {
                return embed
            }
        }
        if (message){
            if(!streamdata || streamdata === undefined){
                return reply
            } else {
                return embed
            }
        }
    }
}
