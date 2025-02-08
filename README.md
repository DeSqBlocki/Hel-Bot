# HelBot v5

HelBot v5 introduces an improved background logic structure, streamlined integration with the Helix API, and automated token renewal for Twitch.tv, ensuring a seamless experience for streamers and their communities.

### Database Structure:

**client.credentials**:  
- `_id`  
- `client_id`  
- `client_secret`  
- `token`  
- `service`  
- `mod_id`  

**shoutouts.#channel**:  
- `_id`  
- `user`  
- `created_at`  

**guilds.id**:  
- `_id`  
- `settings`
- `channels` 

### Chat Commands:

**Update Chat Mode** (Mods & Broadcaster only)  
- `$mode [on:off]`  

**Get a Random Positive Reminder**  
- `$positivity`  

**View Donothon/Charity Event Information**  
- `$donate`  

### Behaviour:

- Automatically protects the chat by enabling **follow-only**, **sub-only**, or **emote-only** modes when the stream goes offline.  
- Automatically shoutouts VIPs when they speak for the first time in the chat during a stream.  
- Automatically shoutouts Raiders when getting raided.  
- Responds to specific messages containing "Kaw", "Caw", or "Kweh", with **Strict** and **Non-Strict** modes available.
