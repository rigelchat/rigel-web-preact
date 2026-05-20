import CachedManager from "./CachedManager.js";
import ReadState from "../structures/ReadState.js";

class ReadStateManager extends CachedManager {
    constructor(client, iterable) {
        super(client, ReadState, iterable);
    };

    get(channelId) {
        return this.cache.get(channelId) ?? null;
    };

    getUnread() {
        return this.cache.filter((readState) => {
            if (!readState.hasUnread) return false;
            const channel = readState.channel;
            return channel && channel.viewable;
        });
    };

    getMentioned() {
        return this.cache.filter((readState) => {
            if (!readState.hasMentions) return false;
            const channel = readState.channel;
            return channel && channel.viewable;
        });
    };

    getTotalMentions() {
        return this.cache.reduce((total, readState) => {
            const channel = readState.channel;
            if (!channel || !channel.viewable) return total;
            return total + readState.mentionCount;
        }, 0);
    };
};

export default ReadStateManager;
