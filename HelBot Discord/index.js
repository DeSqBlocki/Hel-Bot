const TwitchApi = require("node-twitch").default
const tmi = require("tmi.js")
const { Client, Intents, MessageEmbed } = require('discord.js')
const WOKCommands = require('wokcommands')
require('dotenv').config()
const path = require('path')
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))


const channels = ['x__hel__x', 'desq_blocki']
const twitchClient = new tmi.Client({
  options: { debug: true },
  identity: {
    username: process.env.HEL_USER,
    password: process.env.HEL_OAUTH
  },
  channels: channels
})

const streamers = [
  'x__hel__x',
]

const isLive = new Set()
//isLive.add('x__hel__x')

const twitch = new TwitchApi({
  client_id: process.env.TTV_ID,
  client_secret: process.env.TTV_SECRET
});

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS
  ]
})

client.on('ready', async () => {
  twitchClient.connect()
  //Discord Bot
  new WOKCommands(client, {
    commandsDir: path.join(__dirname, 'commands'),
    ignoreBots: true,
    testServers: [process.env.GUILD_ID],
    botOwners: ['140508899064283136']
  })
    .setDefaultPrefix(process.env.PREFIX)
    .setDisplayName('-=HelBot Commands=-')
    .setCategorySettings([
      {
        name: 'Minecraft',
        emoji: '<:Minecraft:901642179661946940>'
      }, {
        name: 'Twitch',
        emoji: '<:Twitch:888077898400022548>'
      }, {
        name: 'League',
        emoji: '<:LoL:901642179477389353>'
      }
    ])
  // const d = await client.api.applications(client.user.id).guilds("887425193969082379").commands.get()
  // console.log(d)
  //// find all slash command in guild


  // client.api.applications(client.user.id).guilds("887425193969082379").commands('901640675131531314').delete();
  //// delete specific slash command in guild

  const guild = client.guilds.cache.get(process.env.GUILD_ID)
  const botchannel = guild.channels.cache.get(process.env.CHANNEL_ID)
  //const botchannel = guild.channels.cache.get(process.env.TEST_CHANNEL_ID)
  client.user.setActivity("comfy", {
    type: "STREAMING",
    url: "https://www.twitch.tv/x__hel__x"
  });
  //Twitch API
  async function Twitch(stream) {
    var streamData
    await twitch.getStreams({ channel: stream }).then(async data => {
      const r = data.data[0]
      if (r) {
        //stream online
        if (!isLive.has(stream)) {
          //not yet in memory
          streamData = {
            "game": r.game_name,
            "title": r.title,
          }
        } else {
          //already in memory
        }
      } else {
        //stream offline
        if (isLive.has(stream)) {
          //was in memory
          console.log(`${stream} went offline :c`)
          isLive.delete(stream)
          
          await twitchClient.subscribers(stream)
          await twitchClient.followersonly(stream, 0)
          await twitchClient.emoteonly(stream)
        } else {
          //was not in memory
        }
      }
    })
    return streamData
  }

  for (var i = 0; i < streamers.length; i++) {
    let channel = streamers[i]
    setInterval(async () => {
      let streamdata = await Twitch(channel)
      if (streamdata) {
        const imageUrl = `https://static-cdn.jtvnw.net/previews-ttv/live_user_${channel.toLowerCase()}.jpg`
        const embed = new MessageEmbed()
          .setTitle(`Stream Notice!`)
          .setURL(`https://twitch.tv/${channel}`)
          .setDescription(`*${streamdata.title}*\nThey're playing **${streamdata.game}**`)
          .setTimestamp()
          .setFooter('HelBot by DeSqBlocki', 'https://cdn.discordapp.com/attachments/345238918582763520/901262809466282034/HelBotIcon.png')
          .setImage(imageUrl)

        botchannel.send({
          content: `<@&${process.env.NOTIFY_ROLE_ID}> im live <:helcomf:963147337134399508> <a:sparkles:963229266991001630>`,
          embeds: [embed]
        })
        isLive.add(channel)
      }
    }, 15000);
  }
})

client.login(process.env.TOKEN)
