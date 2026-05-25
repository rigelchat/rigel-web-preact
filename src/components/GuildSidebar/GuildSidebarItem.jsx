import { useState, useMemo, useContext, useRef } from "preact/hooks";
import classNames from "classnames";

import * as Icons from "../../icons/Icons";
import "./GuildSidebarItem.css";
import { RouteContext } from "../../contexts/RouteContext";
import { StorageContext } from "../../contexts/StorageContext";
import { PWAContext } from "../../contexts/PWAContext";
import { ContextMenu, ContextMenuItem } from "../ContextMenu/ContextMenu";
import GuildContextMenu from "../ContextMenu/GuildContextMenu";

export default function GuildSidebarItem({ client, type, guild }) {
    const { isGuildDiscoveryRoute, guildChannelRouteParams, goToGuildChannel, goToGuildDiscovery } = useContext(RouteContext);
    const { installPWA } = useContext(PWAContext);
    const [hovered, setHovered] = useState(false);
    const storage = useContext(StorageContext);
    const contextMenuRef = useRef();

    const selected = useMemo(() => {
        switch (type) {
            case "guild": return guild.id === guildChannelRouteParams?.guildId;
            case "discover": return isGuildDiscoveryRoute;
            default: return false;
        };
    }, [isGuildDiscoveryRoute, guildChannelRouteParams]);

    const title = useMemo(() => {
        switch (type) {
            case "home": return "Messages privé";
            case "guild": return guild.available ? guild.name : "Ce serveur est indisponible à cause d'une panne temporaire.";
            case "add-guild": return "Ajouter un serveur";
            case "discover": return "Découvrir";
            case "download-apps": return "Télécharger des applications";
        };
    }, [guild?.name]);

    const icon = useMemo(() => {
        switch (type) {
            case "home": {
                const appIcon = storage.getAppIcon();
                return appIcon ? <img src={`/assets/app-icons/${appIcon}.webp`} /> : <Icons.Leo/>;
            };

            case "guild": {
                if (!guild.available) return <span>!</span>;
                if (!guild.icon) return <span>{guild.nameAcronym}</span>;
                return <img src={guild.iconURL({ size: 64, forceStatic: !(hovered || selected) })} />;
            };

            case "add-guild": return <Icons.Add/>;
            case "download-apps": return <Icons.Download/>;
            case "discover": return <Icons.Discover/>;
            default: return null;
        };
    }, [type, guild?.icon, guild?.name]);

    function onClick() {
        switch (type) {
            case "guild": {
                if (!guild.available) return;
                const channel = guild.rulesChannelId ? guild.channels.cache.get(guild.rulesChannelId) : guild.channels.cache.find((c) => c.viewable && c.isTextBased());
                goToGuildChannel(guild.id, channel?.id);
            }; break;

            case "add-guild": {
                const name = prompt("Nom du serveur", `Serveur de ${client.user.displayName}`);
                client.guilds.create({ name }).then((newGuild) => {
                    const channel = newGuild.channels.cache.find((c) => c.viewable && c.isTextBased());
                    goToGuildChannel(newGuild.id, channel.id);
                });
            }; break;

            case "discover": {
                goToGuildDiscovery();
            }; break;

            case "download-apps": {
                installPWA();
            }; break;
        };
    };

    function onContextMenu(evt) {
        if (!contextMenuRef.current) return;
        evt.preventDefault();
        contextMenuRef.current.show(evt);
    };

    return (
        <div
            className={classNames("item", type, { selected, unread: guild?.hasUnread, unavailable: guild && !guild.available })}
            title={title}
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onContextMenu={onContextMenu}
        >
            <div className="item-inner">
                <div className="pill">
                    <span></span>
                </div>
                <div className={classNames("icon", { green: ["add-guild", "download-apps", "discover"].includes(type) })}>
                    {icon}
                </div>
                {guild?.mentionCount > 0 && (
                    <div className="mention-badge">
                        {guild.mentionCount > 99 ? "99+" : guild.mentionCount}
                    </div>
                )}
            </div>
            {type === "guild" && guild && (
                <GuildContextMenu ref={contextMenuRef} client={client} guild={guild}/>
            )}
            {type === "add-guild" && (
                <ContextMenu ref={contextMenuRef}>
                    <ContextMenuItem label="Rejoindre un serveur"/>
                    <ContextMenuItem label="Créer un serveur" onClick={() => {
                        const name = prompt("Nom du serveur", `Serveur de ${client.user.displayName}`);
                        client.guilds.create({ name }).then((newGuild) => {
                            const channel = newGuild.channels.cache.find((c) => c.viewable && c.isTextBased());
                            goToGuildChannel(newGuild.id, channel.id);
                        });
                    }}/>
                </ContextMenu>
            )}
        </div>
    );
};