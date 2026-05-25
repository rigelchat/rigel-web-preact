import { useId, useState, useEffect } from "preact/hooks";
import classNames from "classnames";
import { Events } from "rigel.js";

import styles from "./LanguageTab.module.css";
import settingsStyles from "../../SettingsView.module.css";
import Emoji from "../../../components/Emoji/Emoji.jsx";

const LANGUAGES = [
    {
        value: "en-US",
        emojiLabel: "flag: united states"
    },
    {
        value: "fr",
        emojiLabel: "flag: france"
    }
];

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

export default function Language({ client }) {
    const baseId = useId();
    const [currentLocale, setCurrentLocale] = useState(client.settings.locale);

    useEffect(() => {
        const handleUserSettingsUpdate = (settings) => {
            setCurrentLocale(settings.locale);
        };

        client.on(Events.UserSettingsUpdate, handleUserSettingsUpdate);
        return () => client.removeListener(Events.UserSettingsUpdate, handleUserSettingsUpdate);
    }, [client]);

    const handleLocaleChange = (locale) => {
        client.settings.edit({ locale });
    };

    const displayNames = new Intl.DisplayNames([currentLocale], { type: "language", languageDisplay: "standard" });

    return (
        <div>
            <h1 className={settingsStyles.tabTitle}>Langue</h1>
            <h3 className={settingsStyles.sectionTitle}>Sélectionne une langue</h3>
            <div className={styles.languages}>
                {LANGUAGES.map((lang) => {
                    const id = `${baseId}-${lang.value}`;
                    const isSelected = currentLocale === lang.value;

                    const localeName = capitalize(new Intl.DisplayNames([lang.value], { type: "language", languageDisplay: "standard" }).of(lang.value));
                    const localizedName = capitalize(displayNames.of(lang.value));

                    return (
                        <label 
                            key={lang.value} 
                            htmlFor={id} 
                            className={classNames(styles.item, { [styles.selected]: isSelected })}
                        >
                            <input 
                                type="radio"
                                id={id}
                                value={lang.value}
                                checked={isSelected}
                                onChange={() => handleLocaleChange(lang.value)}
                            />
                            <span className={styles.localeName}>{localeName}</span>
                            <span className={styles.localizedName}>{localizedName}</span>
                            <Emoji label={lang.emojiLabel}/>
                        </label>
                    );
                })}
            </div>
        </div>
    );
};