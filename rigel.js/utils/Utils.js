import { Collection } from "@discordjs/collection";
import { ChannelType } from "../Constants.js";

export function isObject(obj) {
    return Object(obj) === obj;
};

export function isJSONEncodable(maybeEncodable) {
	return maybeEncodable !== null && typeof maybeEncodable === "object" && "toJSON" in maybeEncodable;
};

export function verifyString(
    data,
    error = Error,
    errorMessage = `Expected a string, got ${data} instead.`,
    allowEmpty = true
) {
    if (typeof data !== "string") throw new error(errorMessage);
    if (!allowEmpty && data.length === 0) throw new error(errorMessage);
    return data;
};

export function flatten(obj, ...props) {
    const lastProp = props[props.length - 1];
    const seen = lastProp instanceof WeakSet ? props.pop() : new WeakSet();
    if (!isObject(obj)) return obj;
    if (seen.has(obj)) return "[Circular]";
    seen.add(obj);

    const objProps = Object.keys(obj)
        .filter(key => !key.startsWith("_"))
        .map(key => ({ [key]: true }));

    props = objProps.length ? Object.assign(...objProps, ...props) : Object.assign({}, ...props);

    const out = {};

    for (let [prop, newProp] of Object.entries(props)) {
        if (!newProp) continue;
        newProp = newProp === true ? prop : newProp;

        const element = obj[prop];
        const elemIsObj = isObject(element);
        const valueOf = elemIsObj && typeof element.valueOf === "function" ? element.valueOf() : null;
        const hasToJSON = elemIsObj && typeof element.toJSON === "function";

        if (element instanceof Collection) out[newProp] = Array.from(element.keys());
        else if (valueOf instanceof Collection) out[newProp] = Array.from(valueOf.keys());
        else if (Array.isArray(element)) out[newProp] = element.map(elm => elm.toJSON?.() ?? flatten(elm, {}, seen));
        else if (typeof valueOf !== "object") out[newProp] = valueOf;
        else if (hasToJSON) out[newProp] = element.toJSON();
        else if (elemIsObj) out[newProp] = flatten(element, {}, seen);
        else out[newProp] = element;
    };

    return out;
};

export function parseEmoji(text) {
    if (text.includes("%")) text = decodeURIComponent(text);
    if (!text.includes(":")) return { animated: false, name: text, id: undefined };
    const match = text.match(/<?(?:(a):)?(\w{2,32}):(\d{17,19})?>?/);
    return match && { animated: Boolean(match[1]), name: match[2], id: match[3] };
};

export function resolvePartialEmoji(emoji) {
    if (!emoji) return null;
    if (typeof emoji === "string") return /^\d{17,19}$/.test(emoji) ? { id: emoji } : parseEmoji(emoji);
    const { id, name, animated } = emoji;
    if (!id && !name) return null;
    return { id, name, animated: Boolean(animated) };
};

export function basename(path, ext) {
    const base = (path.split(/[\\/]/).pop() || "").split("?")[0];
    return ext && base.endsWith(ext) ? base.slice(0, base.length - ext.length) : base;
};

function getSortableGroupTypes(type) {
    switch (type) {
        case ChannelType.GuildText:
        case ChannelType.GuildAnnouncement:
        case ChannelType.GuildForum:
        case ChannelType.GuildMedia:
            return [
                ChannelType.GuildText,
                ChannelType.GuildAnnouncement,
                ChannelType.GuildForum,
                ChannelType.GuildMedia
            ];
        case ChannelType.GuildVoice:
        case ChannelType.GuildStageVoice:
            return [ChannelType.GuildVoice, ChannelType.GuildStageVoice];
        case ChannelType.GuildCategory:
            return [ChannelType.GuildCategory];
        default:
            return [type];
    };
};

export { getSortableGroupTypes };