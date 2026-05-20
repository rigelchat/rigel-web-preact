import Base from "./Base.js";
import { Snowflake } from "@sapphire/snowflake";
import { ChannelType, PermissionFlagsBits } from "../Constants.js";
import { getSortableGroupTypes } from "../utils/Utils.js";
import PermissionOverwriteManager from "../managers/PermissionOverwriteManager.js";
import PermissionsBitField from "../utils/PermissionsBitField.js";
import { channelLink } from "../utils/Formatters.js";

const ThreadChannelTypes = [ChannelType.AnnouncementThread, ChannelType.PublicThread, ChannelType.PrivateThread];

class GuildChannel extends Base {
    constructor(guild, data, client) {
        super(client);
        this.guild = guild;
        this.id = data.id;
        this.guildId = guild?.id ?? data.guild_id;
        this.type = data.type;
        this.permissionOverwrites = new PermissionOverwriteManager(this);
    
        this._patch(data);
    };

    _patch(data) {
        if ("name" in data) {
            this.name = data.name;
        };

        if ("position" in data) {
            this.rawPosition = data.position;
        };

        if ("parent_id" in data) {
            this.parentId = data.parent_id
        } else {
            this.parentId ??= null;
        };

        if ("permission_overwrites" in data) {
            this.permissionOverwrites.cache.clear();
            for (const overwrite of data.permission_overwrites) {
                this.permissionOverwrites._add(overwrite);
            };
        };
    };

    _clone() {
        const clone = super._clone();
        clone.permissionOverwrites = new PermissionOverwriteManager(clone, this.permissionOverwrites.cache.values());
        return clone;
    };

    get position() {
        const selfIsCategory = this.type === ChannelType.GuildCategory;
        const types = getSortableGroupTypes(this.type);

        let count = 0;
        for (const channel of this.guild.channels.cache.values()) {
            if (!types.includes(channel.type)) continue;
            if (!selfIsCategory && channel.parentId !== this.parentId) continue;
            if (this.rawPosition === channel.rawPosition) {
                if (Snowflake.compare(channel.id, this.id) === -1) count++;
            } else if (this.rawPosition > channel.rawPosition) {
                count++;
            };
        };

        return count;
    };

    isThread() {
        return ThreadChannelTypes.includes(this.type);
    };

    isTextBased() {
        return "messages" in this;
    };

    isVoiceBased() {
        return "bitrate" in this;
    };

    isSendable() {
        return "send" in this;
    };

    get url() {
        return channelLink(this.client, this.guildId, this.id);
    };

    permissionsFor(memberOrRole, checkAdmin = true) {
        const member = this.guild.members.resolve(memberOrRole);
        if (member) return this.memberPermissions(member, checkAdmin);
        const role = this.guild.roles.resolve(memberOrRole);
        return role && this.rolePermissions(role, checkAdmin);
    };

    overwritesFor(member, verified = false, roles = null) {
        if (!verified) member = this.guild.members.resolve(member);
        if (!member) return [];

        roles ??= member.roles.cache;
        const roleOverwrites = [];
        let memberOverwrites;
        let everyoneOverwrites;

        for (const overwrite of this.permissionOverwrites.cache.values()) {
            if (overwrite.id === this.guild.id) {
                everyoneOverwrites = overwrite;
            } else if (roles.has(overwrite.id)) {
                roleOverwrites.push(overwrite);
            } else if (overwrite.id === member.id) {
                memberOverwrites = overwrite;
            };
        };

        return {
            everyone: everyoneOverwrites,
            roles: roleOverwrites,
            member: memberOverwrites
        };
    };

    memberPermissions(member, checkAdmin) {
        if (checkAdmin && member.id === this.guild.ownerId) {
            return new PermissionsBitField(PermissionsBitField.All).freeze();
        };

        const roles = member.roles.cache;
        const permissions = new PermissionsBitField(roles.map((role) => role.permissions));

        if (checkAdmin && permissions.has(PermissionFlagsBits.Administrator)) {
            return new PermissionsBitField(PermissionsBitField.All).freeze();
        };

        const overwrites = this.overwritesFor(member, true, roles);

        return permissions
            .remove(overwrites.everyone?.deny ?? PermissionsBitField.DefaultBit)
            .add(overwrites.everyone?.allow ?? PermissionsBitField.DefaultBit)
            .remove(overwrites.roles.length > 0 ? overwrites.roles.map((role) => role.deny) : PermissionsBitField.DefaultBit)
            .add(overwrites.roles.length > 0 ? overwrites.roles.map((role) => role.allow) : PermissionsBitField.DefaultBit)
            .remove(overwrites.member?.deny ?? PermissionsBitField.DefaultBit)
            .add(overwrites.member?.allow ?? PermissionsBitField.DefaultBit)
            .freeze();
    };

    rolePermissions(role, checkAdmin) {
        if (checkAdmin && role.permissions.has(PermissionFlagsBits.Administrator)) {
            return new PermissionsBitField(PermissionsBitField.All).freeze();
        };

        const everyoneOverwrites = this.permissionOverwrites.cache.get(this.guild.id);
        const roleOverwrites = this.permissionOverwrites.cache.get(role.id);

        return role.permissions
            .remove(everyoneOverwrites?.deny ?? PermissionsBitField.DefaultBit)
            .add(everyoneOverwrites?.allow ?? PermissionsBitField.DefaultBit)
            .remove(roleOverwrites?.deny ?? PermissionsBitField.DefaultBit)
            .add(roleOverwrites?.allow ?? PermissionsBitField.DefaultBit)
            .freeze();
    };

    get members() {
        return this.guild.members.cache.filter((member) => this.permissionsFor(member).has(PermissionFlagsBits.ViewChannel, false));
    };

    get deletable() {
        return this.manageable && this.guild.rulesChannelId !== this.id && this.guild.publicUpdatesChannelId !== this.id;
    };

    get manageable() {
        if (this.client.user.id === this.guild.ownerId) return true;
        const permissions = this.permissionsFor(this.client.user);
        if (!permissions) return false;

        if (permissions.has(PermissionFlagsBits.Administrator, false)) return true;
        if (this.guild.members.me.communicationDisabledUntilTimestamp > Date.now()) return false;

        const bitfield = VoiceBasedChannelTypes.includes(this.type)
            ? PermissionFlagsBits.ManageChannels | PermissionFlagsBits.Connect
            : PermissionFlagsBits.ViewChannel | PermissionFlagsBits.ManageChannels;
        return permissions.has(bitfield, false);
    };

    get viewable() {
        if (this.client.user.id === this.guild.ownerId) return true;
        const permissions = this.permissionsFor(this.client.user);
        if (!permissions) return false;
        return permissions.has(PermissionFlagsBits.ViewChannel, false);
    };

    get readState() {
        return this.client.readStates.get(this.id);
    };
};

export default GuildChannel;