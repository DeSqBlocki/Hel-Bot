// index.js
require('dotenv').configDotenv
const fs = require('fs');
const initializeClients = require('./clients');


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
    tClient.connect()
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
