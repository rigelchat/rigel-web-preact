import CachedManager from "./CachedManager.js";
import PermissionOverwrites from "../structures/PermissionOverwrites.js";

class PermissionOverwriteManager extends CachedManager {
    constructor(channel, iterable) {
        super(channel.client, PermissionOverwrites);
        this.channel = channel;
        if (iterable) {
            for (const item of iterable) {
                this._add(item);
            };
        };
    };

    _add(data, cache) {
        return super._add(data, cache, { extras: [this.channel] });
    };
};

export default PermissionOverwriteManager;