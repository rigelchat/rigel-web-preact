import { Collection } from "@discordjs/collection";
import { RigeljsTypeError, ErrorCodes } from "../errors.js";

class LimitedCollection extends Collection {
    constructor(options = {}, iterable) {
        if (typeof options !== "object" || options === null) {
            throw new RigeljsTypeError(ErrorCodes.InvalidType, "options", "object", true);
        };

        const { maxSize = Infinity, keepOverLimit = null, ttl = 0 } = options;

        if (typeof maxSize !== "number") {
            throw new RigeljsTypeError(ErrorCodes.InvalidType, "maxSize", "number");
        };

        if (keepOverLimit !== null && typeof keepOverLimit !== "function") {
            throw new RigeljsTypeError(ErrorCodes.InvalidType, "keepOverLimit", "function");
        };

        if (typeof ttl !== "number") {
            throw new RigeljsTypeError(ErrorCodes.InvalidType, "ttl", "number");
        };

        super(iterable);

        this.maxSize = maxSize;
        this.keepOverLimit = keepOverLimit;
        this.ttl = ttl;
        this._durations = new Map();
    };

    get(key) {
        if (this.ttl > 0 && this._durations.has(key)) {
            if (Date.now() > this._durations.get(key)) {
                this.delete(key);
                return undefined;
            };
        };
        return super.get(key);
    };

    set(key, value) {
        if (this.maxSize === 0 && !this.keepOverLimit?.(value, key, this)) return this;
        if (this.size >= this.maxSize && !this.has(key)) {
            for (const [k, v] of this.entries()) {
                const keep = this.keepOverLimit?.(v, k, this) ?? false;
                if (!keep) {
                    this.delete(k);
                    break;
                };
            };
        };

        if (this.ttl > 0) {
            this._durations.set(key, Date.now() + this.ttl);
        };

        return super.set(key, value);
    };

    delete(key) {
        this._durations.delete(key);
        return super.delete(key);
    };

    clear() {
        this._durations.clear();
        return super.clear();
    };

    static get [Symbol.species]() {
        return Collection;
    };
};

export default LimitedCollection;