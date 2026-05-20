import Base from "./Base.js";
import GuildMemberRoleManager from "../managers/GuildMemberRoleManager.js";
import PermissionsBitField from "../utils/PermissionsBitField.js";
import { RigeljsError } from "../errors.js";

class GuildMember extends Base {
    constructor(client, data, guild) {
        super(client);
        this.guild = guild;
        this.joinedTimestamp = null;
        this._patch(data);
    };

    _patch(data) {
        if ("user" in data) {
            this.user = this.client.users._add(data.user, true);
        };

        if ("joined_at" in data) {
            this.joinedTimestamp = new Date(data.joined_at).getTime();
        };

        if ("roles" in data) {
            this._roles = data.roles;
        };
    };

    _clone() {
        const clone = super._clone();
        clone._roles = this._roles.slice();
        return clone;
    };

    get partial() {
        return this.joinedTimestamp === null;
    };

    get roles() {
        return new GuildMemberRoleManager(this);
    };

    get joinedAt() {
        return this.joinedTimestamp && new Date(this.joinedTimestamp);
    };

    get presence() {
        return this.guild.presences.cache.get(this.id) ?? null;
    };

    get displayColor() {
        return this.roles.color?.color ?? 0;
    };

    get displayHexColor() {
        return this.roles.color?.hexColor ?? "#000000";
    };

    get id() {
        return this.user.id;
    };

    get permissions() {
        if (this.user.id === this.guild.ownerId) return new PermissionsBitField(PermissionsBitField.All).freeze();
        return new PermissionsBitField(this.roles.cache.map((role) => role.permissions)).freeze();
    };

    get manageable() {
        if (this.user.id === this.guild.ownerId) return false;
        if (this.user.id === this.client.user.id) return false;
        if (this.client.user.id === this.guild.ownerId) return true;
        if (!this.guild.members.me) throw new RigeljsError(ErrorCodes.GuildUncachedMe);
        return this.guild.members.me.roles.highest.comparePositionTo(this.roles.highest) > 0;
    };

    get kickable() {
        if (!this.guild.members.me) throw new RigeljsError(ErrorCodes.GuildUncachedMe);
        return this.manageable && this.guild.members.me.permissions.has(PermissionsBitField.Flags.KickMembers);
    };

    get bannable() {
        if (!this.guild.members.me) throw new RigeljsError(ErrorCodes.GuildUncachedMe);
        return this.manageable && this.guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers);
    };

    get moderatable() {
        return (
            !this.permissions.has(PermissionsBitField.Flags.Administrator) &&
            this.manageable &&
            (this.guild.members.me?.permissions.has(PermissionsBitField.Flags.ModerateMembers) ?? false)
        );
    };
};

export default GuildMember;