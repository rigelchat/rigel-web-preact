import { Events } from "../../Constants.js";

export default function(client, packet, shard) {
    const guild = client.guilds.cache.get(packet.d.guild_id);
    if (guild) {
        const member = guild.members.cache.get(packet.d.user.id);
        guild.members.cache.delete(packet.d.user.id);
        guild.presences.cache.delete(packet.d.user.id);
        client.emit(Events.GuildMemberRemove, member);
    };
};