import CachedManager from "./CachedManager.js";
import Bot from "../structures/Bot.js";

class BotManager extends CachedManager {
    constructor(client, iterable) {
        super(client, Bot, iterable);
    };

    async fetch(id, options = {}) {
        if (id) {
            const existing = this.cache.get(id);
            if (existing && !options.force) return existing;

            const data = await this.client.rest.getBot(id);
            return this._add(data, options.cache ?? true);
        }

        const data = await this.client.rest.getBots();
        return data.map(botData => this._add(botData, options.cache ?? true));
    };

    async create(username) {
        const data = await this.client.rest.createBot(username);
        return this._add(data);
    };

    async update(id, options = {}) {
        const data = await this.client.rest.updateBot(id, options);
        return this._add(data);
    };

    async delete(id) {
        await this.client.rest.deleteBot(id);
        this.cache.delete(id);
    };

    async resetToken(id) {
        const data = await this.client.rest.resetBotToken(id);
        return data;
    };

    async addToGuild(botId, guildId) {
        await this.client.rest.addBotToGuild(botId, guildId);
    };
};

export default BotManager;
