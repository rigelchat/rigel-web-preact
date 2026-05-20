import { Events } from "../../Constants.js";

export default function(client, packet, shard) {
    const channel = client.channels.cache.get(packet.d.channel_id);
    if (channel) {
        if (!channel.isTextBased()) return;
        if (channel.isThread()) channel.messageCount--;
        const message = channel.messages.cache.get(packet.d.id);
        if (message) {
            channel.messages.cache.delete(message.id);
            client.emit(Events.MessageDelete, message);
        };
    };
};