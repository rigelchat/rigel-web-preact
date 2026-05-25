import { useState, useEffect } from "preact/hooks";
import { Events } from "rigel.js";

import "./GuildsSidebar.css";
import GuildSidebarItem from "./GuildSidebarItem";
import { isPwa } from "../../utils/index";

export default function GuildsSidebar({ client }) {
    const [guilds, setGuilds] = useState([]);

    useEffect(() => {
        if (!client) return;

        const updateGuilds = () => setGuilds([...client.guilds.cache.values()]);

        client.on(Events.Ready, updateGuilds);
        client.on(Events.ShardResume, updateGuilds);
        client.on(Events.GuildCreate, updateGuilds);
        client.on(Events.GuildDelete, updateGuilds);
        client.on(Events.GuildAvailable, updateGuilds);
        client.on(Events.GuildUnavailable, updateGuilds);
        client.on(Events.GuildUpdate, updateGuilds);

        if (client.isReady) updateGuilds();

        return () => {
            client.removeListener(Events.Ready, updateGuilds);
            client.removeListener(Events.ShardResume, updateGuilds);
            client.removeListener(Events.GuildCreate, updateGuilds);
            client.removeListener(Events.GuildDelete, updateGuilds);
            client.removeListener(Events.GuildAvailable, updateGuilds);
            client.removeListener(Events.GuildUnavailable, updateGuilds);
            client.removeListener(Events.GuildUpdate, updateGuilds);
        };
    }, [client]);

    return (
        <div className="guilds-sidebar scrollbar-none">
            <GuildSidebarItem type="home" client={client}/>
            <div className="separator"></div>
            <div className="servers">
                {guilds.map((g) => (
                    <GuildSidebarItem key={g.id} type="guild" client={client} guild={g}/>
                ))}
            </div>
            <GuildSidebarItem type="add-guild" client={client}/>
            <GuildSidebarItem type="discover"/>
            {!isPwa() && <GuildSidebarItem type="download-apps"/>}
        </div>
    );
};