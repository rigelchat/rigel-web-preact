import { useState, useMemo, useEffect, useRef, useContext } from "preact/hooks";
import { ChannelType, Events } from "rigel.js";

import "./Sidebar.css";
import { RouteContext } from "../../contexts/RouteContext";
import SidebarHeader from "./SidebarHeader";
import SidebarScroller from "./SidebarScroller";
import SidebarPanel from "./SidebarPanel";

export default function Sidebar({ client, closeView }) {
    const { isGuildChannelRoute, isGuildDiscoveryRoute, guildChannelRouteParams } = useContext(RouteContext);
    const scrollerRef = useRef(null);
    const [, forceUpdate] = useState({});

    const guild = useMemo(() => {
        return isGuildChannelRoute ? client.guilds.cache.get(guildChannelRouteParams.guildId) : null;
    }, [client, guildChannelRouteParams?.guildId, isGuildChannelRoute]);

    const channels = useMemo(() => {
        if (!guild) return [];
        const groupedByParent = Object.groupBy(guild.channels.cache.values(), (c) => c.parentId);
        return (groupedByParent["null"] || [])
            .sort((a, b) => (a.type === ChannelType.GuildCategory) - (b.type === ChannelType.GuildCategory) || a.position - b.position)
            .flatMap((c) => {
                if (c.type === ChannelType.GuildCategory) {
                    const children = (groupedByParent[c.id] || []).sort((a, b) => a.position - b.position)
                    return [c, ...children];
                };
                return [c];
            });
    }, [guild]);

    useEffect(() => {
        if (!client) return;

        const handleUpdate = () => forceUpdate({});

        client.on(Events.Ready, handleUpdate);
        client.on(Events.ShardResume, handleUpdate);
        client.on(Events.GuildUpdate, handleUpdate);
        client.on(Events.ChannelCreate, handleUpdate);
        client.on(Events.ChannelUpdate, handleUpdate);
        client.on(Events.ChannelDelete, handleUpdate);

        return () => {
            client.removeListener(Events.Ready, handleUpdate);
            client.removeListener(Events.ShardResume, handleUpdate);
            client.removeListener(Events.GuildUpdate, handleUpdate);
            client.removeListener(Events.ChannelCreate, handleUpdate);
            client.removeListener(Events.ChannelUpdate, handleUpdate);
            client.removeListener(Events.ChannelDelete, handleUpdate);
        };
    }, [client]);

    return (
        <div className="sidebar-wrapper">
            <div className="sidebar">
                <SidebarHeader guild={guild} titleOverride={isGuildDiscoveryRoute ? "Découvrir" : null} scrollerRef={scrollerRef}/>
                <SidebarScroller guild={guild} channels={channels} scrollerRef={scrollerRef} closeView={closeView}/>
                <SidebarPanel client={client}/>
            </div>
        </div>
    );
};