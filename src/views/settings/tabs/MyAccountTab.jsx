import { useState } from "preact/hooks";
import settingsStyles from "../../SettingsView.module.css";
import styles from "./MyAccount.module.css";

import Button from "../../../components/Button/Button.jsx";
import Input from "../../../components/Input/Input.jsx";

export default function MyAccount({ client }) {
    const mfa_enabled = false;
    const [showEmail, setShowEmail] = useState(false);

    const maskEmail = (email) => email?.replace(/^[^@]+/, (match) => "*".repeat(match.length)) || "";

    const handleEnableMFA = () => {

    };

    const handleDisableMFA = () => {
        if(confirm("Veux-tu vraiment supprimer ton Application d'authentification ?")) {
            prompt("Entrer le code d'authentification Discord");
        };
    };

    const handleDeleteAccount = () => {

    };

    return (
        <div>
            <h1 className={settingsStyles.tabTitle}>Mon compte</h1>
            <div className={settingsStyles.section}>
                <h3 className={settingsStyles.sectionTitle}>Nom d'utilisateur</h3>
                <div>
                    <span style={{ color: "var(--header-primary)" }}>{client.user.username}</span>
                    {client.user.discriminator !== "0" && <span style={{ color: "var(--header-secondary)" }}>#{client.user.discriminator}</span>}
                </div>
            </div>
            {client.user.email && (
                <div className={settingsStyles.section}>
                    <h3 className={settingsStyles.sectionTitle}>E-mail</h3>
                    <div className={styles.emailContainer}>
                        <span style={{ color: "var(--header-primary)" }}>{showEmail ? client.user.email : maskEmail(client.user.email)}</span>
                        <Button variant="link" size="mini" colorLink={true} onClick={() => setShowEmail(!showEmail)}>
                            {showEmail ? "Masquer" : "Afficher"}
                        </Button>
                    </div>
                </div>
            )}
            <div className={settingsStyles.section}>
                <h3 className={settingsStyles.sectionTitle}>Application d'authentification</h3>
                {mfa_enabled ? (
                    <Button variant="danger" size="small" onClick={handleDisableMFA} disabled>Supprimer l'application d'authentification</Button>
                ) : (
                    <Button size="small" onClick={handleEnableMFA} disabled>Activer l'application d'authentification</Button>
                )}
            </div>
            <div className={settingsStyles.section}>
                <h3 className={settingsStyles.sectionTitle}>Suppression du compte</h3>
                <Button variant="danger" size="small" onClick={handleDeleteAccount} disabled>Supprimer le compte</Button>
            </div>
        </div>
    );
};