import { useState } from "preact/hooks";
import classNames from "classnames";

import styles from "./Message.module.css";
import "../../styles/markdown.css";
import MessageActions from "./MessageActions";
import { useFormatter } from "../../hooks/useFormatter";
import { parseMarkdownToJSX } from "../../utils/markdown.jsx";

export default function DefaultMessage({ client, message, isGroupStart, setMessages }) {
    const [hovered, setHovered] = useState(false);

    const { timeFormatter, formatLongTimestamp } = useFormatter(client.settings.locale);

    const displayColor = message.member?.displayColor && `#${message.member.displayColor.toString(16)}`;
    const mentioned = message.mentions && !message.isFailed ? (
        message.mentions.everyone ||
        message.mentions.repliedUser?.id === message.client.user.id ||
        message.mentions.users?.has(message.client?.user?.id) ||
        (message.member && message.member.roles.cache.some((roleId) => message.mentions.roles.has(roleId)))
    ) : false;

    const parsedContent = parseMarkdownToJSX(message.content);

    return (
        <div
            className={classNames(styles.message, {
                [styles.groupStart]: isGroupStart,
                [styles.isSending]: message.isSending,
                [styles.isFailed]: message.isFailed,
                [styles.mentioned]: mentioned
            })}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {isGroupStart && message.author && message.author.displayAvatarURL && (
                <img src={message.author.displayAvatarURL({ size: 64, forceStatic: true })} className={styles.avatar}/>
            )}
            {isGroupStart ? (
                <div className={styles.header}>
                    <span className={styles.username} style={{ color: displayColor }}>{message.author.displayName}</span>
                    <span className={styles.timestamp}>{formatLongTimestamp(message.createdAt)}</span>
                </div>
            ) : (
                <span className={styles.shortTimestamp} title={message.createdAt.toISOString()}>{timeFormatter.format(message.createdAt)}</span>
            )}
            <div className={`${styles.content} markup`}>
                {parsedContent}
                {message.editedTimestamp && <span className={styles.edited}>(modifié)</span>}
            </div>
            {/* {message.attachments && message.attachments.length > 0 && (
                <div className="message-attachments">
                    <MediaMosaic attachments={message.attachments} localStorage={storage}/>
                </div>
            )} */}
            {hovered && <MessageActions client={client} message={message} setMessages={setMessages}/>}
        </div>
    );
};