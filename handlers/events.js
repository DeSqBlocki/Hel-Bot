const fs = require('node:fs')
const path = require('node:path')
module.exports = (dClient) => {
    const folderPath = path.join(__dirname, '../events')
    const eventFolders = fs.readdirSync(folderPath)

    for (const folder of eventFolders) {
        const eventsPath = path.join(folderPath, folder);
        const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'))
        
        for (const file of eventFiles) {
            const filePath = path.join(eventsPath, file)
            const event = require(filePath)
            if (event.once) {
                dClient.once(event.name, (...args) => event.execute(...args, dClient))
                // added client to commomerate global usage
            } else {
                dClient.on(event.name, (...args) => event.execute(...args, dClient))
                // added client to commomerate global usage
            }
        }
    }
}