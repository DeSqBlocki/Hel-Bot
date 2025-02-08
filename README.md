# HelBot v5

## This Version of HelBot aims to clean up some background logic, directly tap into Helix API and mainly auto-renew tokens provided by Twitch.tv

### Database Structure:
client.credentials:
> _id
> client_id
> client_secret
> token
> service
> mod_id

shoutouts.#channel:
> _id
> user
> created_at

### Chat Commands:

Update Chat Mode (Mods & Broadcaster only)
> $mode [on:off]

Get a random positive reminder (All)
> $positivity

View Donothon/Charity Event Infos
> $donate

### Behaviour:

- Automatically protect chat by enabling follow/sub/emote only upon going offline
- Automatically shoutout VIPs when they write something in chat for the first time of this stream
- Automatically shoutout Raiders upon Getting Raided
- Respond to Messages inclunding Kaw, Caw or Kweh (Strict and Non-Strict Mode available)