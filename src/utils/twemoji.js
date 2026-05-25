export const EMOJI_REGEX = /\p{RGI_Emoji}\uFE0F?/gv;

export function getEmojiUrl(emoji) {
    const text = emoji.includes("\u200D") ? emoji : emoji.replace(/\uFE0F/g, "");

    const iconId = Array.from(text)
        .map((char) => char.codePointAt(0).toString(16))
        .join("-");

    return `/assets/emojis/${iconId}.svg`;
}

export function isEmojiOnly(text) {
    if (typeof text !== "string") return false;

    const trimmed = text.trim();
    if (trimmed.length === 0) return false;

    return trimmed.replace(EMOJI_REGEX, "").trim() === "";
};