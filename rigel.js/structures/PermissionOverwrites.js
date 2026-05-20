import PermissionsBitField from "../utils/PermissionsBitField.js";
import Role from "./Role.js";
import { RigeljsTypeError, ErrorCodes } from "../errors.js";
import { OverwriteType } from "../Constants.js";

class PermissionOverwrites {
    constructor(client, data, channel) {
        this.client = client;
        Object.defineProperty(this, "channel", { value: channel });
        if (data) this._patch(data);
    };

    _patch(data) {
        this.id = data.id;

        if ("type" in data) {
            this.type = data.type;
        };

        if ("deny" in data) {
            this.deny = new PermissionsBitField(BigInt(data.deny)).freeze();
        };

        if ("allow" in data) {
            this.allow = new PermissionsBitField(BigInt(data.allow)).freeze();
        };
    };

    static resolveOverwriteOptions(options, { allow, deny } = {}) {
        allow = new PermissionsBitField(allow);
        deny = new PermissionsBitField(deny);

        for (const [perm, value] of Object.entries(options)) {
            if (value === true) {
                allow.add(perm);
                deny.remove(perm);
            } else if (value === false) {
                allow.remove(perm);
                deny.add(perm);
            } else if (value === null) {
                allow.remove(perm);
                deny.remove(perm);
            };
        };

        return { allow, deny };
    };

    toJSON() {
        return {
            id: this.id,
            type: this.type,
            allow: this.allow,
            deny: this.deny
        };
    };

    static resolve(overwrite, guild) {
        if (overwrite instanceof this) return overwrite.toJSON();
        if (typeof overwrite.id === 'string' && overwrite.type in OverwriteType) {
            return {
                id: overwrite.id,
                type: overwrite.type,
                allow: PermissionsBitField.resolve(overwrite.allow ?? PermissionsBitField.DefaultBit).toString(),
                deny: PermissionsBitField.resolve(overwrite.deny ?? PermissionsBitField.DefaultBit).toString(),
            };
        };

        const userOrRole = guild.roles.resolve(overwrite.id) ?? guild.client.users.resolve(overwrite.id);
        if (!userOrRole) {
            throw new RigeljsTypeError(ErrorCodes.InvalidType, 'parameter', 'cached User or Role');
        };

        const type = userOrRole instanceof Role ? OverwriteType.Role : OverwriteType.Member;

        return {
            id: userOrRole.id,
            type,
            allow: PermissionsBitField.resolve(overwrite.allow ?? PermissionsBitField.DefaultBit).toString(),
            deny: PermissionsBitField.resolve(overwrite.deny ?? PermissionsBitField.DefaultBit).toString(),
        };
    };
};

export default PermissionOverwrites;