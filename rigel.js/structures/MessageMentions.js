import { Collection } from "@discordjs/collection";
import { flatten } from "../utils/Utils.js";
import FormattingPatterns from "../utils/FormattingPatterns.js";

class MessageMentions {
    static EveryonePattern = /@(?<mention>everyone|here)/;
    static UsersPattern = FormattingPatterns.UserWithOptionalNickname;
    static RolesPattern = FormattingPatterns.Role;
    static ChannelsPattern = FormattingPatterns.Channel;
    static GlobalChannelsPattern = new RegExp(this.ChannelsPattern.source, "g");
    static GlobalUsersPattern = new RegExp(this.UsersPattern.source, "g");

    constructor(message, users, roles, everyone, crosspostedChannels, repliedUser) {
        Object.defineProperty(this, "client", { value: message.client });
        Object.defineProperty(this, "guild", { value: message.guild });
        Object.defineProperty(this, "_content", { value: message.content });

        this.everyone = Boolean(everyone);

        if (users) {
            if (users instanceof Collection) {
                this.users = new Collection(users);
            } else if (Array.isArray(users)) {
                this.users = new Collection();
                for (const mention of users) {
                    if (mention.member && message.guild) {
                        message.guild.members._add(Object.assign(mention.member, { user: mention }));
                    };
                    const user = message.client.users._add(mention);
                    this.users.set(user.id, user);
                };
            } else {
                // Si users n'est ni une Collection ni un Array, on crée une Collection vide
                this.users = new Collection();
            }
        } else {
            this.users = new Collection();
        };

        if (roles instanceof Collection) {
            this.roles = new Collection(roles);
        } else if (Array.isArray(roles)) {
            this.roles = new Collection();
            const guild = message.guild;
            if (guild) {
                for (const mention of roles) {
                    const role = guild.roles.cache.get(mention);
                    if (role) this.roles.set(role.id, role);
                };
            };
        } else if (roles) {
            // Si roles n'est ni une Collection ni un Array, on crée une Collection vide
            this.roles = new Collection();
        } else {
            this.roles = new Collection();
        };

        this._members = null;

        this._channels = null;

        this._parsedUsers = null;

        if (crosspostedChannels) {
            if (crosspostedChannels instanceof Collection) {
                this.crosspostedChannels = new Collection(crosspostedChannels);
            } else if (Array.isArray(crosspostedChannels)) {
                this.crosspostedChannels = new Collection();
                for (const crosspostedChannel of crosspostedChannels) {
                    this.crosspostedChannels.set(crosspostedChannel.id, {
                        channelId: crosspostedChannel.id,
                        guildId: crosspostedChannel.guild_id,
                        type: crosspostedChannel.type,
                        name: crosspostedChannel.name,
                    });
                };
            } else {
                this.crosspostedChannels = new Collection();
            }
        } else {
            this.crosspostedChannels = new Collection();
        };

        this.repliedUser = repliedUser ? this.client.users._add(repliedUser) : null;
    };

    get members() {
        if (this._members) return this._members;
        if (!this.guild) return null;
        this._members = new Collection();
        this.users.forEach(user => {
            const member = this.guild.members.resolve(user);
            if (member) this._members.set(member.user.id, member);
        });
        return this._members;
    };

    get channels() {
        if (this._channels) return this._channels;
        this._channels = new Collection();
        let matches;

        while ((matches = this.constructor.GlobalChannelsPattern.exec(this._content)) !== null) {
            const channel = this.client.channels.cache.get(matches.groups.id);
            if (channel) this._channels.set(channel.id, channel);
        };

        return this._channels;
    };

    get parsedUsers() {
        if (this._parsedUsers) return this._parsedUsers;
        this._parsedUsers = new Collection();
        let matches;
        while ((matches = this.constructor.GlobalUsersPattern.exec(this._content)) !== null) {
            const user = this.client.users.cache.get(matches[1]);
            if (user) this._parsedUsers.set(user.id, user);
        }
        return this._parsedUsers;
    };

    has(data, { ignoreDirect = false, ignoreRoles = false, ignoreRepliedUser = false, ignoreEveryone = false } = {}) {
        const user = this.client.users.resolve(data);

        if (!ignoreEveryone && user && this.everyone) return true;

        const userWasRepliedTo = user && this.repliedUser?.id === user.id;

        if (!ignoreRepliedUser && userWasRepliedTo && this.users.has(user.id)) return true;

        if (!ignoreDirect) {
            if (user && (!ignoreRepliedUser || this.parsedUsers.has(user.id)) && this.users.has(user.id)) return true;

            const role = this.guild?.roles.resolve(data);
            if (role && this.roles.has(role.id)) return true;

            const channel = this.client.channels.resolve(data);
            if (channel && this.channels.has(channel.id)) return true;
        };

        if (!ignoreRoles) {
            const member = this.guild?.members.resolve(data);
            if (member) {
                for (const mentionedRole of this.roles.values()) if (member.roles.cache.has(mentionedRole.id)) return true;
            };
        };

        return false;
    };

    toJSON() {
        return flatten(this, {
            members: true,
            channels: true
        });
    };
};

export default MessageMentions;