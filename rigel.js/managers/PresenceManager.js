import CachedManager from "./CachedManager.js";
import Presence from "../structures/Presence.js";

class PresenceManager extends CachedManager {
    constructor(guild, iterable) {
        super(guild.client, Presence, iterable);
    };

    _add(data, cache) {
        return super._add(data, cache, { id: data.user.id });
    };
};

export default PresenceManager;