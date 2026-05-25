import { useState, useEffect } from "preact/hooks";

import "./GuildDiscoveryView.css";
import DiscoveryGuildCard from "../components/DiscoveryGuildCard/DiscoveryGuildCard.jsx";

export default function GuildDiscoveryView({ client }) {
    const [discoverableGuilds, setDiscoverableGuilds] = useState([]);

    useEffect(() => {
        client.guilds.fetchDiscoverable().then((guilds) => {
            setDiscoverableGuilds(guilds);
        });
    }, []);

    return (
        <div className="guild-discovery-view scrollbar-thin">
            <div className="hero">
                <div className="text-container">
                    <h2>Trouve ta communauté sur Rigel</h2>
                    <p>Des jeux vidéo à la pédagogie, en passant par la musique, tu trouveras toujours chaussure à ton pied.</p>
                </div>
            </div>
            <h2 className="guilds-header">Serveur du moment</h2>
            <div className="guilds">
                {discoverableGuilds.map((guild) => (
                    <DiscoveryGuildCard key={guild.id} client={client} discoveryGuild={guild}/>
                ))}
            </div>
        </div>
    );
};