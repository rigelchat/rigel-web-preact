import { EventEmitter } from "events";
import REST from "./api/REST.js";
import CDN from "./api/CDN.js";
import UserManager from "./managers/UserManager.js";
import GuildManager from "./managers/GuildManager.js";
import ChannelManager from "./managers/ChannelManager.js";
import ReadStateManager from "./managers/ReadStateManager.js";
import ClientSettingManager from "./managers/ClientSettingManager.js";
import SessionManager from "./managers/SessionManager.js";
import BotManager from "./managers/BotManager.js";
import ClientPresence from "./structures/ClientPresence.js";
import WebSocketShard from "./websocket/WebSocketShard.js";
import { WebSocketShardStatus } from "./Constants.js";

class Client extends EventEmitter {
    /**
     * @param {Object} [options] - The options for the client.
     * @param {boolean} [options.debug=false] - Whether to enable debug mode.
     * @param {boolean} [options.compress=false] - Whether to enable compression.
     * @param {number} [options.capabilities=0] - The client capabilities bitfield.
     * @param {Object} [options.rest] - REST API options.
     * @param {string} [options.rest.base="https://discord.com"] - The base URL for Discord.
     * @param {string} [options.rest.api="https://discord.com/api"] - The API base URL.
     * @param {string} [options.rest.cdn="https://cdn.discordapp.com"] - The CDN base URL.
     * @param {number} [options.rest.version=9] - The REST API version.
     * @param {Object} [options.ws] - WebSocket options.
     * @param {number} [options.ws.version=9] - The WebSocket gateway version.
     */
    constructor(options) {
        super();

        this.options = {
            debug: false,
            compress: false,
            capabilities: 0,
            ...options,
            rest: {
                base: "https://discord.com",
                api: "https://discord.com/api",
                cdn: "https://cdn.discordapp.com",
                version: 9,
                ...options?.rest
            },
            ws: {
                version: 9,
                ...options?.ws
            }
        };

        this.ws = null;
        this.rest = new REST(this);
        this.cdn = new CDN(this);

        this.users = new UserManager(this);
        this.guilds = new GuildManager(this);
        this.channels = new ChannelManager(this);
        this.readStates = new ReadStateManager(this);
        this.settings = new ClientSettingManager(this);
        this.sessions = new SessionManager(this);
        this.bots = new BotManager(this);

        this.presence = new ClientPresence(this);

        this.user = null;
        this.token = null
        this.readyTimestamp = null;
    };

    get isReady() {
        return this.ws.status === WebSocketShardStatus.Ready;
    };

    get readyAt() {
        return this.readyTimestamp && new Date(this.readyTimestamp);
    };

    get uptime() {
        return this.readyTimestamp && Date.now() - this.readyTimestamp;
    };

    login(token) {
        if (this.ws) this.destroy();
        this.token = token.replace(/^(Bot|Bearer)\s*/i, "");
        this.ws = new WebSocketShard(this);
        this.ws.connect();
    };

    destroy() {
        if (this.ws) {
            this.ws.disconnect(false);
            this.ws = null;
        };
        this.user = null;
        this.readyTimestamp = null;
        this.users.cache.clear();
        this.users.profiles.clear();
        this.guilds.cache.clear();
        this.channels.cache.clear();
        this.readStates.cache.clear();
    };

    async logout() {
        await this.rest.logout();
        this.destroy();
    };

    incrementMaxListeners() {
        const maxListeners = this.getMaxListeners();
        if (maxListeners !== 0) {
            this.setMaxListeners(maxListeners + 1);
        };
    };

    decrementMaxListeners() {
        const maxListeners = this.getMaxListeners();
        if (maxListeners !== 0) {
            this.setMaxListeners(maxListeners - 1);
        };
    };
};

export default Client;