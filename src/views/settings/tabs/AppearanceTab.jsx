import { useState, useEffect } from "preact/hooks";
import classNames from "classnames";
import { Events } from "rigel.js";

import styles from "./AppearanceTab.module.css";
import settingsStyles from "../../SettingsView.module.css";
import * as Icons from "../../../icons/Icons.jsx";

const BASE_THEMES = [
    { id: "light", title: "Clair", background: "var(--white-500)" },
    { id: "dark", title: "Sombre", background: "var(--primary-600)" },
    { id: "auto", title: "Synchroniser avec l'ordinateur", background: "var(--primary-600)" }
];

const BACKGROUND_GRADIENT_PRESETS = [
    {
        id: "mint-apple",
        title: "Pomme-menthe",
        theme: "light",
        background: "var(--bg-light-overlay), linear-gradient(180deg, var(--bg-gradient-mint-apple-1) 6.15%, var(--bg-gradient-mint-apple-2) 48.7%, var(--bg-gradient-mint-apple-3) 93.07%)"
    },
    {
        id: "citrus-sherbert",
        title: "Sorbet au citron",
        theme: "light",
        background: "var(--bg-light-overlay), linear-gradient(180deg, var(--bg-gradient-citrus-sherbert-1) 31.1%, var(--bg-gradient-citrus-sherbert-2) 67.09%)"
    },
    {
        id: "retro-raincloud",
        title: "Nuage rétro",
        theme: "light",
        background: "var(--bg-light-overlay), linear-gradient(148.71deg, var(--bg-gradient-retro-raincloud-1) 5.64%, var(--bg-gradient-retro-raincloud-2) 26.38%, var(--bg-gradient-retro-raincloud-2) 49.92%, var(--bg-gradient-retro-raincloud-1) 73.12%)"
    },
    {
        id: "hanami",
        title: "Pétales de cerisier",
        theme: "light",
        background: "var(--bg-light-overlay), linear-gradient(38.08deg, var(--bg-gradient-hanami-1) 3.56%, var(--bg-gradient-hanami-2) 35.49%, var(--bg-gradient-hanami-3) 68.78%)"
    },
    {
        id: "sunrise",
        title: "Lever du jour",
        theme: "light",
        background: "var(--bg-light-overlay), linear-gradient(154.19deg, var(--bg-gradient-sunrise-1) 8.62%, var(--bg-gradient-sunrise-2) 48.07%, var(--bg-gradient-sunrise-3) 76.04%)"
    },
    {
        id: "cotton-candy",
        title: "Barbe à papa",
        theme: "light",
        background: "var(--bg-light-overlay), linear-gradient(180.14deg, var(--bg-gradient-cotton-candy-1) 8.5%, var(--bg-gradient-cotton-candy-2) 94.28%)"
    },
    {
        id: "lofi-vibes",
        title: "Ambiance lo-fi",
        theme: "light",
        background: "var(--bg-light-overlay), linear-gradient(179.52deg, var(--bg-gradient-lofi-vibes-1) 7.08%, var(--bg-gradient-lofi-vibes-2) 34.94%, var(--bg-gradient-lofi-vibes-3) 65.12%, var(--bg-gradient-lofi-vibes-4) 96.23%)"
    },
    {
        id: "desert-khaki",
        title: "Désert kaki",
        theme: "light",
        background: "var(--bg-light-overlay), linear-gradient(38.99deg, var(--bg-gradient-desert-khaki-1) 12.92%, var(--bg-gradient-desert-khaki-2) 32.92%, var(--bg-gradient-desert-khaki-3) 52.11%)"
    },
    {
        id: "sunset",
        title: "Coucher de soleil",
        theme: "dark",
        background: "var(--bg-dark-overlay), linear-gradient(141.68deg, var(--bg-gradient-sunset-1) 27.57%, var(--bg-gradient-sunset-2) 71.25%)"
    },
    {
        id: "chroma-glow",
        title: "Lueur chromée",
        theme: "dark",
        background: "var(--bg-dark-overlay), linear-gradient(128.92deg, var(--bg-gradient-chroma-glow-1) 3.94%, var(--bg-gradient-chroma-glow-2) 26.1%, var(--bg-gradient-chroma-glow-3) 39.82%, var(--bg-gradient-chroma-glow-4) 56.89%, var(--bg-gradient-chroma-glow-5) 76.45%)"
    },
    {
        id: "forest",
        title: "Forêt",
        theme: "dark",
        background: "var(--bg-dark-overlay), linear-gradient(162.27deg, var(--bg-gradient-forest-1) 11.2%, var(--bg-gradient-forest-2) 29.93%, var(--bg-gradient-forest-3) 48.64%, var(--bg-gradient-forest-4) 67.85%, var(--bg-gradient-forest-5) 83.54%)"
    },
    {
        id: "crimson-moon",
        title: "Lune carmin",
        theme: "dark",
        background: "var(--bg-dark-overlay), linear-gradient(64.92deg, var(--bg-gradient-crimson-moon-1) 16.17%, var(--bg-gradient-crimson-moon-2) 72%)"
    },
    {
        id: "midnight-blurple",
        title: "Viobleu de minuit",
        theme: "dark",
        background: "var(--bg-dark-overlay), linear-gradient(48.17deg, var(--bg-gradient-midnight-blurple-1) 11.21%, var(--bg-gradient-midnight-blurple-2) 61.92%)"
    },
    {
        id: "mars",
        title: "Mars",
        theme: "dark",
        background: "var(--bg-dark-overlay), linear-gradient(170.82deg, var(--bg-gradient-mars-1) 14.61%, var(--bg-gradient-mars-2) 74.62%)"
    },
    {
        id: "dusk",
        title: "Crépuscule",
        theme: "dark",
        background: "var(--bg-dark-overlay), linear-gradient(180deg, var(--bg-gradient-dusk-1) 12.84%, var(--bg-gradient-dusk-2) 85.99%)"
    },
    {
        id: "under-the-sea",
        title: "Sous les mers",
        theme: "dark",
        background: "var(--bg-dark-overlay), linear-gradient(179.14deg, var(--bg-gradient-under-the-sea-1) 1.91%, var(--bg-gradient-under-the-sea-2) 48.99%, var(--bg-gradient-under-the-sea-3) 96.35%)"
    },
    {
        id: "retro-storm",
        title: "Tempête rétro",
        theme: "dark",
        background: "var(--bg-dark-overlay), linear-gradient(148.71deg, var(--bg-gradient-retro-storm-1) 5.64%, var(--bg-gradient-retro-storm-2) 26.38%, var(--bg-gradient-retro-storm-2) 49.92%, var(--bg-gradient-retro-storm-1) 73.12%)"
    },
    {
        id: "neon-nights",
        title: "Nuits néon",
        theme: "dark",
        background: "var(--bg-dark-overlay), linear-gradient(180deg, var(--bg-gradient-neon-nights-1) 0%, var(--bg-gradient-neon-nights-2) 50%, var(--bg-gradient-neon-nights-3) 100%)"
    },
    {
        id: "strawberry-lemonade",
        title: "Limonade à la fraise",
        theme: "dark",
        background: "var(--bg-dark-overlay), linear-gradient(161.03deg, var(--bg-gradient-strawberry-lemonade-1) 18.79%, var(--bg-gradient-strawberry-lemonade-2) 49.76%, var(--bg-gradient-strawberry-lemonade-3) 80.72%)"
    },
    {
        id: "aurora",
        title: "Aurore",
        theme: "dark",
        background: "var(--bg-dark-overlay), linear-gradient(239.16deg, var(--bg-gradient-aurora-1) 10.39%, var(--bg-gradient-aurora-2) 26.87%, var(--bg-gradient-aurora-3) 48.31%, var(--bg-gradient-aurora-4) 64.98%, var(--bg-gradient-aurora-5) 92.5%)"
    },
    {
        id: "sepia",
        title: "Sépia",
        theme: "dark",
        background: "var(--bg-dark-overlay), linear-gradient(69.98deg, var(--bg-gradient-sepia-1) 14.14%, var(--bg-gradient-sepia-2) 60.35%)"
    },
    {
        id: "blurple-twilight",
        title: "Crépuscule viobleu",
        theme: "dark",
        background: "var(--bg-dark-overlay), linear-gradient(47.61deg, var(--bg-gradient-blurple-twilight-1) 11.18%, var(--bg-gradient-blurple-twilight-2) 64.54%)"
    }
];

export default function Appearance({ client }) {
    const [theme, setTheme] = useState(client.settings.theme);
    const [backgroundGradientPreset, setBackgroundGradientPreset] = useState(client.settings.backgroundGradientPreset);

    useEffect(() => {
        const handleUserSettingsUpdate = (settings) => {
            setTheme(settings.theme);
            setBackgroundGradientPreset(settings.backgroundGradientPreset);
        };

        client.on(Events.UserSettingsUpdate, handleUserSettingsUpdate);
        return () => client.removeListener(Events.UserSettingsUpdate, handleUserSettingsUpdate);
    }, [client]);

    return (
        <div>
            <h1 className={settingsStyles.tabTitle}>Apparence</h1>
            <div className={settingsStyles.section}>
                <h3 className={settingsStyles.sectionTitle}>Thèmes</h3>
                <div className={styles.presets}>
                    {BASE_THEMES.map(baseTheme => (
                        <div 
                            key={baseTheme.id}
                            className={styles.themeContainer} 
                            onClick={() => client.settings.setTheme(baseTheme.id)}
                        >
                            <div 
                                className={classNames(styles.theme, styles.baseTheme)} 
                                style={{ background: baseTheme.background }} 
                                title={baseTheme.title}
                            ></div>
                            {theme === baseTheme.id && !backgroundGradientPreset && (
                                <div className={styles.circle}>
                                    <div className={styles.icon}>
                                        <Icons.Check/>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            <div className={settingsStyles.section}>
                <h3 className={settingsStyles.sectionTitle}>Couleurs</h3>
                <div className={styles.presets}>
                    {BACKGROUND_GRADIENT_PRESETS.map((preset) => (
                        <div 
                            key={preset.id}
                            className={styles.themeContainer} 
                            onClick={() => client.settings.setTheme(preset.theme, preset.id)}
                        >
                            <div 
                                className={styles.theme} 
                                style={{ background: preset.background }} 
                                title={preset.title}
                            ></div>
                            {backgroundGradientPreset === preset.id && (
                                <div className={styles.circle}>
                                    <div className={styles.icon}>
                                        <Icons.Check/>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};