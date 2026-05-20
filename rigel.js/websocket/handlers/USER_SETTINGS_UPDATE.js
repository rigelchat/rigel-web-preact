import { Events } from "../../Constants.js";

export default function(client, packet, shard) {
    client.settings._patch(packet.d);
    client.emit(Events.UserSettingsUpdate, client.settings);
};