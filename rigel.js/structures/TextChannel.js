import GuildChannel from "./GuildChannel.js";
import MessageManager from "../managers/MessageManager.js";

class TextChannel extends GuildChannel {
    constructor (guild, data, client) {
        super(guild, data, client);

        this.messages = new MessageManager(this);

        this.nsfw = Boolean(data.nsfw);

        this._patch(data);
    };

    _patch(data) {
        super._patch(data);

        if ("topic" in data) {
            this.topic = data.topic;
        };

        if ("nsfw" in data) {
            this.nsfw = Boolean(data.nsfw);
        };

        if ("last_message_id" in data) {
            this.lastMessageId = data.last_message_id;
        };

        if ("last_pin_timestamp" in data) {
            this.lastPinTimestamp = data.last_pin_timestamp ? new Date(data.last_pin_timestamp).getTime() : null;
        };

        if ("messages" in data) {
            for (const message of data.messages) this.messages._add(message);
        };
    };

    async send(options) {
        const message = await this.client.rest.createMessage(this.id, options);
        return this.messages.cache.get(message.id) ?? this.messages._add(message);
    };
};

export default TextChannel;