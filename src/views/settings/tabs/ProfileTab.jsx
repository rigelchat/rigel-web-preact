import { useState, useEffect, useMemo, useRef } from "preact/hooks";
import { extractPalette, selectProfileColors, rgb2dec, dec2hex, hex2dec } from "../../../utils/color.js";

import styles from "./ProfileTab.module.css";
import settingsStyles from "../../SettingsView.module.css";
import popoutStyles from "../../../components/UserProfilePopout/UserProfilePopout.module.css";
import Input from "../../../components/Input/Input.jsx";
import Button from "../../../components/Button/Button.jsx"
import SaveBar from "../../../components/SaveBar/SaveBar.jsx";
import ColorInput from "../../../components/ColorInput/ColorInput.jsx";
import SegmentedControl from "../../../components/SegmentedControl/SegmentedControl.jsx";
import useUnsavedChanges from "../../../hooks/useUnsavedChanges.js";
import UserProfilePopout from "../../../components/UserProfilePopout/UserProfilePopout.jsx";

export default function Profile({ client }) {
    const [profile, setProfile] = useState(client.user.profile);
    const [tick, setTick] = useState(0);
    const avatarInputRef = useRef();
    const bannerInputRef = useRef();

    useEffect(() => {
        client.user.profile.fetch().then(p => {
            setProfile(p);
            setTick((t) => t + 1);
        });
    }, [client]);

    const initialData = useMemo(() => {
        return {
            globalName: client.user.globalName,
            pronouns: profile?.pronouns,
            bio: profile?.bio,
            themeColors: profile?.themeColors,
            accentColor: profile?.accentColor,
            avatar: client.user.displayAvatarURL({ size: 128 }),
            banner: client.user.bannerURL({ size: 512 })
        };
    }, [profile, tick, client.user.globalName, client.user.avatar, client.user.banner]);

    const handleSave = async (data, changed) => {
        const newUser = {};
        const newUserProfile = {};

        for (const key in changed) {
            if (["globalName", "avatar", "banner"].includes(key)) {
                newUser[key] = data[key];
            } else if (["bio", "themeColors", "pronouns", "accentColor"].includes(key)) {
                newUserProfile[key] = data[key];
            };
        };

        const promises = [];
        if (Object.keys(newUser).length > 0) promises.push(client.user.edit(newUser));
        if (Object.keys(newUserProfile).length > 0) promises.push(client.user.profile.edit(newUserProfile));

        await Promise.all(promises);
        await client.user.profile.fetch();
        setTick((t) => t + 1);
    };

    const { data, updateField, hasChanges, reset, save, isSaving } = useUnsavedChanges(initialData, handleSave);

    const handleFileChange = (field, evt) => {
        const [file] = evt.target.files;
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => updateField(field, reader.result);
        reader.readAsDataURL(file);
    };

    const handleTabChange = async (tab) => {
        updateField("accentColor", null);
        updateField("themeColors", null);

        switch (tab) {
            case "accent": {
                const colors = await extractPalette(data.avatar || client.user.defaultAvatarURL, 10);
                const [c] = selectProfileColors(colors);
                updateField("accentColor", rgb2dec(c.r, c.g, c.b));
            }; break;

            case "theme": {
                const colors = await extractPalette(data.avatar || client.user.defaultAvatarURL, 10);
                const selected = selectProfileColors(colors);
                updateField("themeColors", selected.map((c) => rgb2dec(c.r, c.g, c.b)));
            }; break;
        };
    };

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.form}>
                    <h1 className={settingsStyles.tabTitle}>Profil</h1>
                    <div className={styles.section}>
                        <h3 className={settingsStyles.sectionTitle}>Nom d'affichage</h3>
                        <Input
                            size="large"
                            type="text"
                            placeholder={client.user.username}
                            value={data.globalName}
                            maxLength="32"
                            onInput={(evt) => updateField("globalName", evt.target.value)}
                        />
                    </div>
                    <div className={styles.section}>
                        <h3 className={settingsStyles.sectionTitle}>Pronoms</h3>
                        <Input
                            size="large"
                            type="text"
                            placeholder="Ajoute tes pronoms"
                            value={data.pronouns}
                            maxLength="40"
                            onInput={(evt) => updateField("pronouns", evt.target.value)}
                        />
                    </div>
                    <div className={styles.section}>
                        <h3 className={settingsStyles.sectionTitle}>Avatar</h3>
                        <div className={styles.buttonContainer}>
                            <Button size="small" onClick={() => avatarInputRef.current.click()}>Changer d'avatar</Button>
                            <Button variant="link" onClick={() => updateField("avatar", null)}>Supprimer l'avatar</Button>
                        </div>
                        <input
                            type="file"
                            ref={avatarInputRef}
                            style={{ display: "none" }}
                            accept="image/*"
                            onChange={(evt) => handleFileChange("avatar", evt)}
                        />
                    </div>
                    <div className={styles.section}>
                        <h3 className={settingsStyles.sectionTitle}>Bannière de profil</h3>
                        <div className={styles.buttonContainer}>
                            <Button size="small" onClick={() => bannerInputRef.current.click()}>Changer de bannière</Button>
                            <Button variant="link" onClick={() => updateField("banner", null)}>Supprimer la bannière</Button>
                        </div>
                        <input
                            type="file"
                            ref={bannerInputRef}
                            style={{ display: "none" }}
                            accept="image/*"
                            onChange={(evt) => handleFileChange("banner", evt)}
                        />
                    </div>
                    <div className={styles.section}>
                        <h3 className={settingsStyles.sectionTitle}>Couleurs de profil</h3>
                        <SegmentedControl
                            options={[
                                { label: "Couleur de bannière", value: "accent" },
                                { label: "Thème de profil", value: "theme" }
                            ]}
                            value={data.themeColors ? "theme" : "accent"}
                            onChange={handleTabChange}
                            className={styles.bannerColorOptions}
                        />
                        {data.themeColors ? (
                            <div className={styles.colorSection}>
                                <div className={styles.colorPickers}>
                                    <div className={styles.colorPickerContainer}>
                                        <ColorInput value={data.themeColors && dec2hex(data.themeColors[0])} onChange={(newColor) => updateField("themeColors", [hex2dec(newColor), data.themeColors[1]])} />
                                        <span className={styles.label}>Primaire</span>
                                    </div>
                                    <div className={styles.colorPickerContainer}>
                                        <ColorInput value={data.themeColors && dec2hex(data.themeColors[1])} onChange={(newColor) => updateField("themeColors", [data.themeColors[0], hex2dec(newColor)])} />
                                        <span className={styles.label}>Secondaire</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className={styles.colorSection}>
                                <div className={styles.colorPickers}>
                                    <div className={styles.colorPickerContainer}>
                                        <ColorInput value={data.accentColor && dec2hex(data.accentColor)} onChange={(newColor) => updateField("accentColor", hex2dec(newColor))} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className={styles.section}>
                        <h3 className={settingsStyles.sectionTitle}>À propos de moi</h3>
                        <textarea
                            className={styles.textarea}
                            rows={5}
                            value={data.bio}
                            onInput={(evt) => updateField("bio", evt.target.value)}
                        ></textarea>
                    </div>
                </div>
                <div className={styles.preview}>
                    <UserProfilePopout
                        client={client}
                        user={{
                            ...client.user,
                            globalName: data.globalName,
                            avatar: data.avatar,
                            banner: data.banner
                        }}
                        profile={{
                            ...profile,
                            ...data
                        }}
                        isPanel={true}
                    />
                </div>
            </div>
            <SaveBar
                show={hasChanges}
                onReset={reset}
                onSave={save}
                isSubmitting={isSaving}
            />
        </div>
    );
};