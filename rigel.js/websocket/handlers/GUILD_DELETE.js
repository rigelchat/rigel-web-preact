import { Events } from "../../Constants.js";

export default function(client, packet, shard) {
    let guild = client.guilds.cache.get(packet.d.id);
    if (guild) {
        if (packet.d.unavailable) {
            guild.available = false;
            client.emit(Events.GuildUnavailable, guild);
        } else {
            for (const channel of guild.channels.cache.values()) {
                client.channels._remove(channel.id);
            };
            client.guilds.cache.delete(guild.id);
            client.emit(Events.GuildDelete, guild);
        };
    };
};