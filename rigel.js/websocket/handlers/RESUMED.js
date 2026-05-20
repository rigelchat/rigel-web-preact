import { Events } from "../../Constants.js";

export default function(client, packet, shard) {
    shard.connectAttempts = 0;
    shard.reconnectInterval = 1000;
    shard.failedToConnectDueToNetworkError = false;
    shard.heartbeat();
    client.emit(Events.ShardResume);
};