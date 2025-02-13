const { tClient, mClient } = require('../..')
module.exports = {
    name: 'Command/positivity',
    once: false,
    async execute(channel, userstate, message, self) {
        const db = mClient.db('commands')
        const coll = db.collection(channel)
        const command = await coll.findOne({ name: 'positivity' })

        // create in disabled state if not exists
        if (!command) {
            await coll.insertOne({
                name: 'positivity',
                enabled: false // default
            })
        }

        if (!command?.enabled){ return tClient.say(channel, `This command is currently disabled `) }
        
        async function sendPositivity() {
            // Function sends a random string of predetermined positivity, Donothon Top Donator Reward
            let positive_Messages = [
                "You are so very worthy of all the love and support that may come your way.",
                "There are many things which draw us together. In this time and place, that lovely subject is you, Hel.",
                "The happiness and joy you add to the world is worth more than most anything.",
                "You deserve every warm laugh, bright smile, and all the genuine kindness given to you.",
                "There are few things as precious as your time. Thank you for sharing with us.",
                "Your feelings are valid and you are not less than for having them.",
                "I've seen all the work you do and I'm so very proud of you.",
                "You are dearly cherished and I want to thank you for being so wonderfully you.",
                "You. Are. Worthy. Enough. And I will tell you as many times as it takes for you to believe it.",
                "Every day you give your best and that is so admirable. Don't let anyone tell you otherwise.",
                "Your light is like that of the full moon, brightening our lives even in our darkest moments.",
                "It's okay to take a moment to catch your breath. Even machines require maintenance from time to time.",
                "Watching you succeed and achieve your heart's desires gives me so much motivation and I am very grateful for it."
            ]

            let rdm = Math.floor(Math.random() * positive_Messages.length)
            return tClient.say(channel, positive_Messages[rdm])
        }
        sendPositivity()
    }
}