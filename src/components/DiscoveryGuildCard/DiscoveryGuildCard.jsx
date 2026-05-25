import { useRef, useContext, useCallback } from "preact/hooks";
import { Events } from "rigel.js";

import "./DiscoveryGuildCard.css";
import { RouteContext } from "../../contexts/RouteContext";

export default function DiscoveryGuildCard({ client, discoveryGuild }) {
    const { goToGuildChannel } = useContext(RouteContext);
    const cardRef = useRef(null);

    const onClick = useCallback(() => {
        const guild = client.guilds.cache.get(discoveryGuild.id);
        if (guild) {
            const channel = guild.rulesChannelId ? guild.channels.cache.get(guild.rulesChannelId) : guild.channels.cache.find((c) => c.viewable && c.isTextBased());
            goToGuildChannel(guild.id, channel?.id);
        } else {
            const handler = (newGuild) => {
                if (discoveryGuild.id !== newGuild.id) return;
                const channel = newGuild.rulesChannelId ? newGuild.channels.cache.get(newGuild.rulesChannelId) : newGuild.channels.cache.find((c) => c.viewable && c.isTextBased());
                goToGuildChannel(newGuild.id, channel?.id);
                client.removeListener(Events.GuildCreate, handler);
            };

            client.on(Events.GuildCreate, handler);

            client.rest.acceptInvite(discoveryGuild.vanityUrlCode).catch((err) => {
                client.removeListener(Events.GuildCreate, handler);
                const res = err.response;
                console.error(res || err);
                alert(res ? `❌ ${res.data.message} (${res.data.code ?? res.status})` : `❌ ${err.message} (${err.code})`);
            });
        };
    });

    return (
        <div ref={cardRef} className="card" onClick={onClick}>
            <div className="header">
                <img src={discoveryGuild.banner ? discoveryGuild.bannerURL({ size: 512 }) : "/assets/default-guild-splash.svg"} className="splash"/>
                {discoveryGuild.icon ? (
                    <img src={discoveryGuild.iconURL({ size: 64 })} className="icon"/>
                ) : (
                    <span className="icon">{discoveryGuild.nameAcronym}</span>
                )}
            </div>
            <div className="details">
                <div className="title">
                    <h2>{discoveryGuild.name}</h2>
                </div>
                <div className="description">{discoveryGuild.description}</div>
                <div className="members">
                    {discoveryGuild.approximatePresenceCount !== null && (
                        <div className="count">
                            <div className="dot online"/>
                            {discoveryGuild.approximatePresenceCount} en ligne
                        </div>
                    )}
                    {discoveryGuild.approximateMemberCount !== null && (
                        <div className="count">
                            <div className="dot"/>
                            {discoveryGuild.approximateMemberCount} membres
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
