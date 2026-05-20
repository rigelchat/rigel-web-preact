import CachedManager from "./CachedManager.js";
import Session from "../structures/Session.js";

class SessionManager extends CachedManager {
    constructor(client, iterable) {
        super(client, Session, iterable);
        this.currentSessionIdHash = null;
    };

    get current() {
        if (!this.currentSessionIdHash) return null;
        return this.cache.get(this.currentSessionIdHash) || null;
    };

    async fetch() {
        const newSessions = await this.client.rest.getSessions();
        this.cache.clear();
        for (const session of newSessions) {
            this._add(session, true, { id: session.id_hash });
        };
        return this.cache;
    };

    async logoutAllOther() {
        const otherSessionIds = this.cache.filter((session) => session.id !== this.currentSessionIdHash).map((session) => session.id);
        await this.client.rest.logoutSessions(otherSessionIds);
        for (const id of otherSessionIds) {
            this.cache.delete(id);
        };
        return this.cache;
    };
};

export default SessionManager;