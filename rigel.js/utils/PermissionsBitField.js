import BitField from "./BitField.js";
import { PermissionFlagsBits } from "../Constants.js";

class PermissionsBitField extends BitField {
    static Flags = PermissionFlagsBits;
    static DefaultBit = BigInt(0);

    static All = Object.values(PermissionFlagsBits).reduce((all, p) => all | p, 0n);
    static Default = BigInt(104324673);
    static StageModerator = PermissionFlagsBits.ManageChannels | PermissionFlagsBits.MuteMembers | PermissionFlagsBits.MoveMembers;

    missing(bits, checkAdmin = true) {
        return checkAdmin && this.has(PermissionFlagsBits.Administrator) ? [] : super.missing(bits);
    };

    any(permission, checkAdmin = true) {
        return (checkAdmin && super.has(PermissionFlagsBits.Administrator)) || super.any(permission);
    };

    has(permission, checkAdmin = true) {
        return (checkAdmin && super.has(PermissionFlagsBits.Administrator)) || super.has(permission);
    };

    toArray() {
        return super.toArray(false);
    };
};

export default PermissionsBitField;