const { mClient, tClient } = require("../..");

module.exports = {
    name: 'Command/donate',
    once: false,
    async execute(channel, userstate, message, self) {

        const db = mClient.db('commands')
        const coll = db.collection(channel)
        const command = await coll.findOne({ name: 'donate' })

        // create in disabled state if not exists
        if (!command) {
            await coll.insertOne({
                name: 'donate',
                enabled: false // default
            })
        }

        if (!command?.enabled){ return tClient.say(channel, `This command is currently disabled `)}
        
        async function sendDonationAd() {
            // Function to send static donate ad
            const links = [
                "https://bit.ly/heltwittergoals",
                "https://bit.ly/donatetohel",
                "http://bit.ly/donothon_goals"
            ];
        
            const messages = [
                "Hel is currently celebrating her birthday with a donathon!",
                `You can see goals and incentives here: ${links[0]}`,
                `You can donate here: ${links[1]}`,
                `Terms, conditions, rules and how rewards work are found here: ${links[2]}`,
                "All donations and gifts are greatly appreciated, but please do so responsibly!"
            ];
        
            for (const message of messages) {
                await tClient.say(channel, message);
            }
        }
        sendDonationAd()
    }
}