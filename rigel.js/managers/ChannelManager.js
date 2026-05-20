import CachedManager from "./CachedManager.js";
import GuildChannel from "../structures/GuildChannel.js";
import TextChannel from "../structures/TextChannel.js";
import { ChannelType } from "../Constants.js";

class ChannelManager extends CachedManager {
    constructor(client, iterable) {
        super(client, GuildChannel, iterable);
    };

    _add(data, guild, { cache = true, allowUnknownGuild = false } = {}) {
        const existing = this.cache.get(data.id);
        if (existing) {
            if (cache) existing._patch(data);
            guild?.channels?._add(existing);
            return existing;
        };

        guild ??= this.client.guilds.cache.get(data.guild_id);
        let channel = null;

        if (guild || allowUnknownGuild) {
            switch (data.type) {
                case ChannelType.GuildText: {
                    channel = new TextChannel(guild, data, this.client);
                }; break;

                case ChannelType.GuildVoice: {
                    channel = new GuildChannel(guild, data, this.client);
                }; break;

                case ChannelType.GuildCategory: {
                    channel = new GuildChannel(guild, data, this.client);
                }; break;

                case ChannelType.GuildAnnouncement: {
                    channel = new TextChannel(guild, data, this.client);
                }; break;

                case ChannelType.GuildForum: {
                    channel = new GuildChannel(guild, data, this.client);
                }; break;
            };
        };

        if (!channel) return;
        if (cache && !allowUnknownGuild) this.cache.set(channel.id, channel);
        guild.channels.cache.set(channel.id, channel);

        return channel;
    };

    _remove(id) {
        const channel = this.cache.get(id);
        channel?.guild?.channels.cache.delete(id);
        this.cache.delete(id);
    };
};

export default ChannelManager;