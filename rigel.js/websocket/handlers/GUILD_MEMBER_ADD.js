import { Events } from "../../Constants.js";

export default function(client, packet, shard) {
    const guild = client.guilds.cache.get(packet.d.guild_id);
    const member = guild.members._add(packet.d);
    client.emit(Events.GuildMemberAdd, member);
};