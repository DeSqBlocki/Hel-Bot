// Delay function for pauses
function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

// Save token to MongoDB
async function saveToken(access_token, refresh_token, expiresIn, scope) {
    const db = mClient.db("clients");
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

// Retrieve stored token from MongoDB
async function getStoredToken() {
    const db = mClient.db("clients");
    const credentialCollection = db.collection('credentials');

    const tCreds = await credentialCollection.findOne({ service: 'twitch' });
    if (tCreds) {
        console.log('Loaded token from MongoDB');
        return tCreds.token;
    }
    console.log('No token found in MongoDB');
    return null;
}

// Refresh the access token
let isRefreshingToken = false;
let refreshPromise = null;

async function refreshAccessToken() {
    if (isRefreshingToken) {
        return refreshPromise; // Return existing refresh promise
    }

    isRefreshingToken = true;
    refreshPromise = (async () => {
        try {
            const db = mClient.db("clients");
            const credentialCollection = db.collection('credentials');
            const credentials = await credentialCollection.findOne({ service: 'twitch' });
            const token = await getStoredToken();
            if (!token) throw new Error('No token found! Please authenticate manually.');

            const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
                params: {
                    grant_type: 'refresh_token',
                    refresh_token: token.refresh_token,
                    client_id: credentials.client_id,
                    scope: token.scope,
                    client_secret: credentials.client_secret,
                },
            });

            const { access_token, refresh_token, expires_in } = response.data;

            await saveToken(access_token, refresh_token || token.refresh_token, expires_in, token.scope);
            console.log('Access token refreshed successfully.');

            return access_token;
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

// Make requests to the Twitch API
async function makeHelixRequest(requestType, endpoint, params, data) {
    const db = mClient.db("clients");
    const credentialCollection = db.collection('credentials');
    const credentials = await credentialCollection.findOne({ service: 'twitch' });

    const token = await getStoredToken();
    if (!token?.access_token) {
        console.error('No access token available.');
        return;
    }

    try {
        const headers = {
            'Client-Id': credentials.client_id,
            'Authorization': `Bearer ${token.access_token}`,
        };

        let response;
        switch (requestType) {
            case 'GET':
                response = await axios.get(`https://api.twitch.tv/helix/${endpoint}`, { headers, params });
                return response.data;
            case 'PATCH':
                response = await axios.patch(`https://api.twitch.tv/helix/${endpoint}`, data, { headers, params });
                return response.data;
            default:
                throw new Error('Invalid request type');
        }
    } catch (error) {
        if (error.response?.status === 401) {
            console.log('Access token expired. Refreshing...');
            const newToken = await refreshAccessToken();
            if (newToken) {
                return makeHelixRequest(requestType, endpoint, params, data); // Retry with new token
            }
        }

        console.error('Twitch API request failed:', error.response?.data || error.message);
    }
}

// Convert Twitch username to user ID
async function getIDByName(user) {
    const params = { login: user };
    const response = await makeHelixRequest('GET', 'users', params);
    return response?.data[0]?.id;
}

// Update chat mode (follower/subscriber mode)
async function updateChatMode(broadcaster_id, setTo) {
    const state = (setTo === 'on');
    const db = mClient.db('clients');
    const credentialCollection = db.collection('credentials');
    const credentials = await credentialCollection.findOne({ service: 'twitch' });

    const data = {
        "follower_mode": state,
        "follower_mode_duration": 0,
        "subscriber_mode": state,
        "emote_mode": state
    };
    const params = {
        broadcaster_id,
        moderator_id: credentials.mod_id
    };

    await makeHelixRequest('PATCH', 'chat/settings', params, data);
}

// Get channel information
async function getChannelInformation(broadcaster_id) {
    return await makeHelixRequest('GET', 'channels', { broadcaster_id });
}