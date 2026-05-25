import classNames from "classnames";
import { EMOJI_REGEX, getEmojiUrl, isEmojiOnly } from "../../utils/twemoji.js";
import emojiData from "emojibase-data/en/compact.json";

import styles from "./Emoji.module.css";

const emojiMap = new Map();
emojiData.forEach((emoji) => {
    emojiMap.set(emoji.label.toLowerCase(), emoji.unicode);
});

export default function Emoji({ unicode, label, isJumboable = false, className, ...props }) {
    const emoji = unicode || emojiMap.get(label?.toLowerCase());
    if (!emoji) return null;

    const url = getEmojiUrl(emoji);
    return (
        <img
            src={url}
            className={classNames(styles.emoji, { [styles.jumboable]: isJumboable }, className)}
            alt={unicode}
            draggable="false"
            loading="lazy"
            {...props}
        />
    );
};

export function EmojiText({ children, ...props }) {
    if (!children) return null;
    if (typeof children !== "string") return children;
    const isJumboable = isEmojiOnly(children);

    const emojiRegex = EMOJI_REGEX;
    const parts = children.split(emojiRegex);

    if (parts.length === 1) {
        return <span {...props}>{children}</span>;
    };

    return (
        parts.map((part, index) => {
            if (emojiRegex.test(part)) {
                emojiRegex.lastIndex = 0;
                return <Emoji key={index} unicode={part} isJumboable={isJumboable}/>;
            };
            return part;
        })
    );
};