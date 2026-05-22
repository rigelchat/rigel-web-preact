import Typing from "../../structures/Typing.js";
import { Events } from "../../Constants.js";

export default function(client, packet, shard) {
    const channel = client.channels.cache.get(packet.d.channel_id);
    if (!channel || !channel.guildId) return;
    const user = channel.guild.members._add(packet.d.member).user;
    client.emit(Events.TypingStart, new Typing(channel, user, packet.d));
};