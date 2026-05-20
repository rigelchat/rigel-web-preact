import BitField from "./BitField.js";
import { UserFlags } from "../Constants.js";

class UserFlagsBitField extends BitField {
    static Flags = UserFlags;
};

export default UserFlagsBitField;