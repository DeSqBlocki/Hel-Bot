const { MessageEmbed } = require('discord.js')
const mcsrv = require('mcsrvstat-api')
module.exports = {
    category: 'Minecraft',
    description: 'Minecraft Server Information',
    slash: 'both',
    testOnly: true,
    callback: ({ client, message, interaction }) => {

        mcsrv.fetchData("bettermc.desq-gaming.de")
            .then((data) => {
                if (data.online === false) {
                    if (message) {
                        message.reply({ content: 'Could Not Fetch Server Info. Is It Offline?' })
                            .then(msg => {
                                setTimeout(() => {
                                    message.delete()
                                    return msg.delete()
                                }, 15000)
                            })
                    }
                    if (interaction) {
                        interaction.reply({ content: 'Could Not Get All Infos. Is It Offline?' })
                            .then(() => {
                                setTimeout(() => {
                                    return client.api.webhooks(client.user.id, interaction.token).messages("@original").delete();
                                }, 15000)
                            })
                    }
                } else {
                    const embed = new MessageEmbed()
                        .setTitle(data.hostname)
                        .setURL(`https://mcsrvstat.us/server/bettermc.desq-gaming.de`)
                        .setThumbnail('https://cdn.discordapp.com/attachments/345238918582763520/885475680014458900/PixelHel.png')
                        .setAuthor(`${data.motd.clean}`)
                        .addFields(
                            { name: "IP:", value: `${data.ip}:${data.port}` },
                            { name: "Game Version:", value: `${data.version}`, inline: true },
                            { name: "Currently Online:", value: `${data.players.online}`, inline: true }
                        )
                        .setTimestamp()
                        .setFooter('HelBot by DeSqBlocki', 'https://cdn.discordapp.com/attachments/345238918582763520/901262809466282034/HelBotIcon.png')
                        if(data.mods){
                            embed.addFields({ name: "Mods Installed:", value: `${data.mods.names.length}`, inline: true })
                        }
                    if (message) {
                        message.reply({ embeds: [embed] })
                            .then(msg => {
                                setTimeout(() => {
                                    message.delete()
                                    return msg.delete()
                                }, 15000)
                            })
                    }
                    if (interaction) {
                        interaction.reply({ embeds: [embed] })
                            .then(msg => {
                                setTimeout(() => {
                                    return client.api.webhooks(client.user.id, interaction.token).messages("@original").delete();
                                }, 15000)
                            })
                    }
                }
            })
    }
}
