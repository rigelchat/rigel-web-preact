import { useEffect, useState } from "preact/hooks";
import useUnsavedChanges from "../../../hooks/useUnsavedChanges.js";
import { Bot } from "../../../../rigel.js/index.js";

import styles from "./BotsTab.module.css";
import settingsStyles from "../../SettingsView.module.css";
import * as Icons from "../../../icons/Icons.jsx";
import { WanderingCubesLoader } from "../../../components/Loaders/Loaders.jsx";
import Button from "../../../components/Button/Button.jsx";
import Input from "../../../components/Input/Input.jsx";
import SaveBar from "../../../components/SaveBar/SaveBar.jsx";

function BotCard({ bot, onClick }) {
    return (
        <div className={styles.botGridItem} onClick={() => onClick(bot)}>
            <div className={styles.botAvatarContainer}>
                <img 
                    src={bot.displayAvatarURL()} 
                    className={styles.botAvatarGrid}
                    alt={bot.username}
                />
            </div>
            <span className={styles.botNameGrid}>{bot.username}</span>
        </div>
    );
};

function TokenSection({ generatedToken, tokenCopied, onResetToken, onCopyToken }) {
    return (
        <div className={settingsStyles.section}>
            <h3 className={settingsStyles.sectionTitle}>Token</h3>
            {generatedToken && (
                <div className={styles.tokenDisplay}>{generatedToken}</div>
            )}
            <div className={styles.tokenButtons}>
                {generatedToken && (
                    <Button variant={tokenCopied ? "success" : "secondary"} onClick={onCopyToken}>
                        {tokenCopied ? "Copié" : "Copier"}
                    </Button>
                )}
                <Button onClick={onResetToken}>Réinitialiser le Token</Button>
            </div>
        </div>
    );
};

function GuildSelectorModal({ show, selectedBot, guilds, onSelectGuild, onClose }) {
    if (!show) return null;

    return (
        <div className={styles.guildSelectorModal} onClick={onClose}>
            <div className={styles.guildSelectorContent} onClick={(e) => e.stopPropagation()}>
                <h3 className={settingsStyles.sectionTitle}>Sélectionner un serveur</h3>
                <p className={styles.sectionDescription}>
                    Choisis le serveur où tu veux ajouter <strong>{selectedBot?.username}</strong>
                </p>
                {guilds.length === 0 ? (
                    <div className={styles.emptyState}>
                        Tu n'as pas la permission de gérer de serveur.
                    </div>
                ) : (
                    <div className={styles.guildsList}>
                        {guilds.map((guild) => (
                            <div
                                key={guild.id}
                                className={styles.guildItem}
                                onClick={() => onSelectGuild(guild.id)}
                            >
                                {guild.icon ? (
                                    <img
                                        src={guild.iconURL({ size: 48 })}
                                        className={styles.guildIcon}
                                        alt={guild.name}
                                    />
                                ) : (
                                    <div className={styles.guildIconPlaceholder}>
                                        {guild.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <span className={styles.guildName}>{guild.name}</span>
                            </div>
                        ))}
                    </div>
                )}
                <Button variant="secondary" size="medium" onClick={onClose}>
                    Annuler
                </Button>
            </div>
        </div>
    );
};

function BotEditor({ 
    bot, 
    data, 
    updateField, 
    hasChanges, 
    reset, 
    save, 
    isSaving,
    generatedToken,
    tokenCopied,
    onBack,
    onResetToken,
    onCopyToken,
    onAddToGuild,
    onDeleteBot
}) {
    return (
        <div className={styles.editorContainer}>
            <div className={styles.editorHeader}>
                <Button variant="link" size="small" onClick={onBack}>← Retour aux Bots</Button>
            </div>                  
            <div className={styles.botEditorLayout}>
                <div className={styles.iconSection}>
                    <label className={styles.label}>ICÔNE</label>
                    <div className={styles.botAvatarEditor}>
                        <img 
                            src={bot.displayAvatarURL()} 
                            className={styles.botAvatarLarge}
                            alt={bot.username}
                        />
                        <div className={styles.avatarBadge}>
                            <Icons.Edit/>
                        </div>
                    </div>
                </div>
                <div className={styles.usernameSection}>
                    <div className={settingsStyles.section}>
                        <h3 className={settingsStyles.sectionTitle}>Nom d'utilisateur</h3>
                        <div className={styles.usernameInputWrapper}>
                            <Input
                                value={data.username}
                                onChange={(e) => updateField("username", e.target.value)}
                                placeholder="Nom du bot"
                                className={styles.usernameInput}
                            />
                        </div>
                    </div>
                    <TokenSection
                        generatedToken={generatedToken}
                        tokenCopied={tokenCopied}
                        onResetToken={onResetToken}
                        onCopyToken={onCopyToken}
                    />
                </div>
            </div>
            <div className={styles.actionButtons}>
                <Button variant="secondary" size="medium" onClick={onAddToGuild}>
                    Ajouter à un serveur
                </Button>
                <Button variant="danger" size="medium" onClick={onDeleteBot}>
                    Supprimer le bot
                </Button>
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

function BotsList({ bots, onSelectBot, onCreateBot }) {
    return (
        <>
            <h1 className={settingsStyles.tabTitle}>Bots</h1>
            <div className={styles.sectionDescription}>Développez des bots pour personnaliser et étendre Rigel pour des millions d'utilisateurs.</div>
            <div className={styles.createSection}>
                <Button variant="primary" size="medium" onClick={onCreateBot}>Nouveau bot</Button>
            </div>
            
            <h3 className={settingsStyles.sectionTitle} style={{ marginTop: "32px" }}>Mes bots</h3>
            {bots.length === 0 ? (
                <div className={styles.emptyState}>
                    Tu n'as pas encore de bots. Clique sur Nouveau bot ci-dessus pour commencer.
                </div>
            ) : (
                <div className={styles.botsGrid}>
                    {bots.map((bot) => (
                        <BotCard key={bot.id} bot={bot} onClick={onSelectBot} />
                    ))}
                </div>
            )}
        </>
    );
};

export default function BotsTab({ client }) {
    const [loading, setLoading] = useState(true);
    const [bots, setBots] = useState([]);
    const [selectedBot, setSelectedBot] = useState(null);
    const [showGuildSelector, setShowGuildSelector] = useState(false);
    const [generatedToken, setGeneratedToken] = useState(null);
    const [tokenCopied, setTokenCopied] = useState(false);

    const initialData = {
        username: selectedBot?.username || "",
        avatar: selectedBot?.avatar || "",
        bio: selectedBot?.bio || ""
    };

    const handleSaveBot = async (data, changed) => {
        if (!selectedBot) return;

        try {
            const updatedBot = await client.bots.update(selectedBot.id, {
                username: data.username,
                avatar: data.avatar || null,
                bio: data.bio || null
            });
            await fetchBots();
            setSelectedBot(updatedBot);
        } catch (error) {
            console.error("Erreur lors de la mise à jour du bot:", error);
            throw error;
        }
    };

    const { data, updateField, hasChanges, reset, save, isSaving } = useUnsavedChanges(initialData, handleSaveBot);

    useEffect(() => {
        fetchBots();
    }, [client]);

    const fetchBots = async () => {
        try {
            setLoading(true);
            const bots = await client.bots.fetch();
            setBots(bots);
        } catch (error) {
            console.error("Erreur lors du chargement des bots:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBot = async () => {
        const username = prompt("Nom de l'application :");
        if (!username || !username.trim()) {
            return;
        }

        try {
            const newBot = await client.bots.create(username.trim());
            setSelectedBot(newBot);
        } catch (error) {
            console.error("Erreur lors de la création du bot:", error);
            alert("Erreur lors de la création du bot");
        }
    };

    const handleSelectBot = async (bot) => {
        setSelectedBot(bot);
        setGeneratedToken(null);
    };

    const handleUpdateBot = async () => {
        await save();
    };

    const handleAddToGuild = async () => {
        if (!selectedBot) return;
        setShowGuildSelector(true);
    };

    const handleSelectGuild = async (guildId) => {
        if (!selectedBot) return;

        try {
            await client.bots.addToGuild(selectedBot.id, guildId);
            setShowGuildSelector(false);
            alert("Bot ajouté au serveur avec succès !");
        } catch (error) {
            console.error("Erreur lors de l'ajout du bot au serveur:", error);
            alert("Erreur lors de l'ajout du bot au serveur");
        }
    };

    const managableGuilds = Array.from(client.guilds.cache.values()).filter(guild => {
        const member = guild.members.cache.get(client.user.id);
        return member?.permissions.has("ManageGuild");
    });

    const handleResetToken = async () => {
        if (!selectedBot) return;

        if (!confirm("Votre bot cessera de fonctionner jusqu'à ce que vous mettiez à jour le jeton dans le code de votre bot.")) {
            return;
        }

        try {
            const response = await client.bots.resetToken(selectedBot.id);
            setGeneratedToken(response.token);
        } catch (error) {
            console.error("Erreur lors de la réinitialisation du token:", error);
            alert("Erreur lors de la réinitialisation du token");
        }
    };

    const handleCopyToken = () => {
        if (generatedToken) {
            navigator.clipboard.writeText(generatedToken);
            setTokenCopied(true);
            setTimeout(() => {
                setTokenCopied(false);
            }, 2000);
        }
    };

    const handleDeleteBot = async () => {
        if (!selectedBot) return;

        if (prompt(`Pour supprimer cette application, veuillez confirmer le nom (${selectedBot.username}) ci-dessous.`) !== selectedBot.username) {
            return;
        };

        try {
            await client.bots.delete(selectedBot.id);
            await fetchBots();
            setSelectedBot(null);
        } catch (error) {
            console.error("Erreur lors de la suppression du bot:", error);
            alert("Erreur lors de la suppression du bot");
        }
    };

    const handleBackToApps = async () => {
        await fetchBots();
        setSelectedBot(null);
        setGeneratedToken(null);
    };

    return (
        <div>
            {loading ? (
                <div className={styles.loaderWrapper}>
                    <WanderingCubesLoader/>
                </div>
            ) : selectedBot ? (
                <>
                    <BotEditor
                        bot={selectedBot}
                        data={data}
                        updateField={updateField}
                        hasChanges={hasChanges}
                        reset={reset}
                        save={save}
                        isSaving={isSaving}
                        generatedToken={generatedToken}
                        tokenCopied={tokenCopied}
                        onBack={handleBackToApps}
                        onResetToken={handleResetToken}
                        onCopyToken={handleCopyToken}
                        onAddToGuild={handleAddToGuild}
                        onDeleteBot={handleDeleteBot}
                    />
                    <GuildSelectorModal
                        show={showGuildSelector}
                        selectedBot={selectedBot}
                        guilds={managableGuilds}
                        onSelectGuild={handleSelectGuild}
                        onClose={() => setShowGuildSelector(false)}
                    />
                </>
            ) : (
                <BotsList bots={bots} onSelectBot={handleSelectBot} onCreateBot={handleCreateBot} />
            )}
        </div>
    );
};