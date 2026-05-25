import classNames from "classnames";
import { UserFlagsBitField } from "rigel.js";

import styles from "./MemberItem.module.css";
import * as Icons from "../../icons/Icons";

export default function MemberItem({ member }) {
    return (
        <div 
            className={classNames(styles.member, { [styles.offline]: !member.presence || member.presence.status === "offline" })}
        >
            <img src={member.user.displayAvatarURL({ size: 32, forceStatic: true })} className={styles.avatar} loading="lazy"/>
            <div className={styles.memberContent}>
                <span className={styles.name} style={{ color: member.displayColor && member.displayHexColor }}>{member.user.displayName}</span>
                {member.user.bot && <Icons.BadgeIcons.Bot verified={member.user.flags.has(UserFlagsBitField.Flags.VerifiedBot)}/>}
                {member.id === member.guild.ownerId && <Icons.Crown className={classNames(styles.icon, styles.crown)}/>}
            </div>
        </div>
    );
};