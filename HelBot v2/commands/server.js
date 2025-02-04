const { MessageEmbed } = require('discord.js')
const mcsrv = require('mcsrvstat-api')
module.exports = {
    category: 'Minecraft',
    description: 'Minecraft Server Availabilty',
    slash: 'both',
    testOnly: true,
    callback: ({client, message, interaction}) => {
        const server = "bettermc.desq-gaming.de"
        mcsrv.isOnline(server)
        .then((bool) =>{
            const embed = new MessageEmbed()
                        .setTitle(server)
                        .setURL(`https://mcsrvstat.us/server/bettermc.desq-gaming.de`)
                        .setThumbnail('https://cdn.discordapp.com/attachments/345238918582763520/885475680014458900/PixelHel.png')
                        .setDescription(
                            `The Server Is **${bool?"":"Not "}Online!**`
                        )
                        .setTimestamp()
                        .setFooter('HelBot by DeSqBlocki', 'https://cdn.discordapp.com/attachments/345238918582763520/901262809466282034/HelBotIcon.png')
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
        })
    }
}
