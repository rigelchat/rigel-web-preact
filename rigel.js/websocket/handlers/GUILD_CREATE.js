import { Events } from "../../Constants.js";
import { WebSocketShardStatus } from "../../Constants.js";

export default function(client, packet, shard) {
    let guild = client.guilds.cache.get(packet.d.id);
    if (guild) {
        if (!guild.available && !packet.d.unavailable) {
            guild._patch(packet.d);
            client.emit(Events.GuildAvailable, guild);
        };
    } else {
        guild = client.guilds._add(packet.d);
        if (shard.status === WebSocketShardStatus.Ready) {
            client.emit(Events.GuildCreate, guild);
        };
    };
};