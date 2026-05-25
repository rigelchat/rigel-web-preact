import { useEffect, useState } from "preact/hooks";
import classNames from "classnames";

import styles from "./DevicesTab.module.css";
import settingsStyles from "../../SettingsView.module.css";
import * as Icons from "../../../icons/Icons.jsx";
import { WanderingCubesLoader } from "../../../components/Loaders/Loaders.jsx";
import Button from "../../../components/Button/Button.jsx";
import { useFormatter } from "../../../hooks/useFormatter.js";

export default function Devices({ client }) {
    const [loading, setLoading] = useState(true);
    const [sessions, setSessions] = useState([]);
    const { formatRelativeTime } = useFormatter();

    useEffect(() => {
        client.sessions.fetch().then((newSessions) => {
            setSessions(Array.from(newSessions.values()));
            setLoading(false);
        });
    }, [client]);

    const handleLogoutAll = async () => {
        const newSessions = await client.sessions.logoutAllOtherDevices();
        setSessions(Array.from(newSessions.values()));
    };

    const handleLogout = async (sessionId) => {
        const session = client.sessions.cache.get(sessionId);
        await session.logout();
        setSessions(Array.from(client.sessions.cache.values()));
    };

    const currentSession = client.sessions.current;
    const otherSessions = sessions.filter((s) => s.id !== currentSession?.id);

    const isMobile = (os) => ["Android", "iOS", "Windows Mobile", "BlackBerry"].includes(os);

    return (
        <div>
            <h1 className={settingsStyles.tabTitle}>Appareils</h1>
            <div className={styles.sectionDescription}>
                Voici tous les appareils actuellement connectés à ton compte Discord. Tu peux déconnecter tous les appareils en une fois ou séparément.
                Si tu remarques une activité inhabituelle sur ton compte, change le mot de passe de ton compte Discord immédiatement.
            </div>
            {loading ? (
                <div className={styles.loaderWrapper}>
                    <WanderingCubesLoader/>
                </div>
            ) :(
                <>
                    <h3 className={settingsStyles.sectionTitle} style={{ marginTop: "32px" }}>Appareil actuel</h3>
                    <div className={classNames(styles.session, styles.current)}>
                        <div className={styles.icon}>
                            {isMobile(currentSession.clientInfo?.os) ? <Icons.Mobile/> : <Icons.Desktop/>}
                        </div>
                        <div className={styles.info}>
                            <span className={styles.platform}>{currentSession.clientInfo?.os} · {currentSession.clientInfo?.platform}</span>
                            <span className={styles.location}>{currentSession.clientInfo?.location}</span>
                        </div>
                    </div>
                    {otherSessions.length > 0 && (
                        <>
                            <h3 className={settingsStyles.sectionTitle} style={{ marginTop: "16px" }}>Autres appareils</h3>
                            <div className={styles.otherSessionsList}>
                                {otherSessions.map((session) => (
                                    <div key={session.id} className={styles.session}>
                                        <div className={styles.icon}>
                                            {isMobile(session.clientInfo?.os) ? <Icons.Mobile/> : <Icons.Desktop/>}
                                        </div>
                                        <div className={styles.info}>
                                            <span className={styles.platform}>{session.clientInfo?.os} · {session.clientInfo?.platform}</span>
                                            <span className={styles.location}>{session.clientInfo?.location} · {formatRelativeTime(session.lastUsedAt)}</span>
                                        </div>
                                        <div className={styles.logoutBtn} onClick={() => handleLogout(session.id)}>
                                            <Icons.Close/>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <h3 className={settingsStyles.sectionTitle}>Se déconnecter de tous les appareils connus</h3>
                            <div className={styles.sectionDescription}>Tu devras te reconnecter à tous les appareils déconnectés.</div>
                            <Button variant="danger" size="small" style={{ marginTop: "16px" }} onClick={handleLogoutAll}>Se déconnecter de tous les appareils connus</Button>
                        </>
                    )}
                </>
            )}
        </div>
    );
};