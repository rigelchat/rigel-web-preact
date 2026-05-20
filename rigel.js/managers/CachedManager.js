import { Collection } from "@discordjs/collection";
import LimitedCollection from "../utils/LimitedCollection.js";

class CachedManager {
    constructor(client, holds, iterable) {
        this.client = client;
        this.holds = holds;

        Object.defineProperty(this, "_cache", {
            value: {
                "MessageManager": new LimitedCollection({ maxSize: 200 })
            }[this.constructor.name] || new Collection()
        });

        if (iterable) {
            for (const item of iterable) {
                this._add(item);
            };
        };
    };

    resolve(idOrInstance) {
        if (idOrInstance instanceof this.holds) return idOrInstance;
        if (typeof idOrInstance === "string") return this.cache.get(idOrInstance) ?? null;
        return null;
    };

    resolveId(idOrInstance) {
        if (idOrInstance instanceof this.holds) return idOrInstance.id;
        if (typeof idOrInstance === "string") return idOrInstance;
        return null;
    };

    get cache() {
        return this._cache;
    };

    _add(data, cache = true, { id, extras = [] } = {}) {
        const existing = this.cache.get(id ?? data.id);
        if (existing) {
            if (cache) {
                existing._patch(data);
                return existing;
            };
            const clone = existing._clone();
            clone._patch(data);
            return clone;
        };

        const entry = this.holds ? new this.holds(this.client, data, ...extras) : data;
        if (cache) this.cache.set(id ?? entry.id, entry);
        return entry;
    };
};

export default CachedManager;