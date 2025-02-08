const { MongoClient } = require('mongodb');
require('dotenv').config();
const fs = require('node:fs');
const { Client, GatewayIntentBits } = require('discord.js');
const tmi = require('tmi.js');
const axios = require('axios');

// Validate required environment variables
function validateEnvVariables() {
    const requiredVars = ['MONGO_URI', 'MONGO_DB'];
    const missingVars = requiredVars.filter((varName) => !process.env[varName]);

    if (missingVars.length > 0) {
        console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
        process.exit(1);
    }
}

validateEnvVariables();

// Initialize MongoDB Client
const mClient = new MongoClient(process.env.MONGO_URI);

async function initializeMongoClient() {
    try {
        await mClient.connect();
        console.log('MongoDB connected successfully.');
        // Emit event or proceed with dependent initializations here
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        process.exit(1); // Exit the process if the connection fails
    }
}

initializeMongoClient();

// Function to save tokens to MongoDB
async function saveToken(access_token, refresh_token, expiresIn, scope) {
    const db = mClient.db(process.env.MONGO_DB);
    const credentialCollection = db.collection('credentials');

    const tokenData = {
        access_token,
        refresh_token,
        scope,
        expiresIn,
        obtainedAt: Date.now(),
    };

    await credentialCollection.updateOne(
        { service: 'twitch' },
        { $set: { token: tokenData } },
        { upsert: true }
    );
    console.log('Twitch token updated in MongoDB');
}

// Function to retrieve stored tokens from MongoDB
async function getStoredToken() {
    const db = mClient.db(process.env.MONGO_DB);
    const credentialCollection = db.collection('credentials');

    const tCreds = await credentialCollection.findOne({ service: 'twitch' });
    if (tCreds) {
        console.log('Loaded token from MongoDB');
        return tCreds.token;
    } else {
        console.log('No token found in MongoDB');
        return null;
    }
}

// Function to refresh the access token
let isRefreshingToken = false;
let refreshPromise = null;

async function refreshAccessToken() {
    if (isRefreshingToken) {
        return refreshPromise; // Return the existing refresh promise if a refresh is already in progress
    }

    isRefreshingToken = true;
    refreshPromise = (async () => {
        try {
            const db = mClient.db(process.env.MONGO_DB);
            const credentialCollection = db.collection('credentials');
            const credentials = await credentialCollection.findOne({ service: 'twitch' });
            const token = await getStoredToken();
            if (!token) {
                throw new Error('No token found! Please authenticate manually.');
            }

            const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
                params: {
                    grant_type: 'refresh_token',
                    refresh_token: token.refresh_token,
                    client_id: credentials.client_id,
                    scope: token.scope,
                    client_secret: credentials.client_secret,
                },
            });

            const newAccessToken = response.data.access_token;
            const newRefreshToken = response.data.refresh_token || token.refresh_token;
            const newExpirationDate = response.data.expires_in || 0;

            await saveToken(newAccessToken, newRefreshToken, newExpirationDate, token.scope);
            console.log('Access token refreshed successfully.');

            return newAccessToken;
        } catch (error) {
            console.error('Failed to refresh access token:', error.response?.data || error.message);
            throw error;
        } finally {
            isRefreshingToken = false;
            refreshPromise = null;
        }
    })();

    return refreshPromise;
}

// Function to make requests to the Twitch API
async function makeTwitchRequest(endpoint) {
    const db = mClient.db(process.env.MONGO_DB);
    const credentialCollection = db.collection('credentials');
    const credentials = await credentialCollection.findOne({ service: 'twitch' });

    const token = await getStoredToken();
    if (!token.access_token) {
        console.error('No access token available.');
        return;
    }

    try {
        const response = await axios.get(`https://api.twitch.tv/helix/${endpoint}`, {
            headers: {
                'Client-Id': credentials.client_id,
                'Authorization': `Bearer ${token.access_token}`,
            },
        });

        return response.data;
    } catch (error) {
        if (error.response?.status === 401) {
            console.log('Access token expired. Refreshing...');
            const newToken = await refreshAccessToken();
            if (newToken) {
                return makeTwitchRequest(endpoint); // Retry with new token
            }
        }

        console.error('Twitch API request failed:', error.response?.data || error.message);
    }
}

// Initialize Discord Client
const dClient = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
    ],
});

// Load Discord event handlers
fs.readdirSync('./handlers').forEach((handler) => {
    require(`./handlers/${handler}`)(dClient);
});

// Function to log in to Discord
async function dLogin() {
    try {
        const db = mClient.db(process.env.MONGO_DB);
        const credentialCollection = db.collection('credentials');
        const dCreds = await credentialCollection.findOne({ service: 'discord' });

        if (!dCreds || !dCreds.token) {
            throw new Error('Discord credentials not found.');
        }

        await dClient.login(dCreds.token);
        console.log('Discord client logged in successfully.');
    } catch (error) {
        console.error('Discord login failed:', error);
    }
}

dLogin();

// Function to log in to Twitch
async function tLogin() {
    const channels = ['desq_blocki'];
    const db = mClient.db(process.env.MONGO_DB);
    const credentialCollection = db.collection('credentials');
    const tCreds = await credentialCollection.findOne({ service: 'twitch' });

    if (!tCreds || !tCreds.username || !tCreds.token || !tCreds.token.access_token) {
        console.error('Twitch credentials are missing or incomplete.');
        return;
    }

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
        channels: channels,
    });

    tClient.connect();
    

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

    tClient.on('disconnected', (reason) => {
        console.log('Twitch client disconnected:', reason);
        if (reason.includes('Login authentication failed')) {
            refreshAccessToken()
                .then(() => tClient.connect())
                .catch((error) => {
                    console.error('Failed to refresh token and reconnect:', error);
                });
        }
    });
}

tLogin();

module.exports = { mClient, dClient };