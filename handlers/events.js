const fs = require('node:fs')
const path = require('node:path');
const { dClient, mClient, tClient } = require('..');
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
    dClient.emit('Twitch/Connected', address, port, tClient);
});

tClient.on('message', async (channel, userstate, message, self) => {
    dClient.emit('Twitch/Message', channel, userstate, message, self, tClient);
});

tClient.on('raided', (channel, username, viewers) => {
    dClient.emit('Twitch/Raided', channel, username, viewers, tClient);
});

tClient.on('subscribers', (channel, enabled) => {
    dClient.emit('Twitch/Subscribers', channel, enabled, tClient);
});

tClient.on('disconnected', async (reason) => {
    console.log('Twitch disconnected:', reason);
    if (reason.includes('Login authentication failed')) {
        try {
            await refreshAccessToken();
            console.log('Reinitializing Twitch client after token refresh...');

            try {
                await tClient.disconnect();
            } catch (err) {
                console.warn('Twitch client already disconnected:', err.message);
            }

            const db = mClient.db("clients");
            const credentialCollection = db.collection('credentials');
            const tCreds = await credentialCollection.findOne({ service: 'twitch' });

            // Recreate the client
            tClient = new tmi.Client({
                options: { debug: false },
                connection: { reconnect: true, secure: true },
                identity: {
                    username: tCreds.username,
                    password: `oauth:${tCreds.token.access_token}`,
                },
                channels: tClient.channels,
            });

            await tClient.connect();
            console.log('Twitch client reconnected successfully.');
        } catch (error) {
            console.error('Failed to refresh token and reconnect:', error);
        }
    }
});