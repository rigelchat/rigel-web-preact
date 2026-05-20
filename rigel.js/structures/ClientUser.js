import User from "./User.js";
import ClientUserProfile from "./ClientUserProfile.js";

class ClientUser extends User {
    _patch(data) {
        super._patch(data);

        if ("email" in data) {
            this.email = data.email;
        };

        if ("mfa_enabled" in data) {
            this.mfaEnabled = data.mfa_enabled;
        } else {
            this.mfaEnabled ??= null;
        };
    };

    get presence() {
        return this.client.presence;
    };

    get profile() {
        let profile = this.client.users.profiles.get(this.id);
        if (!profile || !(profile instanceof ClientUserProfile)) {
            profile = new ClientUserProfile(this.client, this, profile || {});
            this.client.users.profiles.set(this.id, profile);
        };
        return profile;
    };

    async edit(data) {
        const newUser = await this.client.rest.updateUser(data);
        this._patch(newUser);
        return this;
    };
};

export default ClientUser;