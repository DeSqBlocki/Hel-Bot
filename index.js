process.traceDeprecation = false;
const { REST, Routes, Client, GatewayIntentBits, Collection } = require('discord.js');
const { token, clientID, guildID, TTV_ID, TTV_Token, TTV_Refresh_Token, TTV_Secret, TTV_User, mongoURI } = require('./config.json');
const { MongoClient } = require('mongodb');
const mClient = new MongoClient(mongoURI);
exports.mClient = mClient;
const fs = require('node:fs');
const path = require('node:path');
const axios = require('axios');
const channels = ['desq_blocki', 'x__hel__x'];
const DiscordClient = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
    ]
});
exports.DiscordClient = DiscordClient;

const HelixAPI = require("simple-helix-api").default;
const tmi = require('tmi.js');
const Helix = new HelixAPI({
    client_id: TTV_ID,
    access_token: TTV_Token
});
exports.Helix = Helix;

// Function to refresh the access token
async function refreshAccessToken() {
    try {
        const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
            params: {
                grant_type: 'refresh_token',
                refresh_token: TTV_Refresh_Token,
                client_id: TTV_ID,
                client_secret: TTV_Secret
            }
        });

        const newAccessToken = response.data.access_token;
        const newRefreshToken = response.data.refresh_token;

        console.log('New access token:', newAccessToken);
        console.log('New refresh token:', newRefreshToken);

        // Update config.json with the new tokens
        updateConfig(newAccessToken, newRefreshToken);

        return newAccessToken;
    } catch (error) {
        console.error('Error refreshing access token:', error.response?.data || error.message);
        return null;
    }
}

// Function to update the config.json with the new tokens
function updateConfig(newAccessToken, newRefreshToken) {
    const config = require('./config.json');
    config.TTV_Token = newAccessToken;
    config.TTV_Refresh_Token = newRefreshToken;

    fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
    console.log('Config updated successfully!');
}

// Set up the Twitch client
let _TTV_Token = TTV_Token;
const TwitchClient = new tmi.Client({
    options: { debug: false },
    connection: {
        reconnect: true,
        secure: true,
    },
    identity: {
        username: TTV_User,
        password: `oauth:${_TTV_Token}`,
    },
    channels: channels,
});

TwitchClient.connect().then(exports.TwitchClient = TwitchClient);

// Init Command Handler
DiscordClient.commands = new Collection(); // used internally by interactions
let commands = []; // only used for REST API

const foldersPath = path.join(__dirname, 'discord-commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
            DiscordClient.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

// Init Rest API
const rest = new REST().setToken(token);
(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        const data = await rest.put(
            Routes.applicationGuildCommands(clientID, guildID),
            { body: commands },
        );

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error(error);
    }
})();

// Init Event Handler
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        DiscordClient.once(event.name, (...args) => event.execute(...args));
    } else {
        DiscordClient.on(event.name, (...args) => event.execute(...args));
    }
}

// Login
DiscordClient.login(token);

// Handle Twitch events
TwitchClient.on('connected', (address, port) => {
    console.log(`Connected to Twitch on ${address}:${port}`);
});

TwitchClient.on('message', async (channel, userstate, message, self) => {
    DiscordClient.emit('TwitchOnMessage', channel, userstate, message, self);
});

TwitchClient.on('raided', (channel, username, raiders) => {
    DiscordClient.emit('TwitchOnRaided', channel, username, raiders);
});

TwitchClient.on('hosted', (channel, username, viewers, autohost) => {
    DiscordClient.emit('TwitchOnHosted', channel, username, viewers, autohost);
});

TwitchClient.on('subscribers', (channel, enabled) => {
    DiscordClient.emit('TwitchOnSubOnly', channel, enabled);
});

// Handle disconnection and try refreshing the token
TwitchClient.on('disconnected', async (reason) => {
    console.log('Disconnected:', reason);
    if (reason === 'Invalid OAuth token' || reason === 'Login authentication failed') {
        console.log('Token expired, refreshing...');

        const newToken = await refreshAccessToken();
        if (newToken) {
            TTV_Token = newToken;
            TwitchClient.opts.identity.password = `oauth:${newToken}`;

            try {
                await TwitchClient.connect();
                console.log('Reconnected successfully with new token.');
            } catch (err) {
                console.error('Reconnection failed:', err);
            }
        } else {
            console.log('Failed to refresh token, cannot reconnect.');
        }
    } else {
        console.error('Disconnected for another reason:', reason);
    }
});

// Catch unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
