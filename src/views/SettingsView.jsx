import { useState, useEffect, useContext } from "preact/hooks";
import classNames from "classnames";

import styles from "./SettingsView.module.css";
import * as Icons from "../icons/Icons";

import { RouteContext } from "../contexts/RouteContext";
import { StorageContext } from "../contexts/StorageContext";
import { isMobile } from "../utils/index.js";

import SlideLayout from "../layouts/SlideLayout";

import MyAccountTab from "./settings/tabs/MyAccountTab.jsx";
import ProfileTab from "./settings/tabs/ProfileTab.jsx";
import DevicesTab from "./settings/tabs/DevicesTab.jsx";
import BotsTab from "./settings/tabs/BotsTab.jsx";
import AppearanceTab from "./settings/tabs/AppearanceTab.jsx";
import NotificationsTab from "./settings/tabs/NotificationsTab.jsx";
import LanguageTab from "./settings/tabs/LanguageTab.jsx";
import AdvancedTab from "./settings/tabs/AdvancedTab.jsx";

export default function SettingsView({ client, onClose }) {
    const { goToLogin } = useContext(RouteContext);
    const storage = useContext(StorageContext);
    const [activeTab, setActiveTab] = useState("my-account");
    const [currentSlide, setCurrentSlide] = useState(isMobile() ? 0 : 1);

    useEffect(() => {
        const handleKeyDown = (evt) => {
            if (evt.key === "Escape") {
                onClose();
            };
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    const handleLogout = async () => {
        if (confirm("Tu es sûr(e) de vouloir te déconnecter ?")) {
            await client.logout();
            storage.safeClear();
            goToLogin();
        };
    };

    const handleTabClick = (tab) => {
        setActiveTab(tab);
        if (isMobile()) {
            setCurrentSlide(1);
        };
    };

    const showSidebar = () => {
        if (isMobile()) {
            setCurrentSlide(0);
        };
    };

    return (
        <div className={styles.container}>
            {isMobile() ? (
                <SlideLayout currentSlide={currentSlide}>
                    {/* Slide 0: Sidebar */}
                    <div className={styles.slideWrapper}>
                        <div className={styles.mobileHeaderSidebar}>
                            <span className={styles.mobileTitle}>Paramètres</span>
                            <button className={styles.closeButton} onClick={onClose}>
                                <Icons.Close className={styles.icon}/>
                            </button>
                        </div>
                        <div className={classNames(styles.sidebarContent, "scrollbar-thin", "scrollbar-fade")}>
                            <div className={styles.header}>Paramètres utilisateur</div>
                            <div 
                                className={classNames(styles.item, { [styles.selected]: activeTab === "my-account" })}
                                onClick={() => handleTabClick("my-account")}
                            >
                                Mon compte
                            </div>
                            <div 
                                className={classNames(styles.item, { [styles.selected]: activeTab === "profile" })}
                                onClick={() => handleTabClick("profile")}
                            >
                                Profil
                            </div>
                            <div 
                                className={classNames(styles.item, { [styles.selected]: activeTab === "devices" })}
                                onClick={() => handleTabClick("devices")}
                            >
                                Appareils
                            </div>
                            <div className={styles.separator}></div>
                            <div className={styles.header}>Paramètres de l'appli</div>
                            <div 
                                className={classNames(styles.item, { [styles.selected]: activeTab === "appearance" })}
                                onClick={() => handleTabClick("appearance")}
                            >
                                Apparence
                            </div>
                            <div 
                                className={classNames(styles.item, { [styles.selected]: activeTab === "notifications" })}
                                onClick={() => handleTabClick("notifications")}
                            >
                                Notifications
                            </div>
                            <div 
                                className={classNames(styles.item, { [styles.selected]: activeTab === "language" })}
                                onClick={() => handleTabClick("language")}
                            >
                                Langue
                            </div>
                            <div 
                                className={classNames(styles.item, { [styles.selected]: activeTab === "advanced" })}
                                onClick={() => handleTabClick("advanced")}
                            >
                                Avancés
                            </div>
                            <div className={styles.separator}></div>
                            <div className={styles.header}>Portail des développeurs</div>
                            <div 
                                className={classNames(styles.item, { [styles.selected]: activeTab === "bots" })}
                                onClick={() => handleTabClick("bots")}
                            >
                                Bots
                            </div>
                            <div className={styles.separator}></div>
                            <div className={styles.item} onClick={handleLogout}>
                                Déconnexion
                                <Icons.Logout className={styles.icon}/>
                            </div>
                            <div className={styles.separator}></div>
                            <div className={styles.info}>
                                <span>{__APP_ENV__} {__APP_VERSION__} ({__COMMIT_HASH__})</span>
                            </div>
                        </div>
                    </div>

                    {/* Slide 1: Content */}
                    <div className={styles.slideWrapper}>
                        <div className={styles.mobileHeader}>
                            <button className={styles.menuButton} onClick={showSidebar}>
                                <Icons.Back className={styles.icon}/>
                            </button>
                            <span className={styles.mobileTitle}>Paramètres</span>
                            <button className={styles.closeButton} onClick={onClose}>
                                <Icons.Close className={styles.icon}/>
                            </button>
                        </div>
                        <div className={classNames(styles.contentWrapper, "scrollbar-auto")}>
                            {activeTab === "my-account" && <MyAccountTab client={client}/>}
                            {activeTab === "profile" && <ProfileTab client={client}/>}
                            {activeTab === "devices" && <DevicesTab client={client}/>}
                            {activeTab === "bots" && <BotsTab client={client}/>}
                            {activeTab === "appearance" && <AppearanceTab client={client}/>}
                            {activeTab === "notifications" && <NotificationsTab client={client}/>}
                            {activeTab === "language" && <LanguageTab client={client}/>}
                            {activeTab === "advanced" && <AdvancedTab client={client}/>}
                        </div>
                    </div>
                </SlideLayout>
            ) : (
                <>
                    <div className={classNames(styles.sidebarRegion, "scrollbar-thin", "scrollbar-fade")}>
                        <div className={styles.sidebar}>
                            <div className={styles.header}>Paramètres utilisateur</div>
                            <div 
                                className={classNames(styles.item, { [styles.selected]: activeTab === "my-account" })}
                                onClick={() => handleTabClick("my-account")}
                            >
                                Mon compte
                            </div>
                            <div 
                                className={classNames(styles.item, { [styles.selected]: activeTab === "profile" })}
                                onClick={() => handleTabClick("profile")}
                            >
                                Profil
                            </div>
                            <div 
                                className={classNames(styles.item, { [styles.selected]: activeTab === "devices" })}
                                onClick={() => handleTabClick("devices")}
                            >
                                Appareils
                            </div>
                            <div className={styles.separator}></div>
                            <div className={styles.header}>Paramètres de l'appli</div>
                            <div 
                                className={classNames(styles.item, { [styles.selected]: activeTab === "appearance" })}
                                onClick={() => handleTabClick("appearance")}
                            >
                                Apparence
                            </div>
                            <div 
                                className={classNames(styles.item, { [styles.selected]: activeTab === "notifications" })}
                                onClick={() => handleTabClick("notifications")}
                            >
                                Notifications
                            </div>
                            <div 
                                className={classNames(styles.item, { [styles.selected]: activeTab === "language" })}
                                onClick={() => handleTabClick("language")}
                            >
                                Langue
                            </div>
                            <div 
                                className={classNames(styles.item, { [styles.selected]: activeTab === "advanced" })}
                                onClick={() => handleTabClick("advanced")}
                            >
                                Avancés
                            </div>
                            <div className={styles.separator}></div>
                            <div className={styles.header}>Portail des développeurs</div>
                            <div 
                                className={classNames(styles.item, { [styles.selected]: activeTab === "bots" })}
                                onClick={() => handleTabClick("bots")}
                            >
                                Bots
                            </div>
                            <div className={styles.separator}></div>
                            <div className={styles.item} onClick={handleLogout}>
                                Déconnexion
                                <Icons.Logout className={styles.icon}/>
                            </div>
                            <div className={styles.separator}></div>
                            <div className={styles.info}>
                                <span>{__APP_ENV__} {__APP_VERSION__} ({__COMMIT_HASH__})</span>
                            </div>
                        </div>
                    </div>
                    <div className={classNames(styles.contentRegion, "scrollbar-auto")}>
                        <div className={styles.content}>
                            {activeTab === "my-account" && <MyAccountTab client={client}/>}
                            {activeTab === "profile" && <ProfileTab client={client}/>}
                            {activeTab === "devices" && <DevicesTab client={client}/>}
                            {activeTab === "bots" && <BotsTab client={client}/>}
                            {activeTab === "appearance" && <AppearanceTab client={client}/>}
                            {activeTab === "notifications" && <NotificationsTab client={client}/>}
                            {activeTab === "language" && <LanguageTab client={client}/>}
                            {activeTab === "advanced" && <AdvancedTab client={client}/>}
                        </div>
                        <div className={styles.toolsContainer}>
                            <div className={styles.closeContainer}>
                                <div className={styles.closeBtn} onClick={onClose}>
                                    <Icons.Close className={styles.icon}/>
                                </div>
                                <span className={styles.keybind}>ESC</span>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};