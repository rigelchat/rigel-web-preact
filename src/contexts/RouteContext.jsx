import { createContext } from "preact";
import { useLocation, useRoute } from "wouter-preact";

export const RouteContext = createContext();

export function RouteProvider({ children }) {
    const [, setLocation] = useLocation();
    const [isGuildChannelRoute, guildChannelRouteParams] = useRoute("/channels/:guildId/:channelId?");
    const [isGuildDiscoveryRoute] = useRoute("/guild-discovery");

    const goToApp = () => document.location.href = "/app";
    const goToGuildChannel = (guildId, channelId = "") => setLocation(`/channels/${guildId}/${channelId}`);
    const goToGuildDiscovery = () => setLocation("/guild-discovery");
    const goToLogin = () => setLocation("/login");

    return (
        <RouteContext.Provider value={{
            isGuildChannelRoute,
            isGuildDiscoveryRoute,
            goToApp,
            goToGuildChannel,
            goToGuildDiscovery,
            goToLogin,
            guildChannelRouteParams
        }}>
            {children}
        </RouteContext.Provider>
    );
};