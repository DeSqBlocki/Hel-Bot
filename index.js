const { MongoClient } = require('mongodb');
require('dotenv').config()
const mClient = new MongoClient(process.env.mongo_uri)
exports.mClient = mClient;


async function connectToMongo() { 
    await mClient.connect();
    console.log('Connected to MongoDB');

    async function getChannelInformation(broadcasterId) {
        const endpoint = `channels?broadcaster_id=${broadcasterId}`;
        const channelInfo = await makeTwitchRequest(endpoint);
        if (channelInfo) {
            console.log('Channel Information:', channelInfo);
        } else {
            console.log('Failed to retrieve channel information.');
        }
    }
    getChannelInformation(process.env.test_id);
    
}
connectToMongo();

async function saveToken(accessToken, refreshToken, expires_in) {
    let db = mClient.db(process.env.mongo_db);
    let tokenCollection = db.collection("twitch-token");

    const tokenData = {
        accessToken,
        refreshToken,
        expires_in,
        obtainedAt: Date.now()
    };

    await tokenCollection.updateOne({}, { $set: tokenData }, { upsert: true });
    console.log('TTV Token updated in MongoDB');
}
async function getStoredToken() {
    let db = mClient.db(process.env.mongo_db);
    let tokenCollection = db.collection("twitch-token");

    const tokenData = await tokenCollection.findOne({});
    if (tokenData) {
        console.log('Loaded token from MongoDB');
        return tokenData;
    } else {
        console.log('No token found in MongoDB');
        return null;
    }
}

const axios = require('axios');
async function refreshAccessToken() {
    let db = mClient.db(process.env.mongo_db)
    let credentialCollection = db.collection('credentials')
    let credentials = await credentialCollection.find({ service: 'twitch' }).toArray()

    const token = await getStoredToken();
    if (!token) {
        console.error('No token found! Please authenticate manually.');
        return;
    }

    try {
        const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
            params: {
                grant_type: 'refresh_token',
                refresh_token: token.refreshToken,
                client_id: credentials.client_id,
                client_secret: credentials.client_secret
            }
        });

        const newAccessToken = response.data.access_token;
        const newRefreshToken = response.data.refresh_token || token.refreshToken;
        const newExpirationDate = response.data.expires_in || 0

        await saveToken(newAccessToken, newRefreshToken, newExpirationDate);
        console.log('Access token refreshed successfully');
    } catch (error) {
        console.error('Failed to refresh access token:', error.response?.data || error.message);
    }
}
async function makeTwitchRequest(endpoint) {
    let db = mClient.db(process.env.mongo_db)
    let credentialCollection = db.collection('credentials')
    let credentials = await credentialCollection.findOne({ service: 'twitch' })

    let token = await getStoredToken();
    if (!token.access_token) {
        console.error('No access token available.');
        return;
    }

    try {
        const response = await axios.get(`https://api.twitch.tv/helix/${endpoint}`, {
            headers: {
                'Client-Id': credentials.client_id,
                'Authorization': `Bearer ${token.access_token}`
            }
        });

        return response.data;
    } catch (error) {
        if (error.response?.status === 401) {
            console.log(error)
            console.log('Access token expired. Refreshing...');
            const newToken = await refreshAccessToken();
            if (newToken) {
                return makeTwitchRequest(endpoint); // Retry with new token
            }
        }

        console.error('Twitch API request failed:', error.response?.data || error.message);
    }
}