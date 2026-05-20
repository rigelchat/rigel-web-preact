import CachedManager from "./CachedManager.js";
import Role from "../structures/Role.js";

class GuildManager extends CachedManager {
    constructor(guild, iterable) {
        super(guild.client, Role, iterable);
        this.guild = guild;
    };

    _add(data, cache) {
        return super._add(data, cache, { extras: [this.guild] });
    };

    comparePositions(role1, role2) {
        const resolvedRole1 = this.resolve(role1);
        const resolvedRole2 = this.resolve(role2);
        if (!resolvedRole1 || !resolvedRole2) throw new RangeError("Supplied role is not a Role nor a Snowflake.");

        const role1Position = resolvedRole1.position;
        const role2Position = resolvedRole2.position;

        if (role1Position === role2Position) {
            return Number(BigInt(resolvedRole2.id) - BigInt(resolvedRole1.id));
        };

        return role1Position - role2Position;
    };

    botRoleFor(user) {
        const userId = this.client.users.resolveId(user);
        if (!userId) return null;
        return this.cache.find((role) => role.tags?.botId === userId) ?? null;
    };

    get everyone() {
        return this.cache.get(this.guild.id);
    };

    get premiumSubscriberRole() {
        return this.cache.find((role) => role.tags?.premiumSubscriberRole) ?? null;
    };

    get highest() {
        return this.cache.reduce((prev, role) => (role.comparePositionTo(prev) > 0 ? role : prev), this.cache.first());
    };
};

export default GuildManager;