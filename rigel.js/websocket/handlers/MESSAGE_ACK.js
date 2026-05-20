import { Events } from "../../Constants.js";

export default function(client, packet, shard) {
    const { channel_id, message_id, mention_count } = packet.d;

    const readState = client.readStates._add({
        id: channel_id,
        last_message_id: message_id,
        mention_count: mention_count ?? 0
    });

    client.emit(Events.ReadStateUpdate, readState);
};
