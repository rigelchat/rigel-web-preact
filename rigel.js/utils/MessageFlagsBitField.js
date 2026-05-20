import BitField from "./BitField.js";
import { MessageFlags } from "../Constants.js";

class MessageFlagsBitField extends BitField {
    static Flags = MessageFlags;
};

export default MessageFlagsBitField;