import Presence from "./Presence.js";
import { GatewayOPCodes, ActivityType } from "../Constants.js";
import { RigeljsTypeError, ErrorCodes } from "../errors.js";

class ClientPresence extends Presence {
    constructor(client, data = {}) {
        super(client, Object.assign(data, { status: data.status ?? "online", user: { id: null } }));
    };

    set(presence) {
        const packet = this._parse(presence);
        this._patch(packet);
        if (presence.shardId === undefined) {
            this.client.ws.broadcast({ op: GatewayOPCodes.PresenceUpdate, d: packet });
        } else if (Array.isArray(presence.shardId)) {
            for (const shardId of presence.shardId) {
                this.client.ws.shards.get(shardId).send({ op: GatewayOPCodes.PresenceUpdate, d: packet });
            };
        } else {
            this.client.ws.shards.get(presence.shardId).send({ op: GatewayOPCodes.PresenceUpdate, d: packet });
        };
        return this;
    };

    _parse({ status, since, afk, activities }) {
        const data = {
            activities: [],
            afk: typeof afk === "boolean" ? afk : false,
            since: typeof since === "number" && !Number.isNaN(since) ? since : null,
            status: status ?? this.status,
        };
        if (activities?.length) {
            for (const [i, activity] of activities.entries()) {
                if (typeof activity.name !== "string") {
                    throw new RigeljsTypeError(ErrorCodes.InvalidType, `activities[${i}].name`, "string");
                };

                activity.type ??= ActivityType.Playing;

                if (activity.type === ActivityType.Custom && !activity.state) {
                    activity.state = activity.name;
                    activity.name = "Custom Status";
                };

                data.activities.push({
                    type: activity.type,
                    name: activity.name,
                    state: activity.state,
                    url: activity.url,
                });
            };
        } else if (!activities && (status || afk || since) && this.activities.length) {
            data.activities.push(
                ...this.activities.map(activity => ({
                    name: activity.name,
                    state: activity.state ?? undefined,
                    type: activity.type,
                    url: activity.url ?? undefined,
                })),
            );
        };

        return data;
    };
};

export default ClientPresence;