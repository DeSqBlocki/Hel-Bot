const { Events } = require('discord.js')
const { createCanvas, loadImage } = require('canvas')
const path = require('node:path')
const { dClient, mClient } = require('../..')

module.exports = {
    name: Events.GuildMemberAdd,
    once: false,
    async execute(member) {
        const db = mClient.db('guilds')
        const coll = db.collection(member.guild.id)
        const res = await coll.findOne({ event: 'GuildMemberAdd'})

        const guild = dClient.guilds.cache.get(member.guild.id)
        const channel = guild.channels.cache.get(res.channel)
        //const logs = guild.channels.cache.get(logID)
        //logs.send(`${member.user.username} joined the Server`)

        const canvas = new createCanvas(700, 250)
        const ctx = canvas.getContext('2d')
        const background = await loadImage(
            path.join(__dirname, '../../assets/background.png')
        )

        let x = background.width / 2 * -1
        let y = background.height / 5 * -1
        ctx.drawImage(background, x, y)

        const pfp = await loadImage(
            member.user.displayAvatarURL({
                extension: 'jpg',
                size: 64
            }))

        x = canvas.width / 2 - pfp.width / 2
        y = 25
        ctx.drawImage(pfp, x, y)

        ctx.fillStyle = '#ffffff'
        ctx.strokeStyle = '#000000'
        ctx.font = '35px sans-serif'
        let text = `Welcome, ${member.user.username}`
        x = canvas.width / 2 - ctx.measureText(text).width / 2
        ctx.fillText(text, x, 60 + pfp.height)
        ctx.strokeText(text, x, 60 + pfp.height)

        ctx.font = '30px sans-serif'
        text = `to Helcord!`
        x = canvas.width / 2 - ctx.measureText(text).width / 2
        ctx.fillText(text, x, 100 + pfp.height)
        ctx.strokeText(text, x, 100 + pfp.height)


        channel.send({
            files: [{
                attachment: canvas.toBuffer(),
                name: 'banner.png',
                description: 'a welcome banner'
            }]
        })
    }
}