import BitField from "./BitField.js";
import { GuildSystemChannelFlags } from "../Constants.js";

class SystemChannelFlagsBitField extends BitField {
    static Flags = GuildSystemChannelFlags;
};

export default SystemChannelFlagsBitField;