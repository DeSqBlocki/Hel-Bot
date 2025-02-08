// clients.js
const { MongoClient } = require('mongodb');
const { Client, GatewayIntentBits } = require('discord.js');
const tmi = require('tmi.js');
const channels = ['x__hel__x','desq_blocki']

const initializeClients = async () => {
    // Initialize MongoDB Client
    const mClient = new MongoClient(process.env.mongo_uri);
    await mClient.connect();

    // Initialize Discord Client
    const dClient = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.MessageContent,
        ],
    });

    // Fetch Discord credentials from the database
    const db = mClient.db(process.env.mongo_db);
    const credentialCollection = db.collection('credentials');
    const dCreds = await credentialCollection.findOne({ service: 'discord' });

    const tCreds = await credentialCollection.findOne({ service: 'twitch' });

    await dClient.login(dCreds.token);

    // Initialize Twitch Client
    const tClient = new tmi.Client({
        options: { debug: false },
        connection: {
            reconnect: true,
            secure: true,
        },
        identity: {
            username: tCreds.username,
            password: `oauth:${tCreds.token.access_token}`,
        },
        channels: channels, // Replace with your channel
    });

    await tClient.connect();

    return { mClient, dClient, tClient };
};

module.exports = initializeClients;
