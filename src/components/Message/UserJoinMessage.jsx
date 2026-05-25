import { useState } from "preact/hooks";
import classNames from "classnames";

import styles from "./Message.module.css";
import MessageActions from "./MessageActions";
import { MessageIcons } from "../../icons/Icons";
import { useFormatter } from "../../hooks/useFormatter";

export default function UserJoinMessage({ client, message, isGroupStart }) {
    const [hovered, setHovered] = useState(false);

    const { formatLongTimestamp } = useFormatter(client.settings.locale);

    const displayColor = message.member?.displayColor && `#${message.member.displayColor.toString(16)}`;

    return (
        <div
            className={classNames(styles.message, styles.system, { [styles.groupStart]: isGroupStart })}
            data-message-id={message.id}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <div className={styles.messageIcon}>
                <MessageIcons.Join/>
            </div>
            <div className={styles.content}>
                {[
                    <><span className={styles.username} style={{ color: displayColor }}>{message.author.displayName}</span> a rejoint le groupe.</>,
                    <><span className={styles.username} style={{ color: displayColor }}>{message.author.displayName}</span> est arrivé(e).</>,
                    <>Bienvenue, <span className={styles.username} style={{ color: displayColor }}>{message.author.displayName}</span>. On espère que tu as apporté de la pizza.</>,
                    <>Un <span className={styles.username} style={{ color: displayColor }}>{message.author.displayName}</span> sauvage apparaît.</>,
                    <><span className={styles.username} style={{ color: displayColor }} >{message.author.displayName}</span> vient juste d'atterrir.</>,
                    <><span className={styles.username} style={{ color: displayColor }} >{message.author.displayName}</span> vient de se glisser dans le serveur.</>,
                    <><span className={styles.username} style={{ color: displayColor }} >{message.author.displayName}</span> vient juste d'arriver !</>,
                    <>Bienvenue <span className={styles.username} style={{ color: displayColor }}>{message.author.displayName}</span>. Dis bonjours !</>,
                    <><span className={styles.username} style={{ color: displayColor }}>{message.author.displayName}</span> a bondi dans le serveur.</>,
                    <>Tout le monde, accueillez comme il se doit <span className={styles.username} style={{ color: displayColor }}>{message.author.displayName}</span> !</>,
                    <>Contents de te voir, <span className={styles.username} style={{ color: displayColor }}>{message.author.displayName}</span>.</>,
                    <>C'est un plaisir de te voir, <span className={styles.username} style={{ color: displayColor }}>{message.author.displayName}</span>.</>,
                    <>Youhou, tu as réussi, <span className={styles.username} style={{ color: displayColor }}>{message.author.displayName}</span> !</>
                ][message.createdTimestamp % 13]}
                <span className={styles.timestamp}>{formatLongTimestamp(message.createdAt)}</span>
            </div>
            {hovered && <MessageActions client={client} message={message}/>}
        </div>
    );
};