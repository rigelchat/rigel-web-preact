import { DiscordSnowflake } from "@sapphire/snowflake";
import Base from "./Base.js";
import UserFlagsBitField from "../utils/UserFlagsBitField.js";
import UserProfile from "./UserProfile.js";

class User extends Base {
    constructor(client, data) {
        super(client);
        this.id = data.id;
        this.bot = null;
        this.system = null;
        this.flags = null;
        this._patch(data);
    };

    _patch(data) {
        if ("username" in data) {
            this.username = data.username;
        } else {
            this.username ??= null;
        };

        if ("global_name" in data) {
            this.globalName = data.global_name;
        } else {
            this.globalName ??= null;
        };

        if ("bot" in data) {
            this.bot = Boolean(data.bot);
        } else if (!this.partial && typeof this.bot !== "boolean") {
            this.bot = false;
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
        }

        if ("banner" in data) {
            this.banner = data.banner;
        } else if (this.banner !== null) {
            this.banner ??= undefined;
        };

        if ("system" in data) {
            this.system = Boolean(data.system);
        } else if (!this.partial && typeof this.system !== "boolean") {
            this.system = false;
        };

        if ("public_flags" in data) {
            this.flags = new UserFlagsBitField(data.public_flags);
        };

        if ("avatar_decoration" in data) {
            this.avatarDecoration = data.avatar_decoration;
        } else {
            this.avatarDecoration ??= null;
        };

        if (data.avatar_decoration_data) {
            this.avatarDecorationData = {
                asset: data.avatar_decoration_data.asset,
                skuId: data.avatar_decoration_data.sku_id
            };
        } else {
            this.avatarDecorationData = null;
        };
    };

    get partial() {
        return typeof this.username !== "string";
    };

    get createdTimestamp() {
        return DiscordSnowflake.timestampFrom(this.id);
    };

    get createdAt() {
        return new Date(this.createdTimestamp);
    };

    get tag() {
        return typeof this.username === "string" ? this.discriminator === "0" ? this.username : `${this.username}#${this.discriminator}` : null;
    };

    get displayName() {
        return this.globalName ?? this.username;
    };

    get profile() {
        let profile = this.client.users.profiles.get(this.id);
        if (!profile) {
            profile = new UserProfile(this.client, this, {});
            this.client.users.profiles.set(this.id, profile);
        };
        return profile;
    };

    avatarURL(options = {}) {
        return this.avatar && this.client.cdn.avatar(this.id, this.avatar, options);
    };

    avatarDecorationURL(options = {}) {
        if (this.avatarDecorationData) {
            return this.client.cdn.avatarDecoration(this.avatarDecorationData.asset);
        };
        return this.avatarDecoration && this.client.cdn.avatarDecoration(this.id, this.avatarDecoration, options);
    };

    get defaultAvatarURL() {
        const index = (this.discriminator === "0" || this.discriminator === "0000") ? Number(BigInt(this.id) >> 22n) % 6 : this.discriminator % 5;
        return this.client.cdn.defaultAvatar(index);
    };

    displayAvatarURL(options = {}) {
        return this.avatarURL(options) ?? this.defaultAvatarURL;
    };

    bannerURL(options = {}) {
        return this.banner && this.client.cdn.banner(this.id, this.banner, options);
    };
};

export default User;