const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder } = require('discord.js')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('socials')
        .setDescription('links to social media'),
    async execute(interaction) {
        await interaction.reply({
            "components": [
                {
                    "type": 1,
                    "components": [
                        {
                            "style": 5,
                            "label": `Twitch`,
                            "url": `https://www.twitch.tv/x__hel__x`,
                            "disabled": false,
                            "emoji": {
                                "id": `1136026329091952740`,
                                "name": `Twitch`,
                                "animated": false
                            },
                            "type": 2
                        },
                        {
                            "style": 5,
                            "label": `Twitter`,
                            "url": `https://twitter.com/x__Hel__x`,
                            "disabled": false,
                            "emoji": {
                                "id": `1136026228093095946`,
                                "name": `Twitter`,
                                "animated": false
                            },
                            "type": 2
                        },
                        {
                            "style": 5,
                            "label": `Ko-fi`,
                            "url": `https://ko-fi.com/hel4444/commissions`,
                            "disabled": false,
                            "emoji": {
                                "id": `1136027117428150312`,
                                "name": `Kofi`,
                                "animated": false
                            },
                            "type": 2
                        }
                    ]
                }
            ],
            "embeds": [
                {
                    "type": "rich",
                    "title": `Social Media Links`,
                    "description": `Click on one of these buttons to get to Hel's social media pages.`,
                    "color": 0xdda807,
                    "thumbnail": {
                        "url": `https://cdn.discordapp.com/avatars/901259181397528678/13796c7450e586611042f7c2c72684f7.png?size=4096`,
                        "height": 0,
                        "width": 0
                    }
                }
            ]
        })
    }
}