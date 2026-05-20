class Presence {
    constructor(client, data = {}) {
        this.client = client;
        this.userId = data.user.id;
        this.guild = data.guild ?? null;
        this._patch(data);
    };

    _patch(data) {
        if ("status" in data) {
            this.status = data.status;
        } else {
            this.status ??= "offline";
        };
    };

    get user() {
        return this.client.users.resolve(this.userId);
    };

    get member() {
        return this.guild.members.resolve(this.userId);
    };

    equals(presence) {
        return (
            this === presence ||
            (presence && this.status === presence.status)
        );
    };

    _clone() {
        const clone = Object.assign(Object.create(this), this);
        return clone;
    };
};

export default Presence;