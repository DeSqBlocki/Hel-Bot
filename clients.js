// clients.js
const { MongoClient } = require('mongodb');
const { Client, GatewayIntentBits } = require('discord.js');
const tmi = require('tmi.js');
const channels = ['x__hel__x', 'desq_blocki'];
require('dotenv').config()

let mClient, dClient, tClient; // Global references

const initializeClients = async () => {
    // Initialize MongoDB Client
    mClient = new MongoClient(process.env.MONGO_URI);
    mClient.connect();

    // Initialize Discord Client
    dClient = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.MessageContent,
        ],
    });

    const db = mClient.db("clients");
    const credentialCollection = db.collection('credentials');
    const dCreds = await credentialCollection.findOne({ service: 'discord' });
    const tCreds = await credentialCollection.findOne({ service: 'twitch' });

    await dClient.login(dCreds.token);

    // Initialize Twitch Client
    let tClient = new tmi.Client({
        options: { debug: false },
        connection: { reconnect: true, secure: true },
        identity: {
            username: tCreds.username,
            password: `oauth:${tCreds.token.access_token}`,
        },
        channels: channels,
    });
    
    return { mClient, dClient, tClient };
};

module.exports = initializeClients;
