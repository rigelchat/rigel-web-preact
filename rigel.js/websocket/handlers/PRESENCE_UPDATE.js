import { Events } from "../../Constants.js";

export default function(client, packet, shard) {
    const user = client.users.cache.get(packet.d.user.id);
    if (!user) return;
    const guild = client.guilds.cache.get(packet.d.guild_id);
    if (!guild) return;
    const oldPresence = guild.presences.cache.get(user.id)?._clone() ?? null;
    const newPresence = guild.presences._add(Object.assign(packet.d, { guild }));
    if (!newPresence.equals(oldPresence)) {
        client.emit(Events.PresenceUpdate, oldPresence, newPresence);
    };
};