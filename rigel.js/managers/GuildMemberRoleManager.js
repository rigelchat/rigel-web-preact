import CachedManager from "./CachedManager.js";
import Role from "../structures/Role.js";

class GuildMemberRoleManager extends CachedManager {
    constructor(member) {
        super(member.client, Role);
        this.member = member;
        this.guild = member.guild;
    };

    get cache() {
        const everyone = this.guild.roles.everyone;
        return this.guild.roles.cache.filter((role) => this.member._roles.includes(role.id)).set(everyone.id, everyone);
    };

    get hoist() {
        const hoistedRoles = this.cache.filter((role) => role.hoist);
        if (!hoistedRoles.size) return null;
        return hoistedRoles.reduce((prev, role) => (role.comparePositionTo(prev) > 0 ? role : prev));
    };

    get icon() {
        const iconRoles = this.cache.filter((role) => role.icon || role.unicodeEmoji);
        if (!iconRoles.size) return null;
        return iconRoles.reduce((prev, role) => (role.comparePositionTo(prev) > 0 ? role : prev));
    };

    get color() {
        const coloredRoles = this.cache.filter((role) => role.color);
        if (!coloredRoles.size) return null;
        return coloredRoles.reduce((prev, role) => (role.comparePositionTo(prev) > 0 ? role : prev));
    };

    get highest() {
        return this.cache.reduce((prev, role) => (role.comparePositionTo(prev) > 0 ? role : prev), this.cache.first());
    };

    get botRole() {
        if (!this.member.user.bot) return null;
        return this.cache.find((role) => role.tags?.botId === this.member.user.id) ?? null;
    };
};

export default GuildMemberRoleManager;