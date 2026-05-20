import CachedManager from "./CachedManager.js";
import User from "../structures/User.js";
import LimitedCollection from "../utils/LimitedCollection.js";

class UserManager extends CachedManager {
    constructor(client, iterable) {
        super(client, User, iterable);
        this.profiles = new LimitedCollection({ ttl: 60000 });
    };
};

export default UserManager;