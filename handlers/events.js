const fs = require('node:fs')
const path = require('node:path');
var { dClient, mClient, tClient } = require('..');
const { refreshAccessToken } = require('../functions');
const tmi = require('tmi.js')

const folderPath = path.join(__dirname, '../events')
const eventFolders = fs.readdirSync(folderPath)

for (const folder of eventFolders) {
    const eventsPath = path.join(folderPath, folder);
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'))

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file)
        const event = require(filePath)
        if (event.once) {
            dClient.once(event.name, (...args) => event.execute(...args))
            // added client to commomerate global usage
        } else {
            dClient.on(event.name, (...args) => event.execute(...args))
            // added client to commomerate global usage
        }
    }
}

// Custom Twitch Events via dClient

// Handle Twitch events
tClient.on('connected', (address, port) => {
    dClient.emit('Twitch/Connected', address, port);
});

tClient.on('message', async (channel, userstate, message, self) => {
    dClient.emit('Twitch/Message', channel, userstate, message, self);
});

tClient.on('raided', (channel, username, viewers) => {
    dClient.emit('Twitch/Raided', channel, username, viewers);
});

tClient.on('subscribers', (channel, enabled) => {
    dClient.emit('Twitch/Subscribers', channel, enabled);
});

tClient.on('disconnected', async (reason) => {
    dClient.emit('Twitch/Disconnected', reason)
});