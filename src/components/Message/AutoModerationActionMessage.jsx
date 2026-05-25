import { useState } from "preact/hooks";
import classNames from "classnames";

import styles from "./Message.module.css";
import MessageActions from "./MessageActions";
import { useFormatter } from "../../hooks/useFormatter";

export default function AutoModerationActionMessage({ client, message }) {
    const [hovered, setHovered] = useState(false);

    const { formatLongTimestamp } = useFormatter(client.settings.locale);

    return (
        <div
            className={classNames(styles.message, styles.groupStart)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <img src="/assets/automod-avatar.png" className={styles.avatar}/>
            <div className={styles.header}>
                <span className={styles.username} style={{ color: "var(--text-brand)" }}>AutoMod</span>
                <span className={styles.timestamp}>{formatLongTimestamp(message.createdAt)}</span>
            </div>
            {hovered && <MessageActions client={client} message={message}/>}
        </div>
    );
};