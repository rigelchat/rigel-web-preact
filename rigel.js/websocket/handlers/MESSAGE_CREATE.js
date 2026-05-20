import { Events } from "../../Constants.js";

export default function(client, packet, shard) {
    const channel = client.channels.cache.get(packet.d.channel_id);
    if (channel) {
        if (!channel.isTextBased()) return;
        const existing = channel.messages.cache.get(packet.d.id);
        if (existing && existing.author?.id !== client.user.id) return;
        const message = existing ?? channel.messages._add(packet.d);
        channel.lastMessageId = packet.d.id;
        client.emit(Events.MessageCreate, message);
    };
};