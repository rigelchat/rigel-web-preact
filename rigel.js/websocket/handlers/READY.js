import { Events } from "../../Constants.js";
import { WebSocketShardStatus } from "../../Constants.js";
import ClientUser from "../../structures/ClientUser.js";

export default function(client, packet, shard) {
    shard.connectAttempts = 0;
    shard.reconnectInterval = 1000;
    shard.sessionId = packet.d.session_id;
    shard.status = WebSocketShardStatus.Ready;
    shard.resumeUrl = `${packet.d.resume_gateway_url}?v=${client.options.ws.version}&encoding=json${client.options.compress ? "&compress=snappy" : ""}`;
    shard.failedToConnectDueToNetworkError = false;

    client.readyTimestamp = Date.now();
    client.presence.userId = packet.d.user.id;
    client.sessions.currentSessionIdHash = packet.d.auth_session_id_hash;

    if (client.user) {
        client.user._patch(packet.d.user);
    } else {
        client.user = new ClientUser(client, packet.d.user);
        client.users.cache.set(client.user.id, client.user);
    };

    if (packet.d.user_settings) {
        client.settings._patch(packet.d.user_settings);
    };

    for (let i = 0; i < packet.d.guilds.length; i++) {
        const guild = client.guilds._add(packet.d.guilds[i]);
        if (!packet.d.merged_members) continue;
        const guildMembers = packet.d.merged_members[i];
        for (const guildMember of guildMembers) {
            guild.members._add(guildMember);
        };
    };

    if (packet.d.merged_members) {
        for (const members of packet.d.merged_members) {
            for (const member of members) {
                const guild = client.guilds.cache.get(member.guild_id);
                guild.members._add(member);
            };
        };
    };

    if (packet.d.read_state) {
        for (const readState of packet.d.read_state.entries) {
            client.readStates._add(readState);
        };
    };

    client.emit(Events.Ready);
};