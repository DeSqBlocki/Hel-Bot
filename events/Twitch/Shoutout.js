const { tClient } = require("../..");
const { getChannelInformation } = require("../../functions");

// Event triggered by Custom Shoutout emitted in Messages.js
const soBuffer = new Map();
let isShoutoutInProgress = false;  // Track shoutout status to avoid overlapping shoutouts

module.exports = {
    name: 'Twitch/Shoutout',
    once: false,
    async execute(reason, channel, username) {
        
        // Function to perform shoutout (Nightbot or custom)
        async function doShoutouts(channel, user) {
            try {
                // Use Nightbot command !so
                // tClient.say(channel, `!so ${user}`); // Send the shoutout command

                // Use custom shoutout
                let res = await getChannelInformation(user)
                let channelInfo = res?.data[0]
                let shoutoutMessage = `Check out ${channelInfo.broadcaster_name} over at https://twitch.tv/${channelInfo.broadcaster_login}! They were last playing ${channelInfo.game_name}`
                tClient.say(channel, shoutoutMessage)

                console.log(`Shouting out ${user} in channel ${channel} for reason: ${reason}`);

            } catch (error) {
                console.error('Error during shoutout:', error);
            }
        }

        // Handle buffered shoutout queue
        async function processShoutoutQueue() {
            if (soBuffer.size === 0 || isShoutoutInProgress) {
                return; // Exit if no users are in the buffer or a shoutout is in progress
            }

            // Set shoutout in progress flag
            isShoutoutInProgress = true;

            // Get the next user in the buffer
            const [user, channel] = soBuffer.entries().next().value;

            try {
                await doShoutouts(channel, user); // Perform the shoutout
                soBuffer.delete(user); // Remove user after shoutout is done
                // console.log(`Shoutout for ${user} completed in channel ${channel}`);
            } catch (error) {
                console.error('Error while processing shoutout:', error);
            } finally {
                // Reset shoutout in progress flag and schedule next shoutout
                isShoutoutInProgress = false;
                setTimeout(processShoutoutQueue, 5000); // Schedule next shoutout after cooldown
            }
        }

        // Add user to the buffer if not already present
        if (!soBuffer.has(username)) {
            soBuffer.set(username, channel);
            console.log(`Added ${username} to the shoutout buffer. Reason: ${reason}`);
        }

        // Call the shoutout queue processing
        setTimeout(processShoutoutQueue, 5000); // Ensure 5-second cooldown between shoutouts
    }
};
