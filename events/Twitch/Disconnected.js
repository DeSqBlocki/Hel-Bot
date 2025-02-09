// Event triggered by client connected to server

const { RWSConnect, RWSDisconnect } = require("../../functions")

module.exports = {
    name: 'Twitch/Disconnected',
    once: false,
    async execute(reason) {
        console.log('Twitch disconnected:', reason);
        try {
            RWSDisconnect()
        } catch (error) {
            console.error
        }
        
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
    }
}
