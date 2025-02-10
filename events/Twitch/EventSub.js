const ReconnectingWebSocket = require("reconnecting-websocket");
const { mClient, dClient } = require("../..");
const { getIDByName } = require("../../functions");
const { WebSocket, EventEmitter } = require("ws");
const axios = require("axios")
const events = new EventEmitter()
const WebsocketEvents = {
    CONNECTED: "connected",
    DISCONNECTED: "disconnected"
}
module.exports = {
    name: 'Twitch/EventSub',
    once: false,
    async execute() {
        console.log('Starting Event Subs...')
        const endpoint = `wss://eventsub.wss.twitch.tv/ws`

        const db = mClient.db('clients')
        const coll = db.collection('credentials')
        const credentials = await coll.findOne({ service: 'twitch' })

        const headers = {
            'Client-Id': credentials.client_id,
            'Authorization': `Bearer ${credentials.token.access_token}`,
            'Content-Type': 'application/json',
        };

        var connection
        var transport = {}
        var subscribedEvents = {}

        const options = {
            debug: true
        }
        function onConnect(data) {
            transport.session_id = data.payload.session.id,
                transport.conncted_at = data.payload.session.connected_at,
                events.emit(WebsocketEvents.CONNECTED)
        }
        function onDisconnect(reason) {
            console.log(`Disconnecting due to reason`, reason)
            if(connection.readyState === connection.OPEN){
                connection.close(4003, 'manual disconnect')
            }
        }
        function connect() {
            connection = new ReconnectingWebSocket(endpoint, [], {
                WebSocket: WebSocket,
                maxRetries: Infinity
            })

            return new Promise((resolve, reject) => {
                connection.onclose = ({ reason }) => onDisconnect(reason, reject)
                connection.onmessage = ({ data }) => onMessage(data, resolve)
            })
        }
        function onMessage(data) {
            const parsed = JSON.parse(data)

            if (options.debug) {
                console.log(`[Debug] EvenSub Data:`, parsed)
            }

            if (parsed.metadata.message_type === 'session_welcome') {
                return onConnect(parsed)
            }
            return onEventMessage(parsed)
        }
        function onEventMessage(data) {
            const messageType = data.metadata.message_type

            switch (messageType) {
                case 'notification':
                    const subscriptionType = data.metadata.subscription_type
                    return subscribedEvents[subscriptionType]?.(data.payload?.event)
                default:
                    return subscribedEvents[messageType]?.(data.payload)
            }
        }
        async function subscribe(type, condition, listener, version = 1) {
            const sessionId = transport.session_id
            const subscriptionPayload = {
                type: type,
                version: version,
                condition: condition,
                transport: {
                    method: 'websocket',
                    session_id: sessionId,
                },
            };
            const res = await axios.post('https://api.twitch.tv/helix/eventsub/subscriptions',
                subscriptionPayload, {
                headers: headers
            })
            console.log(res)
            console.log(`Subscribed to ${type}`)
            subscribedEvents[type] = listener
            return true
        }
        connect(options)
        if (options.debug) {
            events.on(WebsocketEvents.CONNECTED, () => {
                console.log("Connected to EventSub");
            })

            events.on(WebsocketEvents.DISCONNECTED, () => {
                console.log("Disconnected from EventSub");
            })
        }

        const conditions = [{
            broadcaster_user_id: String(await getIDByName("x__hel__x"))
        },{
            broadcaster_user_id: String(await getIDByName("desq_blocki"))
        }]

        subscribe(
            "stream.online",
            conditions[0],
            stream => {
                dClient.emit('Twitch/Online', stream)
            }
        )

        subscribe(
            "stream.offline",
            conditions[0],
            stream => {
                dClient.emit('Twitch/Offline', stream);
            }
        )
    }
}


