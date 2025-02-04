//////////////////////////////////////////////////////////
//////////////////// Start of ////////////////////////////
////////////////////  File  //////////////////////////////
//////////////////////////////////////////////////////////

const tmi = require("tmi.js")
require('dotenv').config()
const lolQuery = require('lol-query')
const bots = new Set(['streamlabs', 'nightbot', 'moobot'])
const prefix = process.env.HEL_PREFIX
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const shoutout_users = new Map([])

const client = new tmi.Client({
    options: { debug: true },
    identity: {
        username: process.env.HEL_USER,
        password: process.env.HEL_OAUTH
    },
    channels: ['x__hel__x', 'desq_blocki']
})
var locked = false;
var buffer = new Map();

//////////////////////////////////////////////////////////
//////////////////// Start of ////////////////////////////
//////////////////// Functions  //////////////////////////
//////////////////////////////////////////////////////////

client.connect()
//log into twitch api

function shoutout(channel, username) {
    client.say(channel, `!so ${username}`);
    shoutout_users.set(username, true);
}
function buffered() {
    let u = buffer.keys().next().value
    let c = buffer.values().next().value
    if (u) {
        shoutout(c, u)
        buffer.delete(u)
    }
}
bufferedShoutout = setInterval(buffered, 6000)

async function createMap(channel) {
    shoutout_users.clear(); //reset map
    await client.vips(channel) //get current vips from channel
        .then((vips) => {
            vips.forEach(vip => {
                shoutout_users.set(vip, false) //fill map
            })
        })
}

//////////////////////////////////////////////////////////
///////////////////// End of /////////////////////////////
//////////////////// Functions  //////////////////////////
//////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////
////////////////// Start of //////////////////////////////
//////////////// Event Handlers  /////////////////////////
//////////////////////////////////////////////////////////

client.on('connected', onConnectedHandler)
//does stuff when successfully connected
client.on('message', messageHandler)
//does stuff when messages are sent
client.on('raided', onRaided)
//does stuff when channel is being raided
client.on('hosted', onHosted)
//does stuff when channel is being hosted
client.on('subscribers', onSubOnly)
//does stuff when entering subscriber only mode
client.on('join', joinHandler)
//does stuff on channel join

function joinHandler(channel, user, self){
    if(self) { //bot joined channel
        createMap(channel)
    }
}
function onSubOnly(channel, enabled) {
    //most likely stream has ended = enabled
    if (!locked) { //has been reset before or restarted
        if (!enabled) { //is not in sub mode
            createMap(channel)
        }
        locked = true; //lock shoutout reset
    } else {
        if (enabled) { //release lock
            locked = false
        }

    }
}
function onRaided(channel, username, raiders) {
    client.say(channel, `${username} raiding with ${raiders} viewers. Welcome to the moyder, raiders!`)
    buffer.set(username, channel)
    console.log(`Added ${username} to the buffer, shouting out soon! Reason: raid`);
}
function onHosted(channel, username, viewers, autohost) {
    client.say(channel, `${username} hosting with ${viewers} viewers! ${autohost?'Thanks for the Autohost xhelxShy':''}`)
    buffer.set(username, channel)
    console.log(`Added ${username} to the buffer, shouting out soon! Reason: host`);
}
function onConnectedHandler(addr, port) {
    console.log(`*Connected to ${addr}:${port}*`);
}
async function messageHandler(channel, tags, msg, self) {
    if (self || bots.has(tags.username)) { return }

    if (msg.toLowerCase().includes('caw')) {
        client.say(channel, 'CAW!')
    } else if (msg.toLowerCase().includes('kweh')) {
        client.say(channel, 'KWEH!')
    } else if (msg.toLowerCase().includes('kaw')) {
        client.say(channel, 'KAW!')
    }

    //<auto_shoutout>
    if (shoutout_users.has(tags.username) && (shoutout_users.get(tags.username) == false)) {
        buffer.set(tags.username, channel)
        shoutout_users.set(tags.username, true)
	console.log(`Added ${tags.username} to the buffer, shouting out soon! Reason: auto`);
    }
    //</auto_shoutout>

    const args = msg.slice(1).split(" ");
    const command = args.shift().toLowerCase();

    //////////////////////////////////////////////////////////
    /////////////////// Start of /////////////////////////////
    //////////////// Command Handler /////////////////////////
    //////////////////////////////////////////////////////////
    if (msg.startsWith(prefix)) {
        //command handler
        if (command === 'elo' || command === 'rank') {
            //return client.say(channel, "Still WIP!")
            //expected behaviour: <prefix><command> <region> <username>
            let regions = new Set(['na', 'kr', 'oce', 'jp', 'euw', 'eune', 'lan', 'br', 'las', 'ru', 'tr'])
            //region set for cross-search
            var data = { region: null, username: null }
            if (!data.region) {
                if (channel === '#x__hel__x' && !args.length) {
                    data.region = 'euw'
                } else if (channel === '#desq_blocki' && !args.length) {
                    data.region = 'euw'
                } else {
                    data.region = args[0].toLowerCase()
                    if (!regions.has(data.region)) { return client.say(channel, `Region Syntax Error! Use valid regions [na, kr, oce, jp, euw, eune, lan, br, las, ru, tr]`) }
                }
            }
            if (!data.username) {
                if (channel === '#x__hel__x' && !args.length) {
                    data.username = 'º Hel º'
                } else if (channel === '#desq_blocki' && !args.length) {
                    data.username = 'DeSq Blocki'
                } else {
                    data.username = args.join(' ').slice(args[0].length).trim()
                }
            }
            lolQuery.getStats(data.username, data.region, true)
                .then(stats => client.say(channel, `${data.username} is ${stats.Rank} with ${stats.RankedLP}`))
                .catch((err) => { console.log('[ERROR]: ' + err); client.say(channel, 'API Fetch Error, try to request manually!') })
            //do query, send message
        } else if (command === 'currentmatch' || command === 'livegame') {
            //expected behaviour: <prefix><command> <region> <username>
            //return client.say(channel, "Still WIP!")
            let regions = new Set(['na', 'kr', 'oce', 'jp', 'euw', 'eune', 'lan', 'br', 'las', 'ru', 'tr'])
            var data = { region: null, username: null }
            if (!data.region) {
                if (channel === '#x__hel__x' && !args.length) {
                    data.region = 'euw'
                } else if (channel === '#desq_blocki' && !args.length) {
                    data.region = 'euw'
                } else {
                    data.region = args[0].toLowerCase()
                    if (!regions.has(data.region)) { return client.say(channel, `Region Syntax Error! Use valid regions [na, kr, oce, jp, euw, eune, lan, br, las, ru, tr]`) }
                }
            }
            if (!data.username) {
                if (channel === '#x__hel__x' && !args.length) {
                    data.username = 'º Hel º'
                } else if (channel === '#desq_blocki' && !args.length) {
                    data.username = 'DeSq Blocki'
                } else {
                    data.username = args.join(' ').slice(args[0].length).trim()
                }
            }

            const firstLetter = (string) => {
                return string.charAt(0).toUpperCase() + string.slice(1);
            }

            let loop = true
            let tries = 1

            while (loop) {
                console.log(`Try ${tries}!`)
                await lolQuery.getLiveMatch(data.username, data.region)
                    .then((stats) => {
                        console.log(stats.error)
                        if (stats.error != 0) {
                            console.log('[ERROR-CODE]: ' + stats.error);
                            if (stats.error === 1) {
                                loop = false
                                return client.say(channel, `${data.username} is currently not in a match!`)
                            } else {
                                return client.say(channel, `API Fetch Error, try to request manually!!`)
                            }
                        } else {
                            client.say(channel, 'Match Found:')
                                .then(client.say(channel, `Blue Side: ${firstLetter(stats.teamA[0].champion)} | ${firstLetter(stats.teamA[1].champion)} | ${firstLetter(stats.teamA[2].champion)} | ${firstLetter(stats.teamA[3].champion)} | ${firstLetter(stats.teamA[4].champion)}`))
                                .then(client.say(channel, `Red Side: ${firstLetter(stats.teamB[0].champion)} | ${firstLetter(stats.teamB[1].champion)} | ${firstLetter(stats.teamB[2].champion)} | ${firstLetter(stats.teamB[3].champion)} | ${firstLetter(stats.teamB[4].champion)}`))
                        }
                    })
                    .catch((err) => {
                        tries++
                        console.log('[ERROR]: ' + err + `\nTrying again. . .`)
                    })

                if (tries == 15) {
                    return client.say(channel, `Failed To Get Response From OP.GG After ${tries} Tries`)
                }
            }
            console.log(`Succesful Response after ${tries} Tries`)

        } else if (command === 'main' || command === 'otp') {
            //expected behaviour: <prefix><command> <region> <username>

            let regions = new Set(['na', 'kr', 'oce', 'jp', 'euw', 'eune', 'lan', 'br', 'las', 'ru', 'tr'])
            //region set for cross-search
            var data = { region: null, username: null }
            if (!data.region) {
                if (channel === '#x__hel__x' && !args.length) {
                    data.region = 'euw'
                } else if (channel === '#desq_blocki' && !args.length) {
                    data.region = 'euw'
                } else {
                    data.region = args[0].toLowerCase()
                    if (!regions.has(data.region)) { return client.say(channel, `Region Syntax Error! Use valid regions [na, kr, oce, jp, euw, eune, lan, br, las, ru, tr]`) }
                }
            }
            if (!data.username) {
                if (channel === '#x__hel__x' && !args.length) {
                    data.username = 'º Hel º'
                } else if (channel === '#desq_blocki' && !args.length) {
                    data.username = 'DeSq Blocki'
                } else {
                    data.username = args.join(' ').slice(args[0].length).trim()
                }
            }

            let loop = true
            let tries = 1

            while (loop) {
                console.log(`Try ${tries}!`)
                await lolQuery.getStats(data.username, data.region, false)
                    .then((stats) => {
                        console.log(stats)
                        client.say(channel, `${data.username} is ${(stats.MainLane === 'ADC' ? 'an' : 'a')} ${stats.MainLane} Main, and plays ${stats.MainChampion} too much!`)
                        loop = false
                    })
                    .catch((err) => {
                        tries++
                        console.log('[ERROR]: ' + err + `\nTrying again. . .`)
                    })
                if (tries == 15) {
                    return client.say(channel, `Failed To Get Response From OP.GG after ${tries} Tries`)
                }
            }
            console.log(`Succesfull Response after ${tries} Tries`)
            //do query, send message
        } else if (command === 'info' || command === 'commands') {
            //shows list of commands or details of specific command
            const CommandList = {
                elo: {
                    aliase: 'rank',
                    description: `shows you the current rank of target (streamer by default)`,
                    example: `${process.env.HEL_PREFIX}elo euw desq_blocki`
                },
                currentmatch: {
                    aliase: 'livegame',
                    description: `shows you the current match of target (streamer by default)`,
                    example: `${process.env.HEL_PREFIX}currentmatch euw desq_blocki`
                },
                main: {
                    aliase: 'otp',
                    description: `shows you the current main of target (streamer by default)`,
                    example: `${process.env.HEL_PREFIX}main euw desq_blocki`
                },
                commands: {
                    aliase: 'info',
                    description: 'shows you the list of all commands or further details of a specific command',
                    example: `${process.env.HEL_PREFIX}info <command>`
                }
            }
            var output
            if (!args.length) {
                output = 'Command List: '
                for (const [key, value] of Object.entries(CommandList)) {
                    output += ` ${key},`;
                }
                output = output.substring(0, output.length - 1).trim()
            } else if (!args[1]) {
                const cmd = args[0]
                var output

                for (const [key, value] of Object.entries(CommandList)) {
                    if (cmd === key || cmd === value.aliase) {
                        output = `[${key}${CommandList[key].aliase ? `/${CommandList[key].aliase}` : ''}]: ${CommandList[key].description}. [Example: ${CommandList[key].example}]`
                    }
                }
            }

            if (!output) {
                return client.say(channel, `Command Not Found!`)
            }
            client.say(channel, output)
        } else if (command === 'match') {
            const firstLetter = (string) => {
                return string.charAt(0).toUpperCase() + string.slice(1);
            }
            let regions = new Set(['na', 'kr', 'oce', 'jp', 'euw', 'eune', 'lan', 'br', 'las', 'ru', 'tr'])
            var data = { region: null, username: null }
            if (!data.region) {
                if (channel === '#x__hel__x' && !args.length) {
                    data.region = 'euw'
                } else if (channel === '#desq_blocki' && !args.length) {
                    data.region = 'euw'
                } else {
                    data.region = args[0].toLowerCase()
                    if (!regions.has(data.region)) { return client.say(channel, `Region Syntax Error! Use valid regions [na, kr, oce, jp, euw, eune, lan, br, las, ru, tr]`) }
                }
            }
            if (!data.username) {
                if (channel === '#x__hel__x' && !args.length) {
                    data.username = 'º Hel º'
                } else if (channel === '#desq_blocki' && !args.length) {
                    data.username = 'DeSq Blocki'
                } else {
                    data.username = args.join(' ').slice(args[0].length).trim()
                }
            }
            var stats = await lolQuery.getLiveMatch(data.username, data.region)
            if (stats.error != 0) { console.log(stats); return client.say(channel, `${data.username} is currently not in a match!`) }
            let _data = {
                teamA: {
                    champion: [],
                    winrate: [],
                    rank: [],
                },
                teamB: {
                    champion: [],
                    winrate: [],
                    rank: [],
                }
            }
            for (const [key, value] of Object.entries(stats.teamA)) {
                _data.teamA.champion.push(firstLetter(value.champion))
                _data.teamA.winrate.push(value.currentChampionWinRatio)
                if (value.tierRank.startsWith('Level')) {
                    let temp = value.tierRank.split('<')
                    _data.teamA.rank.push(temp[1].substring(26))
                } else {
                    _data.teamA.rank.push(value.tierRank)
                }
            }
            for (const [key, value] of Object.entries(stats.teamB)) {
                _data.teamB.champion.push(firstLetter(value.champion))
                _data.teamB.winrate.push(value.currentChampionWinRatio)
                if (value.tierRank.startsWith('Level')) {
                    let temp = value.tierRank.split('<')
                    _data.teamB.rank.push(`Level ` + temp[1].substring(26))
                } else {
                    _data.teamB.rank.push(value.tierRank)
                }
            }

            /*  Display of Data
                Version 1:
                ==============================================
                =  ${topA} (${tAWR})  |   ${topB} (${tBWR})  =
                =  ${jglA} (${jAWR})  |   ${jglB} (${jBWR})  =
                =  ${midA} (${mAWR})  |   ${midB} (${mBWR})  =
                =  ${adcA} (${bAWR})  |   ${adcB} (${aBWR})  =
                =  ${supA} (${sAWR})  |   ${supB} (${sBWR})  =
                ==============================================
                =                 ${link}                    =
                ==============================================

                Version 2:

                ${champion}(${ChampionWR}) [${Rank/Level}]
                ${champion}(${ChampionWR}) [${Rank/Level}]
                ${champion}(${ChampionWR}) [${Rank/Level}]
                ${champion}(${ChampionWR}) [${Rank/Level}]
                ${champion}(${ChampionWR}) [${Rank/Level}]
                vs
                ${champion}(${ChampionWR}) [${Rank/Level}]
                ${champion}(${ChampionWR}) [${Rank/Level}]
                ${champion}(${ChampionWR}) [${Rank/Level}]
                ${champion}(${ChampionWR}) [${Rank/Level}]
                ${champion}(${ChampionWR}) [${Rank/Level}]

                Version 3:

                ${champion}(${ChampionWR}) [${Rank/Level}], ${champion}(${ChampionWR}) [${Rank/Level}], ${champion}(${ChampionWR}) [${Rank/Level}], ${champion}(${ChampionWR}) [${Rank/Level}], ${champion}(${ChampionWR}) [${Rank/Level}]
                vs.
                ${champion}(${ChampionWR}) [${Rank/Level}], ${champion}(${ChampionWR}) [${Rank/Level}], ${champion}(${ChampionWR}) [${Rank/Level}], ${champion}(${ChampionWR}) [${Rank/Level}], ${champion}(${ChampionWR}) [${Rank/Level}]
            */

            var top = `${_data.teamA.champion[0]}(${_data.teamA.winrate[0]}WR) [${_data.teamA.rank[0]}]  <TOP>  ${_data.teamB.champion[0]}(${_data.teamB.winrate[0]}WR) [${_data.teamB.rank[0]}]`
            var jgl = `${_data.teamA.champion[1]}(${_data.teamA.winrate[1]}WR) [${_data.teamA.rank[1]}]  <JGL>  ${_data.teamB.champion[1]}(${_data.teamB.winrate[1]}WR) [${_data.teamB.rank[1]}]`
            var mid = `${_data.teamA.champion[2]}(${_data.teamA.winrate[2]}WR) [${_data.teamA.rank[2]}]  <MID>  ${_data.teamB.champion[2]}(${_data.teamB.winrate[2]}WR) [${_data.teamB.rank[2]}]`
            var adc = `${_data.teamA.champion[3]}(${_data.teamA.winrate[3]}WR) [${_data.teamA.rank[3]}]  <ADC>  ${_data.teamB.champion[3]}(${_data.teamB.winrate[3]}WR) [${_data.teamB.rank[3]}]`
            var sup = `${_data.teamA.champion[4]}(${_data.teamA.winrate[4]}WR) [${_data.teamA.rank[4]}]  <SUP>  ${_data.teamB.champion[4]}(${_data.teamB.winrate[4]}WR) [${_data.teamB.rank[4]}]`

            client.say(channel, top).then(await delay(1100))
            client.say(channel, jgl).then(await delay(1100))
            client.say(channel, mid).then(await delay(1100))
            client.say(channel, adc).then(await delay(1100))
            client.say(channel, sup).then(await delay(1100))
        } else if (command === 'so') {
            client.say(channel, `!so x__hel__x`);
            shoutout_users.set(tags.username, true)
            console.log(`shouting out ${tags.username}`)
        } else if (command === 'vips') {
            shoutout_users.forEach((value, key) => {
                console.log(key, ' ', value)
            })
            
        } else {
            //return client.say(channel, `Unknown Command!`)
        }
    }
    //////////////////////////////////////////////////////////
    //////////////////// End of //////////////////////////////
    //////////////// Command Handler /////////////////////////
    //////////////////////////////////////////////////////////
}

//////////////////////////////////////////////////////////
//////////////////// End of //////////////////////////////
//////////////// Event Handlers //////////////////////////
//////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////
//////////////////// End of //////////////////////////////
////////////////////  File  //////////////////////////////
//////////////////////////////////////////////////////////


