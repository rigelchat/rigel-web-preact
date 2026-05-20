import Base from "./Base.js";
import Events from "../utils/Events.js";

class UserProfile extends Base {
    constructor(client, user, data) {
        super(client);
        this.user = user;
        this._patch(data);
    };

    _patch(data) {
        if ("bio" in data) {
            this.bio = data.bio;
        } else {
            this.bio ??= null;
        };

        if ("pronouns" in data) {
            this.pronouns = data.pronouns;
        } else {
            this.pronouns ??= null;
        };

        if ("accent_color" in data) {
            this.accentColor = data.accent_color;
        } else {
            this.accentColor ??= null;
        };

        if ("theme_colors" in data) {
            this.themeColors = data.theme_colors;
        } else {
            this.themeColors ??= null;
        };
    };

    async fetch(options = {}) {
        const data = await this.client.rest.getUserProfile(this.user.id, options);
        this._patch(data.user_profile || data);
        this.client.users.profiles.set(this.user.id, this);
        this.client.emit(Events.UserProfileUpdate, this.user.id, this);
        return this;
    };
};

export default UserProfile;
