import { DiscordSnowflake } from "@sapphire/snowflake";
import Base from "./Base.js";

class DiscoveryGuild extends Base {
    constructor(client, data) {
        super(client);
        this.id = data.id;
        this._patch(data);
    };

    _patch(data) {
        if ("name" in data) {
            this.name = data.name;
        } else {
            this.name ??= null;
        };

        if ("icon" in data) {
            this.icon = data.icon;
        } else {
            this.icon ??= null;
        };

        if ("description" in data) {
            this.description = data.description;
        } else {
            this.description ??= null;
        };

        if ("splash" in data) {
            this.splash = data.splash;
        } else {
            this.splash ??= null;
        };

        if ("banner" in data) {
            this.banner = data.banner;
        } else {
            this.banner ??= null;
        };

        if ("features" in data) {
            this.features = data.features;
        } else {
            this.features ??= [];
        };

        if ("approximate_member_count" in data) {
            this.approximateMemberCount = data.approximate_member_count;
        } else {
            this.approximateMemberCount ??= null;
        };

        if ("approximate_presence_count" in data) {
            this.approximatePresenceCount = data.approximate_presence_count;
        } else {
            this.approximatePresenceCount ??= null;
        };

        if ("emojis" in data) {
            this.emojis = data.emojis;
        } else {
            this.emojis ??= [];
        };

        if ("discovery_splash" in data) {
            this.discoverySplash = data.discovery_splash;
        } else {
            this.discoverySplash ??= null;
        };

        if ("vanity_url_code" in data) {
            this.vanityURLCode = data.vanity_url_code;
        } else {
            this.vanityURLCode ??= null;
        };

        if ("categories" in data) {
            this.categories = data.categories;
        } else {
            this.categories ??= [];
        };

        if ("keywords" in data) {
            this.keywords = data.keywords;
        } else {
            this.keywords ??= [];
        };

        if ("premium_subscription_count" in data) {
            this.premiumSubscriptionCount = data.premium_subscription_count;
        } else {
            this.premiumSubscriptionCount ??= null;
        };

        if ("nsfw" in data) {
            this.nsfw = Boolean(data.nsfw);
        } else {
            this.nsfw ??= false;
        };

        if ("nsfw_level" in data) {
            this.nsfwLevel = data.nsfw_level;
        } else {
            this.nsfwLevel ??= 0;
        };
    };

    get createdTimestamp() {
        return DiscordSnowflake.timestampFrom(this.id);
    };

    get createdDate() {
        return new Date(this.createdTimestamp);
    };

    iconURL({ size = 128, format = "webp" } = {}) {
        if (!this.icon) return null;
        const extension = this.icon.startsWith("a_") ? "gif" : format;
        return `https://cdn.discordapp.com/icons/${this.id}/${this.icon}.${extension}?size=${size}`;
    };

    splashURL({ size = 2048, format = "webp" } = {}) {
        if (!this.splash) return null;
        return `https://cdn.discordapp.com/splashes/${this.id}/${this.splash}.${format}?size=${size}`;
    };

    bannerURL({ size = 2048, format = "webp" } = {}) {
        if (!this.banner) return null;
        const extension = this.banner.startsWith("a_") ? "gif" : format;
        return `https://cdn.discordapp.com/banners/${this.id}/${this.banner}.${extension}?size=${size}`;
    };

    discoverySplashURL({ size = 2048, format = "webp" } = {}) {
        if (!this.discoverySplash) return null;
        return `https://cdn.discordapp.com/discovery-splashes/${this.id}/${this.discoverySplash}.${format}?size=${size}`;
    };

    get vanityURL() {
        if (!this.vanityURLCode) return null;
        return `https://discord.gg/${this.vanityURLCode}`;
    };

    toString() {
        return this.name;
    };
};

export default DiscoveryGuild;
