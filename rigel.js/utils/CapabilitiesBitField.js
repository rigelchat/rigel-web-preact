import BitField from "./BitField.js";
import { GatewayCapabilityBits } from "../Constants.js";

class CapabilitiesBitField extends BitField {
    static Flags = GatewayCapabilityBits;
};

export default CapabilitiesBitField;