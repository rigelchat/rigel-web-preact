import { DiscordSnowflake } from "@sapphire/snowflake";
import Base from "./Base.js";

class Bot extends Base {
    constructor(client, data) {
        super(client);
        this.id = data.id;
        this._patch(data);
    };

    _patch(data) {
        if ("username" in data) {
            this.username = data.username;
        } else {
            this.username ??= null;
        };

        if ("discriminator" in data) {
            this.discriminator = data.discriminator;
        } else {
            this.discriminator ??= null;
        };

        if ("avatar" in data) {
            this.avatar = data.avatar;
        } else {
            this.avatar ??= null;
        };

        if ("bio" in data) {
            this.bio = data.bio;
        } else {
            this.bio ??= null;
        };

        if ("public" in data) {
            this.public = Boolean(data.public);
        } else {
            this.public ??= false;
        };

        if ("bot" in data) {
            this.bot = Boolean(data.bot);
        } else {
            this.bot ??= true;
        };

        if ("created_at" in data) {
            this.createdAt = new Date(data.created_at);
        } else {
            this.createdAt ??= null;
        };

        if ("flags" in data) {
            this.flags = data.flags;
        } else {
            this.flags ??= 0;
        };

        if ("owner" in data) {
            this.owner = data.owner;
        } else {
            this.owner ??= null;
        };
    };

    get createdTimestamp() {
        return DiscordSnowflake.timestampFrom(this.id);
    };

    get createdDate() {
        return new Date(this.createdTimestamp);
    };

    avatarURL({ size = 128, format = "webp" } = {}) {
        if (!this.avatar) return null;
        return `https://cdn.discordapp.com/avatars/${this.id}/${this.avatar}.${format}?size=${size}`;
    };

    get defaultAvatarURL() {
        return `https://cdn.discordapp.com/embed/avatars/${parseInt(this.discriminator) % 5}.png`;
    };

    displayAvatarURL(options) {
        return this.avatarURL(options) ?? this.defaultAvatarURL;
    };

    toString() {
        return `<@${this.id}>`;
    };
};

export default Bot;
