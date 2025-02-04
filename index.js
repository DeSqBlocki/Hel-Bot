const HelixAPI = require("simple-helix-api").default;
const tmi = require('tmi.js')
require('dotenv').config()
const Helix = new HelixAPI({
    client_id: process.env.TTV_ID,
    access_token: process.env.TTV_Token
});
const channels = ['desq_blocki', 'x__hel__x']
const knownBots = new Set(['streamlabs', 'nightbot', 'moobot', 'soundalerts', 'streamelements', 'remasuri_bot', 'commanderroot'])
var buffer = new Map();
var wasShoutedOut = []
const TwitchClient = new tmi.Client({
    options: { debug: true },
    connection: {
        reconnect: true,
        secure: true,
    },
    identity: {
        username: process.env.TTV_User,
        password: process.env.TTV_Oauth
    },
    channels: channels
})

TwitchClient.connect()

TwitchClient.on('connected', onConnected)
//does stuff when successfully connected
TwitchClient.on('message', onMessage)
//does stuff when messages are sent
TwitchClient.on('raided', onRaided)
//does stuff when channel is being raided
TwitchClient.on('hosted', onHosted)
//does stuff when channel is being hosted
TwitchClient.on('subscribers', onSubOnly)
//does stuff when entering subscriber only mode

function onRaided(channel, username, raiders) {
    TwitchClient.say(channel, `${username} raiding with ${raiders} viewers. Welcome to the moyder, raiders!`)
    buffer.set(username.toLowerCase(), channel)
    wasShoutedOut.push(username)
    console.log(`Added ${username} to the buffer, shouting out soon! Reason: raid`);
}
function onHosted(channel, username, viewers, autohost) {
    TwitchClient.say(channel, `${username} hosting with ${viewers} viewers! ${autohost ? 'Thanks for the Autohost xhelxShy' : ''}`)
    buffer.set(username.toLowerCase(), channel)
    wasShoutedOut.push(username)
    console.log(`Added ${username} to the buffer, shouting out soon! Reason: host`);
}
function onSubOnly(channel, enabled) {
    wasShoutedOut = [] // clears queue on sub only
}
function onConnected(address, port) {
    console.log(`Connected to ${address}:${port}`)
    doEventSub()
}
async function onMessage(channel, userstate, message, self) {
    if (self) { return }
    if (knownBots.has(userstate.username)) { return }

    if (message.toLowerCase().includes('caw')) {
        TwitchClient.say(channel, 'CAW!')
    } else if (message.toLowerCase().includes('kweh')) {
        TwitchClient.say(channel, 'KWEH!')
    } else if (message.toLowerCase().includes('kaw')) {
        TwitchClient.say(channel, 'KAW!')
    } else if (message.toLowerCase().includes('godimissher')) {
        TwitchClient.say(channel, "/me Please do not post your passwords in here, *David* PauseChamp")
    }

    if (message.startsWith(process.env.TTV_Prefix)) {
        const args = message.substring(1).split(" ")
        const cmd = args[0]
        switch (cmd) {
            case "test":
                //TwitchClient.say(channel, "/me This is a test message")
                break;
            case "mode":
                if (userstate.username != "desq_blocki") { return }
                let regex = /^(on|off)$/
                if (!args[1].match(regex)) { return }
                updateChatMode(await getIDByName(channel.substring(1)), args[1])
                break;
            default:
                break;
        }
    }

    // ---------------VIP Handler--------------------
    if (!userstate.badges?.vip) { return }
    if (!wasShoutedOut.includes(userstate.username)) {
        autoShoutout(channel, userstate.username)
        wasShoutedOut.push(userstate.username)
    }
    // ---------------------------------------------

}
function autoShoutout(channel, user) {
    buffer.set(user, channel) // add user to buffer
    console.log(`Added ${user} to the buffer, shouting out soon! Reason: auto`);
}
function doShoutout(channel, user) {
    TwitchClient.say(channel, `!so ${user}`) // use Nightbot command
}
function buffered() {
    let u = buffer.keys().next().value // next user in buffer
    let c = buffer.values().next().value // associated channel
    if (u) { // if anything is in the buffer, do:
        doShoutout(c, u) // call shoutout function
        buffer.delete(u) // delete after shoutout
    }
}
setInterval(buffered, 6000) // Call buffered() every 6s, indefinitely

async function generateToken() {
    let scopes = ["chat:read", "moderator:manage:chat_settings", "channel:manage:vips"];
    let redirect_uri = "http://localhost";
    let link = Helix.getAuthLink(scopes, redirect_uri);
    return link
}
async function getIDByName(user) {
    const result = await Helix.users.get(user);
    return result.data[0].id
}
async function updateChatMode(userID, setTo) {
    let state
    if (setTo === 'on') {
        state = true
    } else if (setTo === 'off') {
        state = false
    } else {
        return
    }
    let modID = process.env.TTV_ModID
    await Helix.chat.updateSettings(userID, modID, {
        follower_mode: state,
        follower_mode_duration: 0,
        subscriber_mode: state,
        emote_mode: state
    });
}
// generateToken().then((link) => {
//     console.log(link)
// })
async function getStreamData(channel) {
    let channelID = await getIDByName(channel)
    let result = await Helix.channel.get((channelID))
    return result.data[0]
}

const { Client, GatewayIntentBits, EmbedBuilder, ActivityType, Events } = require('discord.js')
const DiscordClient = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions
    ]
})
DiscordClient.on(Events.ClientReady, readyHandler)

async function createEmbed(channel) {
    const streamdata = await getStreamData(channel)
    const imageUrl = `https://static-cdn.jtvnw.net/previews-ttv/live_user_${channel.toLowerCase()}.jpg`
    const embed = new EmbedBuilder()
        .setTitle(`Stream Notice!`)
        .setURL(`https://twitch.tv/${channel}`)
        .setDescription(`*${streamdata.title}*\nThey're playing **${streamdata.game_name}**`)
        .setTimestamp()
        .setFooter({ text: 'HelBot by DeSqBlocki', iconURL: 'https://cdn.discordapp.com/attachments/345238918582763520/901262809466282034/HelBotIcon.png' })
        .setImage(imageUrl)
    return embed
}
async function notifyChannel(roleID, guildID, channelID, streamer) {
    let guild = DiscordClient.guilds.cache.get(guildID)
    let channel = guild.channels.cache.get(channelID)
    console.log(channel.guild.name, channel.name)
    await createEmbed(streamer)
        .then(returnedEmbed => {
            channel.send({
                content: `<@&${roleID}> im live <:comfAlt:1052913776049012736> <a:sparkles:963229266991001630>`,
                embeds: [returnedEmbed]
            })
        })
        .catch(err => console.log(err))
}
async function doEventSub(){
    const options = { // Optional. Configuration of connection
        debug: true // Optional. Log all EventSub messages. Default: false
    };
    const EventSubClient = await Helix.EventSub.connect(options);

    Helix.EventSub.events.on(Helix.EventSub.WebsocketEvents.CONNECTED, () => {
        console.log("Connected to EventSub");
    });
    
    Helix.EventSub.events.on(Helix.EventSub.WebsocketEvents.DISCONNECTED, () => {
        console.log("Disconnected from EventSub");
    });

    const conditions = [{
        broadcaster_user_id: String(278465199) //x__hel__x
    }]

    // Hel Events
    EventSubClient.subscribe(
        "stream.online", conditions[0], stream => {
            console.log(`${stream.broadcaster_user_login} went online`)
            notifyChannel(process.env.DISCORD_RoleID, process.env.DISCORD_GuildID, process.env.DISCORD_ChannelID, stream.broadcaster_user_login)
        }
    )
    EventSubClient.subscribe(
        "stream.offline", conditions[0], stream => {
            console.log(`${stream.broadcaster_user_login} went offline`)
            updateChatMode(stream.broadcaster_user_id.toString(), "on")
        }
    )
}
async function readyHandler() {
    console.log("Connected to Discord")
    DiscordClient.user.setActivity("chaos & comf", {
        type: ActivityType.Streaming,
        url: "https://www.twitch.tv/desq_blocki"
    });
}
DiscordClient.login(process.env.DISCORD_Token)
