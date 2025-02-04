module.exports = {
    category: 'Admin',
    description: 'Replies with pong',
    slash: 'both',
    testOnly: true,

    callback: ({ }) => {
        return "Pong!"
    }
}