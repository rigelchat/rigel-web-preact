import CachedManager from "./CachedManager.js";
import GuildMember from "../structures/GuildMember.js";

class GuildMemberManager extends CachedManager {
    constructor(guild, iterable) {
        super(guild.client, GuildMember, iterable);
        this.guild = guild;
    };

    _add(data, cache = true) {
        return super._add(data, cache, { id: data.user.id, extras: [this.guild] });
    };

    resolve(member) {
        const memberResolvable = super.resolve(member);
        if (memberResolvable) return memberResolvable;
        const userId = this.client.users.resolveId(member);
        if (userId) return this.cache.get(userId) ?? null;
        return null;
    };

    resolveId(member) {
        const memberResolvable = super.resolveId(member);
        if (memberResolvable) return memberResolvable;
        const userId = this.client.users.resolveId(member);
        return this.cache.has(userId) ? userId : null;
    };

    get me() {
        return this.cache.get(this.client.user.id);
    };

    // rename to fetchLazy or fetchMany or with ranges
    requestLazy(channels) {
        this.client.ws.sendPacket(14, {
            guild_id: this.guild.id,
            channels
        });
    };
};

export default GuildMemberManager;