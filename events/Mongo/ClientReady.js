module.exports = {
    name: 'Mongo/ClientReady',
    once: false,
    execute(stream) {
        console.log(`Connected to ${stream.address}`)
    }
}