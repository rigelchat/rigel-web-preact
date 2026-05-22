import CachedManager from "./CachedManager.js";
import ReadState from "../structures/ReadState.js";

class ReadStateManager extends CachedManager {
    constructor(client, iterable) {
        super(client, ReadState, iterable);
    };

    get(channelId) {
        return this.cache.get(channelId) ?? null;
    };

    get unread() {
        return this.cache.filter((readState) => readState.hasUnread);
    };

    get mentioned() {
        return this.cache.filter((readState) => readState.hasMentions);
    };

    get totalMentions() {
        return this.cache.reduce((total, readState) => total + readState.mentionCount, 0);
    };
};

export default ReadStateManager;