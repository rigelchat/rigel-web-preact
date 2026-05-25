import { useState } from "preact/hooks";
import classNames from "classnames";
import { MessageType } from "rigel.js";

import styles from "./Message.module.css";
import MessageActions from "./MessageActions";
import { MessageIcons } from "../../icons/Icons";
import { useFormatter } from "../../hooks/useFormatter";

export default function GuildBoostMessage({ client, message, isGroupStart }) {
    const [hovered, setHovered] = useState(false);

    const { formatLongTimestamp } = useFormatter(client.settings.locale);

    const displayColor = message.member?.displayColor && `#${message.member.displayColor.toString(16)}`;
    const tierLabel = {
        [MessageType.GuildBoostTier1]: "Niveau 1",
        [MessageType.GuildBoostTier2]: "Niveau 2",
        [MessageType.GuildBoostTier3]: "Niveau 3"
    }[message.type];
    const boostCount = message.content;

    return (
        <div
            className={classNames(styles.message, styles.system, {
                [styles.groupStart]: isGroupStart
            })}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <div className={styles.messageIcon}>
                <MessageIcons.Boost/>
            </div>
            <div className={styles.content}>
                <div>
                    <span className={styles.username} style={{ color: displayColor }}>{message.author.displayName}</span>
                    {boostCount ? (
                        <> vient de booster <strong>{boostCount}</strong> fois le serveur !</>
                    ) : (
                        <> vient de booster le serveur !</>
                    )}
                    {tierLabel && <> {message.guild.name} a atteint <strong>{tierLabel}</strong> !</>}
                </div>
                <span className={styles.timestamp}>{formatLongTimestamp(message.createdAt)}</span>
            </div>
            {hovered && <MessageActions client={client} message={message}/>}
        </div>
    );
};