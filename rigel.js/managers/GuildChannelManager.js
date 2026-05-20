import CachedManager from "./CachedManager.js";
import GuildChannel from "../structures/GuildChannel.js";

class GuildChannelManager extends CachedManager {
    constructor(guild, iterable) {
        super(guild.client, GuildChannel, iterable);
        this.guild = guild;
    };
};

export default GuildChannelManager;