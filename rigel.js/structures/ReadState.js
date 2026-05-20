import Base from "./Base.js";

class ReadState extends Base {
    constructor(client, data) {
        super(client);
        this.id = data.id;
        this._patch(data);
    };

    _patch(data) {
        if ("last_message_id" in data) {
            this.lastMessageId = data.last_message_id;
        } else {
            this.lastMessageId ??= null;
        };

        if ("last_pin_timestamp" in data) {
            this.lastPinTimestamp = new Date(data.last_pin_timestamp).getTime();
        } else {
            this.lastPinTimestamp ??= null;
        };

        if ("mention_count" in data) {
            this.mentionCount = data.mention_count;
        } else {
            this.mentionCount ??= 0;
        };

        return data;
    };

    get channel() {
        return this.client.channels.cache.get(this.id) ?? null;
    };

    get hasUnread() {
        const channel = this.channel;
        if (!channel || !channel.viewable) return false;
        if (!this.lastMessageId) return false;
        return channel.lastMessageId !== this.lastMessageId;
    };

    get hasMentions() {
        return this.mentionCount > 0;
    };
};

export default ReadState;
