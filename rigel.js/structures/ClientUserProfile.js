import UserProfile from "./UserProfile.js";
import Events from "../utils/Events.js";

class ClientUserProfile extends UserProfile {
    async edit(data) {
        const newProfile = await this.client.rest.updateUserProfile(data);
        this._patch(newProfile.user_profile || newProfile);
        this.client.users.profiles.set(this.user.id, this);
        this.client.emit(Events.UserProfileUpdate, this);
        return this;
    };
};

export default ClientUserProfile;