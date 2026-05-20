import Base from "./Base.js";
import PermissionsBitField from "../utils/PermissionsBitField.js";

class Role extends Base {
    constructor(client, data, guild) {
        super(client);
        this.guild = guild;
        this.icon = null;
        this.unicodeEmoji = null;
        if (data) this._patch(data);
    };

    _patch(data) {
        this.id = data.id;

        if ("name" in data) {
            this.name = data.name;
        };

        if ("color" in data) {
            this.color = data.color;
        };

        if ("hoist" in data) {
            this.hoist = data.hoist;
        };

        if ("position" in data) {
            this.rawPosition = data.position;
        };

        if ("permissions" in data) {
            this.permissions = new PermissionsBitField(BigInt(data.permissions)).freeze();
        };

        if ("mentionable" in data) {
            this.mentionable = data.mentionable;
        };

        if ("icon" in data) {
            this.icon = data.icon;
        };

        if ("unicode_emoji" in data) {
            this.unicodeEmoji = data.unicode_emoji;
        };

        this.tags = data.tags ? {} : null;
        if (data.tags) {
            if ("bot_id" in data.tags) this.tags.botId = data.tags.bot_id;
        };
    };

    get hexColor() {
        return `#${this.color.toString(16).padStart(6, "0")}`;
    };

    get position() {
        return this.guild.roles.cache.reduce((acc, role) => acc +(this.rawPosition === role.rawPosition ? BigInt(this.id) < BigInt(role.id) : this.rawPosition > role.rawPosition), 0);
    };

    iconURL(options = {}) {
        return this.icon && this.client.cdn.roleIcon(this.id, this.icon, options);
    };

    comparePositionTo(role) {
        return this.guild.roles.comparePositions(this, role);
    };

    toString() {
        if (this.id === this.guild.id) return "@everyone";
        return `<@&${this.id}>`;
    };
};

export default Role;