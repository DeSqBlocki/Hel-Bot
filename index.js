// index.js
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const fs = require('fs');
const axios = require('axios');
const initializeClients = require('./clients');

dotenv.config();

// Validate required environment variables
function validateEnvVariables() {
    const requiredVars = ['MONGO_URI'];
    const missingVars = requiredVars.filter((varName) => !process.env[varName]);

    if (missingVars.length > 0) {
        console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
        process.exit(1);
    }
}

// Initialize clients asynchronously and export them
async function startApp() {
    const { mClient, dClient, tClient } = await initializeClients();
    validateEnvVariables();

    // Export initialized clients
    module.exports = { mClient, dClient, tClient };

    // Load Discord event handlers
    fs.readdirSync('./handlers').forEach((handler) => {
        require(`./handlers/${handler}`);
    });

}

startApp().catch(console.error);

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
