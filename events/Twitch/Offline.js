const { updateChatMode } = require('../../functions')
module.exports = {
    name: 'Twitch/Offline',
    once: false,
    execute(stream) {
        console.log(`${stream.broadcaster_user_login} went offline!`)
        updateChatMode(stream.broadcaster_user_id, "on")
    }
}