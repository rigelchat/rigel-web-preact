import { useEffect, useState, useCallback } from "preact/hooks";
import { PermissionsBitField } from "rigel.js";

import styles from "./MessageActions.module.css";
import * as Icons from "../../icons/Icons";

export default function MessageActions({ client, message, setMessages }) {
    const [shiftPressed, setShiftPressed] = useState(() => window.event?.shiftKey ?? false);

    const canSend = message.channel?.permissionsFor(client.user).has(PermissionsBitField.Flags.SendMessages);
    const canReact = message.channel?.permissionsFor(client.user).has(PermissionsBitField.Flags.AddReactions);

    useEffect(() => {
        const handleKey = (evt) => setShiftPressed(evt.shiftKey);

        window.addEventListener("keydown", handleKey);
        window.addEventListener("keyup", handleKey);

        return () => {
            window.removeEventListener("keydown", handleKey);
            window.removeEventListener("keyup", handleKey);
        };
    }, []);

    const handleCopyId = useCallback(() => {
        navigator.clipboard.writeText(message.id).catch((err) => {
            console.error(err);
            alert("❌ L'identifiant n'a pas pu être copié.");
        });
    });

    const handleCopyLink = useCallback(() => {
        navigator.clipboard.writeText(message.url).catch((err) => {
            console.error(err);
            alert("❌ L'identifiant n'a pas pu être copié.");
        });
    });

    const handleMarkUnread = useCallback(() => {});

    const handlePin = useCallback(() => {});

    const handleReply = useCallback(() => {});

    const handleEdit = useCallback(() => {
        const newContent = prompt("", message.content);
        if (!newContent) return;
        message.edit(newContent);
    });

    const handleDelete = useCallback(() => {
        if (message.isFailed) {
            setMessages((prev) => prev.filter((msg) => msg.nonce !== message.nonce));
        } else if (confirm("Tu es sûr de vouloir supprimer ce message ?")) {
            message.delete();
        };
    });

    const handleRetry = useCallback(() => {
        setMessages((prev) =>
            prev.map((msg) => msg.nonce === message.nonce ? { ...msg, isSending: true, isFailed: false } : null)
        );
    });

    return (
        <div className={styles.messageActionsWrapper}>
            <div className={styles.messageActions}>
                {!message.isSending && !message.isFailed && (
                    shiftPressed ? (
                        <>
                            <button title="Copier l'identifiant du message" onClick={handleCopyId}>
                                <Icons.Identifier/>
                            </button>
                            <button title="Copier le lien" onClick={handleCopyLink}>
                                <Icons.Link/>
                            </button>
                            <button title="Marquer comme non lu" onClick={handleMarkUnread}>
                                <Icons.MarkUnread/>
                            </button>
                            <button title="Épingler le message" onClick={handlePin}>
                                <Icons.Pin/>
                            </button>
                            {canSend && (
                                <button title="Répondre" onClick={handleReply}>
                                    <Icons.Reply/>
                                </button>
                            )}
                            {canReact && (
                                <button title="Ajouter une réaction">
                                    <Icons.Reaction/>
                                </button>
                            )}
                            {message.author.id === client.user.id && (
                                <button title="Modifier" onClick={handleEdit}>
                                    <Icons.Edit/>
                                </button>
                            )}
                            <button title="Supprimer" className={styles.danger} onClick={handleDelete}>
                                <Icons.Delete/>
                            </button>
                        </>
                    ) : (
                        <>
                            {canReact && (
                                <button title="Ajouter une réaction">
                                    <Icons.Reaction/>
                                </button>
                            )}
                            {message.author.id === client.user.id ? (
                                <button title="Modifier" onClick={handleEdit}>
                                    <Icons.Edit/>
                                </button>
                            ) : canSend && (
                                <button title="Répondre" onClick={handleReply}>
                                    <Icons.Reply/>
                                </button>
                            )}
                            <button title="Plus">
                                <Icons.More/>
                            </button>
                        </>
                    )
                )}
                {message.isFailed && (
                    <>
                        <button title="Réessayer" onClick={handleRetry}>
                            <Icons.Retry/>
                        </button>
                        <button title="Supprimer" onClick={handleDelete}>
                            <Icons.Delete/>
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};