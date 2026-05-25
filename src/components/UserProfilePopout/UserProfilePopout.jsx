import { useState, useMemo, useEffect } from "preact/hooks";
import { useFormatter } from "../../hooks/useFormatter.js";
import classNames from "classnames";
import { UserFlagsBitField, PresenceUpdateStatus, Events } from "rigel.js";
import { dec2rgb, rgbToHsl } from "../../utils/color.js";
import { parseMarkdownToJSX } from "../../utils/markdown.jsx";

import styles from "./UserProfilePopout.module.css";
import * as Icons from "../../icons/Icons.jsx";
import { WanderingCubesLoader } from "../Loaders/Loaders.jsx";

export default function UserProfilePopout({ client, user: userOverride, profile: profileOverride, children, isPanel }) {
    const user = userOverride || client.user;
    const [userProfile, setUserProfile] = useState(profileOverride || client.users.profiles.get(user.id));
    const [loading, setLoading] = useState(!userProfile && !profileOverride);
    const { dateFormatter } = useFormatter(client.settings.locale);

    useEffect(() => {
        if (profileOverride) {
            setUserProfile(profileOverride);
            setLoading(false);
            return;
        };

        const handleProfileUpdate = (userId, profile) => {
            if (userId === user.id) {
                setUserProfile(profile);
            };
        };

        client.on(Events.UserProfileUpdate, handleProfileUpdate);

        const cached = client.users.profiles.get(user.id);
        if (cached) {
            setUserProfile(cached);
            setLoading(false);
        } else {
            setLoading(true);
            user.profile.fetch().then((profile) => {
                setUserProfile(profile);
            }).finally(() => {
                setLoading(false);
            });
        };

        return () => client.off(Events.UserProfileUpdate, handleProfileUpdate);
    }, [user.id, profileOverride]);

    const profileColors = useMemo(() => {
        if (!userProfile) {
            return {
                primaryHSL: [0, 0, 0],
                secondaryHSL: [0, 0, 0],
                accentHSL: [0, 0, 0],
                highlightHSL: [0, 0, 0]
            };
        };

        const primaryColorRGB = dec2rgb(userProfile.themeColors?.[0] ?? userProfile.accentColor);
        const secondaryColorRGB = dec2rgb(userProfile.themeColors?.[1] ?? userProfile.accentColor);
        const accentColorRGB = dec2rgb(userProfile.accentColor);

        const primaryHSL = rgbToHsl(primaryColorRGB[0], primaryColorRGB[1], primaryColorRGB[2]);
        const secondaryHSL = rgbToHsl(secondaryColorRGB[0], secondaryColorRGB[1], secondaryColorRGB[2]);
        const accentHSL = rgbToHsl(accentColorRGB[0], accentColorRGB[1], accentColorRGB[2]);
        const highlightHSL = [primaryHSL[0], 100, primaryHSL[2] / 2];

        return { primaryHSL, secondaryHSL, accentHSL, highlightHSL };
    }, [userProfile]);

    if (loading) {
        return (
            <div className={styles.loadingPopout} style={{
                position: "fixed",
                bottom: "62px",
                left: "78px"
            }}>
                <WanderingCubesLoader/>
            </div>
        );
    };

    const statusIcon = {
        [PresenceUpdateStatus.Online]: <rect width="16" height="16" x="60" y="60" fill="#23a55a" mask="url(#svg-mask-status-online)"/>,
        [PresenceUpdateStatus.DoNotDisturb]: <rect width="16" height="16" x="60" y="60" fill="#f23f43" mask="url(#svg-mask-status-dnd)"/>,
        [PresenceUpdateStatus.Idle]: <rect width="16" height="16" x="60" y="60" fill="#f0b232" mask="url(#svg-mask-status-idle)"/>,
        [PresenceUpdateStatus.Invisible]: <rect width="16" height="16" x="60" y="60" fill="#80848e" mask="url(#svg-mask-status-offline)"/>,
        [PresenceUpdateStatus.Offline]: <rect width="16" height="16" x="60" y="60" fill="#80848e" mask="url(#svg-mask-status-offline)"/>
    }[client.presence.status];

    const { primaryHSL, secondaryHSL, accentHSL, highlightHSL } = profileColors;
    const isProfileThemed = !!userProfile?.themeColors;
    const isProfileDarkTheme = primaryHSL[2] < 50;
    const hasBanner = !!user.banner;
    const bannerHeight = hasBanner ? 120 : (isProfileThemed ? 90 : 60);

    const bannerURL = userOverride ? user.banner : user.bannerURL({ size: 512 });
    const avatarURL = userOverride ? user.avatar : user.avatarURL({ size: 128 });

    const hsl = (h, s, l) => `hsl(${h}, ${s}%, ${l}%)`;
    const hsla = (h, s, l, a) => `hsla(${h}, ${s}%, ${l}%, ${a})`;

    return (
        <div
            className={classNames(
                isPanel ? styles.userProfilePanelOuter : styles.userProfilePopoutOuter,
                isProfileDarkTheme ? "theme-dark" : "theme-light",
                {
                    [styles.themed]: isProfileThemed,
                    [styles.withBanner]: hasBanner
                }
            )}
            style={{
                "--profile-gradient-primary-color": isProfileThemed ? hsl(...primaryHSL) : "var(--background-secondary-alt)",
                "--profile-gradient-secondary-color": isProfileThemed ? hsl(...secondaryHSL) : "var(--background-secondary-alt)",
                "--profile-gradient-overlay-color": isProfileThemed ? (isProfileDarkTheme ? "hsla(0, 0%, 0%, 0.6)" : "hsla(0, 0%, 100%, 0.6)") : "transparent",
                "--profile-gradient-button-color": isProfileThemed ? hsl(...highlightHSL) : "var(--button-secondary-background)",
                "--profile-body-background-color": isProfileDarkTheme ? "hsla(0, 0%, 0%, 0.45)" : "hsla(0, 0%, 100%, 0.45)",
                "--profile-body-background-hover": isProfileDarkTheme ? "hsla(0, 0%, 100%, 0.16)" : "hsla(0, 0%, 0%, 0.08)",
                "--profile-body-divider-color": isProfileThemed 
                    ? (isProfileDarkTheme ? "hsla(0, 0%, 100%, 0.12)" : hsla(...highlightHSL, 0.12))
                    : "var(--background-modifier-accent)",
            }}
        >
            <div className={styles.userProfilePopoutInner}>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox={`0 0 340 ${bannerHeight}`}
                    className={styles.bannerSVGWrapper}
                    style={{
                        minWidth: "340px",
                        minHeight: `${bannerHeight}px`
                    }}
                >
                    <mask id="banner-mask">
                        <rect fill="white" x="0" y="0" width="100%" height="100%"/>
                        <circle fill="black" cx={isProfileThemed && !isPanel ? 58 : 62} cy={bannerHeight - (isProfileThemed && !isPanel ? 8 : 4)} r="46"/>
                    </mask>
                    <foreignObject x="0" y="0" width="100%" height="100%" overflow="visible" mask="url(#banner-mask)">
                        <div className={styles.banner} style={{
                            backgroundColor: userProfile ? hsl(...primaryHSL) : hsl(...accentHSL),
                            backgroundImage: hasBanner ? `url("${bannerURL}")` : undefined
                        }}/>
                    </foreignObject>
                </svg>
                <div className={styles.avatarWrapper}>
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 92 92" className={styles.avatarSVGWrapper} width="92" height="92">
                        <foreignObject x="0" y="0" width="80" height="80" mask="url(#svg-mask-avatar-status-round-80)">
                            <img src={avatarURL || client.user.defaultAvatarURL} className={styles.avatar}/>
                        </foreignObject>
                        <circle fill={isProfileDarkTheme ? "black" : "white"} r="14" cx="68" cy="68" style={{ opacity: 0.45 }}/>
                        {statusIcon}
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" className={styles.avatarHint} width="80" height="80">
                        <foreignObject x="0" y="0" width="80" height="80" overflow="visible" mask="url(#svg-mask-avatar-status-round-80)">
                            <div className={styles.hintInner}>Voir le profil</div>
                        </foreignObject>
                    </svg>
                </div>
                <div className={classNames(styles.profileBadges, {
                    [styles.withContent]: user.flags?.bitfield > 0
                })}>
                    {user.flags?.has(UserFlagsBitField.Flags.Staff) && <img src="/assets/badges/staff.png" className={styles.badge}/>}
                    {user.flags?.has(UserFlagsBitField.Flags.Partner) && <img src="/assets/badges/partner.png" className={styles.badge}/>}
                    {user.flags?.has(UserFlagsBitField.Flags.VerifiedDeveloper) && <img src="/assets/badges/verified-developer.png" className={styles.badge}/>}
                </div>
                <div className={styles.overlayBackground}>
                    <div className={styles.usernameSection}>
                        <h2 className={styles.nickname}>{user.displayName || user.globalName || user.username}</h2>
                        <div className={styles.userTag}>
                            {user.discriminator === "0" ? (
                                <span>{user.username}</span>
                            ) : (
                                <span>{user.username}#{user.discriminator}</span>
                            )}
                            {userProfile?.pronouns && (
                                <>
                                    <span className={styles.dotSpacer}></span>
                                    <span>{userProfile.pronouns}</span>
                                </>
                            )}
                            {user.bot && (
                                <Icons.BadgeIcons.Bot verified={user.flags.has(UserFlagsBitField.Flags.VerifiedBot)}/>
                            )}
                        </div>
                    </div>
                    <div className={styles.divider}></div>
                    {userProfile?.bio && (
                        <div className={styles.aboutSection}>
                            <h3 className={styles.title}>À propos de moi</h3>
                            <div className="markup">{parseMarkdownToJSX(userProfile.bio)}</div>
                        </div>
                    )}
                    <div className={styles.sinceSection}>
                        <h3 className={styles.title}>Membre depuis</h3>
                        <div className={styles.body}>{dateFormatter.format(user.createdAt || client.user.createdAt)}</div>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
};