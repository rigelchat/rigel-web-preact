import { Events } from "../../Constants.js";

export default function(client, packet, shard) {
    const guild = client.guilds.cache.get(packet.d.guild_id);
    if (!guild) return;

    // todo: create a new manager
    // for (const group of groups) {
    //     group.id;
    //     group.count; // (peut etre 'online' sinon id du channel)
    // };

    for (const op of packet.d.ops) {
        if (!op.op === "SYNC") continue;
        for (const item of op.items) {
            if (item.member) {
                guild.members._add(item.member);
                guild.presences._add(item.member.presence);
            };
        };
    };

    client.emit(Events.GuildMemberListUpdate, guild);
};