import axios from "axios";
import { filetypeinfo } from "magic-bytes.js";
import MessagePayload from "../structures/MessagePayload.js";
import * as Endpoints from "./Endpoints.js";
import { resolveImage } from "../utils/DataResolver.js";
import SystemChannelFlagsBitField from "../utils/SystemChannelFlagsBitField.js";

class REST {
    constructor(client) {
        this.client = client;
    };

    get token() {
        return this.client.user.bot ? `Bot ${this.client.token}` : this.client.token;
    };

    get apiUrl() {
        return `${this.client.options.rest.api}/v${this.client.options.rest.version}`;
    };

    async request(url, req) {

    };

    async getGateway() {
        const { data } = await axios(this.apiUrl + Endpoints.GATEWAY, {
            method: "GET"
        });

        return data.url;
    };

    async updateUserSettings({
        status,
        locale,
        theme,
        backgroundGradientPreset,
        developerMode
    }) {
        if (theme && !backgroundGradientPreset) backgroundGradientPreset = null;

        const { data } = await axios(this.apiUrl + Endpoints.USER_SETTINGS, {
            method: "PATCH",
            headers: { "Authorization": this.token },
            data: {
                status,
                locale,
                theme,
                background_gradient_preset: backgroundGradientPreset,
                developer_mode: developerMode
            }
        });

        return data;
    };

    async updateUser({
        username,
        globalName,
        avatar,
        banner,
    }) {
        const { data } = await axios(this.apiUrl + Endpoints.USER_ME, {
            method: "PATCH",
            headers: { "Authorization": this.token },
            data: {
                username,
                global_name: globalName,
                avatar: avatar && resolveImage(avatar),
                banner: banner && resolveImage(banner),
            }
        });

        return data;
    };

    async updateUserProfile({
        bio,
        pronouns,
        accentColor,
        themeColors
    }) {
        const { data } = await axios(this.apiUrl + Endpoints.USER_PROFILE("@me"), {
            method: "PATCH",
            headers: { "Authorization": this.token },
            data: {
                bio,
                pronouns,
                accent_color: accentColor,
                theme_colors: themeColors
            }
        });

        return data;
    };

    async getSessions() {
        const { data } = await axios(this.apiUrl + Endpoints.SESSIONS, {
            method: "GET",
            headers: { "Authorization": this.token }
        });

        return data.user_sessions;
    };

    async logoutSessions(sessionIdHashes) {
        await axios(this.apiUrl + Endpoints.SESSIONS_LOGOUT, {
            method: "POST",
            headers: { "Authorization": this.token },
            data: { session_id_hashes: sessionIdHashes }
        });
    };

    async logout() {
        await axios(this.apiUrl + Endpoints.LOGOUT, {
            method: "POST",
            headers: { "Authorization": this.token }
        });
    };

    async getDiscoverableGuilds() {
        const { data } = await axios(this.apiUrl + Endpoints.DISCOVERABLE_GUILDS, {
            method: "GET",
            headers: { "Authorization": this.token }
        });
        return data.guilds;
    };

    async createGuild({
        name,
        icon = null,
        verificationLevel,
        defaultMessageNotifications,
        explicitContentFilter,
        afkChannelId,
        afkTimeout,
        systemChannelId,
        systemChannelFlags
    }) {
        if (systemChannelFlags) systemChannelFlags = SystemChannelFlagsBitField.resolve(systemChannelFlags);

        const { data } = await axios(this.apiUrl + Endpoints.GUILDS, {
            method: "POST",
            headers: { "Authorization": this.token },
            data: {
                name,
                icon: icon && resolveImage(icon),
                verification_level: verificationLevel,
                default_message_notifications: defaultMessageNotifications,
                explicit_content_filter: explicitContentFilter,
                afk_channel_id: afkChannelId,
                afk_timeout: afkTimeout,
                system_channel_id: systemChannelId,
                system_channel_flags: systemChannelFlags
            }
        });

        return data;
    };

    async deleteGuild(guildId) {
        await axios(this.apiUrl + Endpoints.GUILD_DELETE(guildId), {
            method: "POST",
            headers: { "Authorization": this.token }
        });
    };

    async acceptInvite(inviteCode) {
        const { data } = await axios(this.apiUrl + Endpoints.INVITE(inviteCode), {
            method: "POST",
            headers: { "Authorization": this.token },
            data: { session_id: this.client.ws.sessionId }
        });

        return data;
    };

    async leaveGuild(guildId) {
        await axios(this.apiUrl + Endpoints.USER_GUILD(guildId), {
            method: "DELETE",
            headers: { "Authorization": this.token }
        });
    };

    async createMessage(channeLId, options) {
        let messagePayload;

        if (options instanceof MessagePayload) {
            messagePayload = options.resolveBody();
        } else {
            messagePayload = MessagePayload.create(this, options).resolveBody();
        };

        const { body, files } = await messagePayload.resolveFiles();
        const { data } = await axios(this.apiUrl + Endpoints.MESSAGES_CHANNEL(channeLId), {
            method: "POST",
            headers: { "Authorization": this.token },
            data: body
        });

        return data;
    };

    async getMessages(channeLId, options = {}) {
        const limit = options.limit ?? 50;
        const before = options.before ?? null;
        const around = options.around ?? null;
        const after = options.after ?? null;

        const { data } = await axios(this.apiUrl + Endpoints.MESSAGES_CHANNEL(channeLId), {
            method: "GET",
            params: { limit, before, around, after },
            headers: { "Authorization": this.token }
        });

        return data;
    };

    async deleteMessage(channelId, messageId) {
        await axios(this.apiUrl + Endpoints.MESSAGE_CHANNEL(channelId, messageId), {
            method: "DELETE",
            headers: { "Authorization": this.token }
        });
    };

    async getUserProfile(userId, options = {}) {
        const with_mutual_guilds = options.withMutualGuilds ?? null;
        const with_mutual_friends = options.withMutualFriends ?? null;

        const { data } = await axios(this.apiUrl + Endpoints.USER_PROFILE(userId), {
            method: "GET",
            params: { with_mutual_guilds, with_mutual_friends },
            headers: { "Authorization": this.token }
        });

        return data;
    };

    async getBots() {
        const { data } = await axios(this.apiUrl + Endpoints.BOTS, {
            method: "GET",
            headers: { "Authorization": this.token }
        });

        return data;
    };

    async getBot(botId) {
        const { data } = await axios(this.apiUrl + Endpoints.BOT(botId), {
            method: "GET",
            headers: { "Authorization": this.token }
        });

        return data;
    };

    async createBot(username) {
        const { data } = await axios(this.apiUrl + Endpoints.BOTS, {
            method: "POST",
            headers: { "Authorization": this.token },
            data: { username }
        });

        return data;
    };

    async updateBot(botId, { username, avatar, bio }) {
        const { data } = await axios(this.apiUrl + Endpoints.BOT(botId), {
            method: "PATCH",
            headers: { "Authorization": this.token },
            data: { username, avatar, bio }
        });

        return data;
    };

    async resetBotToken(botId) {
        const { data } = await axios(this.apiUrl + Endpoints.BOT_RESET(botId), {
            method: "POST",
            headers: { "Authorization": this.token }
        });

        return data;
    };

    async deleteBot(botId) {
        await axios(this.apiUrl + Endpoints.BOT(botId), {
            method: "DELETE",
            headers: { "Authorization": this.token }
        });
    };

    async addBotToGuild(botId, guildId) {
        await axios(this.apiUrl + Endpoints.BOT_GUILD(botId, guildId), {
            method: "PUT",
            headers: { "Authorization": this.token }
        });
    };
};

export default REST;