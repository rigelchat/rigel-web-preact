import { Collection } from "@discordjs/collection";
import CachedManager from "./CachedManager.js";
import Message from "../structures/Message.js";
import { RigeljsTypeError, ErrorCodes } from "../errors.js";

class MessageManager extends CachedManager {
    constructor(channel, iterable) {
        super(channel.client, Message, iterable);
        this.channel = channel;
    };

    fetch(options = {}) {
        if (!options) return this._fetchMany();
        const { message, cache, force } = options;
        const resolvedMessage = this.resolveId(message ?? options);
        if (resolvedMessage) return this._fetchSingle({ message: resolvedMessage, cache, force });
        return this._fetchMany(options);
    };

    async _fetchSingle({ message, cache, force = false }) {
        if (!force) {
            const existing = this.cache.get(message);
            if (existing && !existing.partial) return existing;
        };

        const data = await this.client.rest.getMessage(this.channel.id, message.id);
        return this._add(data, cache);
    };

    async _fetchMany(options = {}) {
        const data = await this.client.rest.getMessages(this.channel.id, options);
        return data.reduce((_data, message) => _data.set(message.id, this._add(message, options.cache)), new Collection());
    };

    async edit(message, options) {
        const messageId = this.resolveId(message);
        if (!messageId) throw new RigeljsTypeError(ErrorCodes.InvalidType, 'message', 'MessageResolvable');

        const { body, files } = await (
            options instanceof MessagePayload
                ? options
                : MessagePayload.create(message instanceof Message ? message : this, options)
            )
            .resolveBody()
            .resolveFiles();
        const d = await this.client.rest.patch(Routes.channelMessage(this.channel.id, messageId), { body, files });

        const existing = this.cache.get(messageId);
        if (existing) {
            const clone = existing._clone();
            clone._patch(d);
            return clone;
        };
        return this._add(d);
    };

    async delete(message) {
        message = this.resolveId(message);
        if (!message) throw new DiscordjsTypeError(ErrorCodes.InvalidType, 'message', 'MessageResolvable');

        await this.client.rest.deleteMessage(this.channel.id, message);
    };
};

export default MessageManager;