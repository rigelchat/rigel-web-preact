import { useState, useEffect, useContext } from "preact/hooks";
import { Route } from "wouter-preact";
import { useSpring, animated, easings, useTransition } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";
import { Client, Events, CapabilitiesBitField } from "rigel.js";

import { RouteContext } from "../contexts/RouteContext.jsx";
import { AppBadgeContext } from "../contexts/AppBadgeContext.jsx";
import { StorageContext } from "../contexts/StorageContext.jsx";
import { LayerContext } from "../contexts/LayerContext.jsx";
import AppLayout from "../layouts/AppLayout.jsx";

import AppLoader from "../components/AppLoader/AppLoader.jsx";
import GuildsSidebar from "../components/GuildSidebar/GuildsSidebar.jsx";
import Sidebar from "../components/Sidebar/Sidebar.jsx";

import GuildDiscoveryView from "../views/GuildDiscoveryView.jsx";
import GuildTextChannelView from "../views/GuildTextChannelView.jsx";
import NoGuildChannelView from "../views/NoGuildChannelView.jsx";
import SettingsView from "../views/SettingsView.jsx";

import { isMobile, isGecko, applyUserTheme } from "../utils/index.js";
import { layerTransition, useBaseLayerStyle } from "../utils/animations.js";

const AnimatedAppLayout = animated(AppLayout);

export function App() {
    const { isGuildChannelRoute, isGuildDiscoveryRoute, goToGuildDiscovery, goToLogin, guildChannelRouteParams } = useContext(RouteContext);
    const { setAppBadge, clearAppBadge } = useContext(AppBadgeContext);
    const { layers, closeLayer } = useContext(LayerContext);
    const storage = useContext(StorageContext);

    const baseLayerStyle = useBaseLayerStyle(layers.length > 0);
    const layerTransitions = useTransition(layers, layerTransition);

    const [isReady, setIsReady] = useState(false);
    const [client] = useState(() => {
        const instanceConfig = storage.getInstanceConfig();
        const envConfigExists = import.meta.env.VITE_API_VERSION && import.meta.env.VITE_API_URL && import.meta.env.VITE_CDN_URL;
        if (!instanceConfig && !envConfigExists) return goToLogin();

        const client = new Client({
            compress: instanceConfig?.compress === "snappy",
            capabilities: Object.values(CapabilitiesBitField.Flags).reduce((prev, curr) => prev | curr, 0),
            debug: true,
            rest: {
                base: document.location.origin,
                api: import.meta.env.VITE_API_URL ?? instanceConfig.api,
                cdn: import.meta.env.VITE_CDN_URL ?? instanceConfig.cdn,
                version: import.meta.env.VITE_API_VERSION ?? instanceConfig.version
            },
            ws: {
                version: import.meta.env.VITE_API_VERSION ?? instanceConfig.version
            }
        });

        if (import.meta.env.DEV) {
            window.client = client;
        };

        return client;
    });
    const [springValues, springRef] = useSpring(() => ({
        x: isMobile() ? window.innerWidth : 0,
        config: {
            tension: 300,
            bounce: 0,
            easing: easings.easeOutExpo
        }
    }));

    const openView = () => isMobile() && springRef.start({ x: window.innerWidth, immediate: false });
    const closeView = () => isMobile() && springRef.start({ x: 0, immediate: false });

    useEffect(() => {
        document.documentElement.classList.toggle("is-mobile", isMobile());
        document.documentElement.classList.add(isGecko() ? "no-webkit-scrollbar" : "has-webkit-scrollbar");
        applyUserTheme(storage.getUserSettings());
    }, [storage]);

    useEffect(() => {
        const queryToken = new URLSearchParams(window.location.search).get("token");
        if (queryToken) {
            storage.setToken(queryToken);

            const url = new URL(window.location.href);
            url.searchParams.delete("token");
            window.history.replaceState(null, "", url.pathname + url.search + url.hash);
        };

        const token = import.meta.env.VITE_TOKEN ?? storage.getToken();
        if (token) {
            client.login(token);
        } else {
            return goToLogin();
        };

        const readyHandler = () => {
            storage.setUserSettings(client.settings);

            storage.addAccount({
                userId: client.user.id,
                username: client.user.username,
                avatarUrl: client.user.displayAvatarURL(),
                token: client.token,
                instanceConfig: storage.getInstanceConfig()
            });

            applyUserTheme(client.settings);

            if (!isGuildChannelRoute && !isGuildDiscoveryRoute) goToGuildDiscovery();

            setAppBadge();
            setIsReady(true);

            // new Audio("/assets/sounds/discordo.mp3").play().catch(() => { });
        };

        const disconnectHandler = () => {
            clearAppBadge();
            setIsReady(false);
        };

        const userSettingsHandler = (newUserSettings) => {
            if (newUserSettings.theme || newUserSettings.backgroundGradientPreset) {
                applyUserTheme(client.settings);
            };
            storage.setUserSettings(newUserSettings);
        };

        client.on(Events.Ready, readyHandler);
        client.on(Events.ShardResume, readyHandler);
        client.on(Events.ShardDisconnect, disconnectHandler);
        client.on(Events.UserSettingsUpdate, userSettingsHandler);

        return () => {
            client.removeListener(Events.Ready, readyHandler);
            client.removeListener(Events.ShardResume, readyHandler);
            client.removeListener(Events.ShardDisconnect, disconnectHandler);
            client.removeListener(Events.UserSettingsUpdate, userSettingsHandler);
        };
    }, [client]);

    useEffect(() => {
        if (!isReady) return document.title = "Rigel";
        if (isGuildChannelRoute) {
            const guild = client.guilds.cache.get(guildChannelRouteParams.guildId);
            if (!guild) return;
            const channel = guild.channels.cache.get(guildChannelRouteParams.channelId);
            document.title = channel ? `Rigel | #${channel.name} | ${guild.name}` : `Rigel | ${guild.name}`;
        } else if (isGuildDiscoveryRoute) {
            document.title = "Rigel | Serveurs";
        };
    }, [isReady, isGuildDiscoveryRoute, guildChannelRouteParams]);

    useEffect(() => {
        if (isReady) setAppBadge(client.readStates.totalMentions);
    }, [client?.readStates?.totalMentions]);

    const bindDrag = useDrag(({ last, velocity: [vx], direction: [dx], offset: [ox] }) => {
        const clampedX = Math.max(0, Math.min(ox, window.innerWidth));

        if (!last) {
            springRef.start({ x: clampedX, immediate: true });
            return;
        };

        if (Math.abs(vx) > 0.5) {
            dx > 0 ? openView() : closeView();
            return;
        };

        clampedX > window.innerWidth * 0.5 ? openView() : closeView();
    }, {
        pointer: { touch: true },
        axis: "x",
        filterTaps: true,
        from: () => [springValues.x.get(), 0]
    });

    return (
        <>
            <svg viewBox="0 0 1 1" style="position: absolute; pointer-events: none; top: -1px; left: -1px; width: 1px; height: 1px;">
                <mask viewBox="0 0 1 1" id="svg-mask-avatar-status-round-80" maskContentUnits="objectBoundingBox">
                    <circle fill="white" cx="0.5" cy="0.5" r="0.5" />
                    <circle fill="black" cx="0.85" cy="0.85" r="0.175" />
                </mask>
                <mask viewBox="0 0 1 1" id="svg-mask-status-online" maskContentUnits="objectBoundingBox">
                    <circle fill="white" cx="0.5" cy="0.5" r="0.5" />
                </mask>
                <mask viewBox="0 0 1 1" id="svg-mask-status-idle" maskContentUnits="objectBoundingBox">
                    <circle fill="white" cx="0.5" cy="0.5" r="0.5" />
                    <circle fill="black" cx="0.25" cy="0.25" r="0.375" />
                </mask>
                <mask viewBox="0 0 1 1" id="svg-mask-status-dnd" maskContentUnits="objectBoundingBox">
                    <circle fill="white" cx="0.5" cy="0.5" r="0.5" />
                    <rect fill="black" x="0.125" y="0.375" width="0.75" height="0.25" rx="0.125" ry="0.125" />
                </mask>
                <mask viewBox="0 0 1 1" id="svg-mask-status-offline" maskContentUnits="objectBoundingBox">
                    <circle fill="white" cx="0.5" cy="0.5" r="0.5" />
                    <circle fill="black" cx="0.5" cy="0.5" r="0.25" />
                </mask>
                <mask viewBox="0 0 1 1" id="svg-mask-status-typing" maskContentUnits="objectBoundingBox">
                    <rect fill="white" cx="0" cy="0" width="1" height="1" ry="0.5" rx="0.2" />
                </mask>
            </svg>
            <AppLoader ready={isReady} />
            {isReady && (
                isMobile() ? (
                    <AnimatedAppLayout layer="base" style={{ ...baseLayerStyle, touchAction: "pan-y" }} {...bindDrag()}>
                        <GuildsSidebar client={client} />
                        <Sidebar client={client} />
                        <animated.div className="view-wrapper" style={{ x: springValues.x }}>
                            <Route path="/channels/:guildId/:channelId?">
                                {(params) => {
                                    const guild = client.guilds.cache.get(params.guildId);
                                    if (!guild) return <NoGuildChannelView />;
                                    const channel = guild.channels.cache.get(params.channelId);
                                    if (!channel) return <NoGuildChannelView />;
                                    return <GuildTextChannelView client={client} channelId={params.channelId} />;
                                }}
                            </Route>
                            <Route path="/guild-discovery">
                                <GuildDiscoveryView client={client} />
                            </Route>
                        </animated.div>
                    </AnimatedAppLayout>
                ) : (
                    <AnimatedAppLayout layer="base" style={baseLayerStyle}>
                        <GuildsSidebar client={client} />
                        <Sidebar client={client} />
                        <animated.div className="view-wrapper" style={{ x: springValues.x }}>
                            <Route path="/channels/:guildId/:channelId?">
                                {(params) => {
                                    const guild = client.guilds.cache.get(params.guildId);
                                    if (!guild) return <NoGuildChannelView />;
                                    const channel = guild.channels.cache.get(params.channelId);
                                    if (!channel || !channel.viewable) return <NoGuildChannelView />;
                                    return <GuildTextChannelView client={client} channelId={params.channelId} />;
                                }}
                            </Route>
                            <Route path="/guild-discovery">
                                <GuildDiscoveryView client={client} />
                            </Route>
                        </animated.div>
                    </AnimatedAppLayout>
                )
            )}
            {layerTransitions((style, item) => {
                if (item.name === "Settings") {
                    return (
                        <animated.div className="app-layer" style={{ ...style, position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 1000 }}>
                            <SettingsView onClose={closeLayer} {...item.props}/>
                        </animated.div>
                    );
                }
                return null;
            })}
        </>
    );
};

export default App;