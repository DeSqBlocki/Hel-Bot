// Event triggered by client connected to server

const { mClient, dClient } = require("../..");
var { tClient } = require('../..')
const { refreshAccessToken } = require("../../functions")
const tmi = require('tmi.js')

module.exports = {
    name: 'Twitch/Disconnected',
    once: false,
    async execute(reason) {
        console.log('Twitch disconnected:', reason);
        if (reason.includes('Login authentication failed')) {
            try {
                await refreshAccessToken();
                console.log('Reinitializing Twitch client after token refresh...');
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
                const { address, port } = await tClient.connect()
                dClient.emit("Twitch/Connected", address, port)
                console.log('Twitch client reconnected successfully.');
            } catch (error) {
                console.error('Failed to refresh token and reconnect:', error);
            }
        }
    }
}
