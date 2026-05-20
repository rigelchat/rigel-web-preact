import { Events } from "../../Constants.js";

export default function(client, packet, shard) {
    const channel = client.channels.cache.get(packet.d.channel_id);
    if (channel) {
        if (!channel.isTextBased()) return;
        const message = channel.messages.cache.get(packet.d.id);
        if (message) {
            const old = message._update(packet.d);
            client.emit(Events.MessageUpdate, old, message);
        };
    };
};