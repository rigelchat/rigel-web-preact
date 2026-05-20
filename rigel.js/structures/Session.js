import Base from "./Base.js";

class Session extends Base {
    constructor(client, data) {
        super(client);
        this.lastUsedTimestamp = null;
        this._patch(data);
    };

    _patch(data) {
        if ("id_hash" in data) {
            this.id = data.id_hash;
        };

        if ("approx_last_used_time" in data) {
            this.lastUsedTimestamp = new Date(data.approx_last_used_time).getTime();
        };

        if ("client_info" in data) {
            this.clientInfo = {
                location: data.client_info.location,
                platform: data.client_info.platform,
                os: data.client_info.os
            };
        };
    };

    get lastUsedAt() {
        return this.lastUsedTimestamp && new Date(this.lastUsedTimestamp);
    };

    async logout() {
        await this.client.rest.logoutSessions([this.id]);
        this.client.sessions.cache.delete(this.id);
    };
};

export default Session;