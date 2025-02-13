# HelBot v5

HelBot v5 introduces an improved background logic structure, streamlined integration with the Helix API, and automated token renewal for Twitch.tv, ensuring a seamless experience for streamers and their communities.

### Database Structure:

**client.credentials**:  
- `client_id`  (twitch:discord)
- `client_secret`  (twitch:discord)
- `token`   (access_token:token)
- `service`  (twitch:discord)
- `mod_id`  (twitch only)

**shoutouts.#channel**:  
- `user`  
- `created_at`  

**guilds.id**:  
- `event`
- `channel` 

**commands.channel**:  
- `name`
- `enabled` 

**settings.channel**:  
- `name`
- `enabled` 

### Chat Commands:

**Update Chat Mode** (Mods & Broadcaster only)  
- `$mode [on:off]`  

**Get A Positive Reminder**  
- `$positivity`  

**View Donothon/Charity Event Information**  
- `$donate`  

**View / Manage Settings**  
- `$commands [enable:disable] [setting]`

**View / Manage Commands**  
- `$commands [enable:disable] [command]`  

### Behaviour:

- Automatically protects the chat by enabling **follow-only**, **sub-only**, or **emote-only** modes when the stream goes offline.  
- Automatically shoutouts VIPs when they speak for the first time in the chat during a stream.  
- Automatically shoutouts Raiders when getting raided.  
- Responds to specific messages containing "Kaw", "Caw", or "Kweh", with **Strict** and **Non-Strict** modes available.
