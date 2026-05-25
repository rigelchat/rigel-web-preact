import { useState, useEffect, useMemo } from "preact/hooks";
import { Events, PermissionsBitField } from "rigel.js";

import styles from "./ChannelMembers.module.css";
import MemberItem from "./MemberItem";

export default function ChannelMembers({ client, channel }) {
    const [tick, setTick] = useState(0);

    useEffect(() => {
        if (!channel || !channel.guild) return;

        channel.guild.members.requestLazy({
            [channel.id]: [[0, 99]]
        });
    }, [channel?.id]);

    useEffect(() => {
        const handler = () => channel && setTick((t) => t + 1);
        const presenceHandler = (oldPresence, newPresence) => newPresence.guild.id === channel?.guildId && handler();

        client.on(Events.PresenceUpdate, presenceHandler);
        client.on(Events.GuildMemberAdd, handler);
        client.on(Events.GuildMemberRemove, handler);
        client.on("guildMemberListUpdate", handler);

        return () => {
            client.removeListener(Events.PresenceUpdate, presenceHandler);
            client.removeListener(Events.GuildMemberAdd, handler);
            client.removeListener(Events.GuildMemberRemove, handler);
            client.removeListener("guildMemberListUpdate", handler);
        };
    }, [client, channel?.id]);

    const memberGroups = useMemo(() => {
        if (!channel) return [];

        const groups = new Map();
        const offlineMembers = [];

        channel.guild.roles.cache
            .filter((r) => r.hoist)
            .sort((a, b) => b.position - a.position)
            .forEach(role => groups.set(role.id, { ...role, members: [] }));

        groups.set("online", { id: "online", name: "En ligne", position: -1, members: [] });

        for (const member of channel.guild.members.cache.values()) {
            if (!channel.permissionsFor(member).has(PermissionsBitField.Flags.ViewChannel)) continue;
            if (member.presence && member.presence?.status !== "offline") {
                const hoistRole = member.roles.hoist;
                groups.get(hoistRole ? hoistRole.id : "online").members.push(member);
            } else {
                offlineMembers.push(member);
            };
        };

        const finalGroups = [...groups.values()]
            .filter((group) => group.members.length > 0)
            .sort((a, b) => b.position - a.position);

        finalGroups.forEach((g) => g.members.sort((a, b) => a.user.displayName.localeCompare(b.user.displayName)));

        if (offlineMembers.length > 0) {
            offlineMembers.sort((a, b) => a.user.displayName.localeCompare(b.user.displayName));
            finalGroups.push({ id: "offline", name: "Hors ligne", members: offlineMembers });
        };

        return finalGroups;
    }, [channel?.id, tick]);

    if (!channel) return null;

    return (
        <div className={`${styles.channelMembers} scrollbar-thin scrollbar-fade scrollbar-themed`}>
            {memberGroups.map((group) => (
                <div key={group.id} className="role-group">
                    <h3 className={styles.membersGroup}>
                        {/* {group.unicodeEmoji && <img className={styles.roleIcon} src={twemojiUrl(group.unicodeEmoji)} loading="lazy"/>} */}
                        {group.name.toUpperCase()} — {group.members.length}
                    </h3>
                    {group.members.map((member) => (
                        <MemberItem key={member.id} member={member}/>
                    ))}
                </div>
            ))}
        </div>
    );
};