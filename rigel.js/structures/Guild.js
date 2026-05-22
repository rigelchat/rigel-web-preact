import Base from "./Base.js";
import GuildMemberManager from "../managers/GuildMemberManager.js";
import GuildChannelManager from "../managers/GuildChannelManager.js";
import RoleManager from "../managers/RoleManager.js";
import PresenceManager from "../managers/PresenceManager.js";

class Guild extends Base {
    constructor(client, data) {
        super(client);
        this.id = data.id;
        this.name = data.name;
        this.icon = data.icon;

        this.channels = new GuildChannelManager(this);
        this.roles = new RoleManager(this);
        this.members = new GuildMemberManager(this);
        this.presences = new PresenceManager(this);

        if (!data) return;
        if (data.unavailable) {
            this.available = false;
        } else {
            this._patch(data);
            if (!data.channels) this.available = false;
        };
    };

    _patch(data) {
        const props = data.properties || data;

        if ("features" in props) {
            this.features = props.features;
        };

        if ("name" in props) {
            this.name = props.name;
        };

        if ("unavailable" in data) {
            this.available = !data.unavailable;
        } else {
            this.available ??= true;
        };

        if ("icon" in props) {
            this.icon = props.icon;
        };

        if ("banner" in props) {
            this.banner = props.banner;
        };

        if ("description" in props) {
            this.description = props.description;
        };

        if ("vanity_url_code" in props) {
            this.vanityURLCode = props.vanity_url_code;
        };

        if ("rules_channel_id" in props) {
            this.rulesChannelId = props.rules_channel_id;
        };

        if ("owner_id" in props) {
            this.ownerId = props.owner_id;
        };

        if (data.channels) {
            this.channels.cache.clear();
            for (const rawChannel of data.channels) {
                this.client.channels._add(rawChannel, this);
            };
        };

        if (data.roles) {
            this.roles.cache.clear();
            for (const rawChannel of data.roles) {
                this.roles._add(rawChannel);
            };
        };

        if (data.members) {
            this.members.cache.clear();
            for (const rawMember of data.members) {
                this.members._add(rawMember);
            };
        };

        if (data.presences) {
            for (const presence of data.presences) {
                this.presences._add(Object.assign(presence, { guild: this }));
            };
        };
    };

    get nameAcronym() {
        return this.name
            .replace(/'s /g, " ")
            .replace(/\w+/g, (e) => e[0])
            .replace(/\s/g, "");
    };

    async leave() {
        await this.client.rest.leaveGuild(this.id);
    };

    async delete() {
        await this.client.rest.deleteGuild(this.id);
    };

    iconURL(options = {}) {
        return this.icon && this.client.cdn.icon(this.id, this.icon, options);
    };

    bannerURL(options = {}) {
        return this.banner && this.client.cdn.banner(this.id, this.banner, options);
    };

    get readStates() {
        return this.client.readStates.cache.filter((readState) => this.channels.cache.has(readState.id));
    };

    get hasUnread() {
        return this.channels.cache.some((channel) => channel?.hasUnread);
    };

    get mentionCount() {
        return this.channels.cache.reduce((total, channel) => total + (channel.readState?.mentionCount ?? 0), 0);
    };

    get unreadChannels() {
        return this.channels.cache.filter((channel) => channel?.hasUnread);
    };

    get mentionedChannels() {
        return this.channels.cache.filter((channel) => channel?.hasMentions);
    };
};

export default Guild;