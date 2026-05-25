import { useState, useRef, useEffect, useMemo, useContext } from "preact/hooks";
import { createPortal } from "preact/compat";
import { PresenceUpdateStatus } from "rigel.js";

import { LayerContext } from "../../contexts/LayerContext";
import styles from "./SidebarPanel.module.css";
import * as Icons from "../../icons/Icons";
import CurrentUserProfilePopout from "../UserProfilePopout/CurrentUserProfilePopout";

export default function SidebarPanel({ client }) {
    const { openLayer } = useContext(LayerContext);
    const [showProfile, setShowProfile] = useState(false);
    const panelRef = useRef(null);
    const cardRef = useRef(null);

    const statusText = useMemo(() => {
        switch (client.presence.status) {
            case PresenceUpdateStatus.Online: return "En ligne";
            case PresenceUpdateStatus.DoNotDisturb: return "Ne par déranger";
            case PresenceUpdateStatus.Idle: return "Inactif";
            case PresenceUpdateStatus.Invisible: return "Invisible";
        };
    }, [client?.presence?.status]);

    useEffect(() => {
        if (!showProfile) return;

        const handleClick = (evt) => {
            if (cardRef.current && !cardRef.current.contains(evt.target)) {
                setShowProfile(false);
            };
        };

        const handleKeyDown = (evt) => {
            if (evt.key === "Escape") {
                setShowProfile(false);
            };
        };

        const timeoutId = setTimeout(() => {
            document.addEventListener("click", handleClick);
            document.addEventListener("contextmenu", handleClick);
            document.addEventListener("keydown", handleKeyDown);
        }, 0);

        return () => {
            clearTimeout(timeoutId);
            document.removeEventListener("click", handleClick);
            document.removeEventListener("contextmenu", handleClick);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [showProfile]);

    const handleAvatarClick = () => {
        setShowProfile(!showProfile);
    };

    return (
        <>
            <div className={styles.panel} ref={panelRef}>
                <div className={styles.avatarWrapper} onClick={handleAvatarClick}>
                    <img src={client.user.displayAvatarURL()} className={styles.avatar}/>
                    <div className={styles.namesContainer}>
                        <span className={styles.username}>{client.user.displayName}</span>
                        <div className={styles.hoverRoll}>
                            <span className={styles.hovered}>{statusText}</span>
                            <span className={styles.default}>{client.user.tag}</span>
                        </div>
                    </div>
                </div>
                <button className={styles.btnUserSettings} title="Paramètres utilisateurs" onClick={() => openLayer("Settings", { client })}>
                    <Icons.Settings/>
                </button>
            </div>
            {showProfile && createPortal(
                <div 
                    ref={cardRef}
                    style={{ 
                        position: "fixed", 
                        left: "50px", 
                        bottom: "62px",
                        zIndex: 1000
                    }}
                >
                    <CurrentUserProfilePopout client={client} />
                </div>,
                document.body
            )}
        </>
    );
};