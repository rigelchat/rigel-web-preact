import { useState } from "preact/hooks";

import "./CreateServerDialog.css";
import * as Icons from "../../icons/Icons";

export default function CreateServerDialog({ client, onClose }) {
    const [guildName, setGuildName] = useState(`Serveur de ${client.user.displayName}`);
    const [guildIcon, setGuildIcon] = useState(null);
    const [error, setError] = useState(null);

    const handleFileChange = (evt) => {
        const [file] = evt.currentTarget.files;
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            console.log(evt);
            setGuildIcon(evt.target.result);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = (evt) => {
        evt.preventDefault();
        setError(null);
        client.guilds.create({ name: guildName, icon: guildIcon }).then(() => {
            alert("created!");
            onClose?.();
        }).catch((err) => {
            setError(err?.response?.data?.message || err.message);
        });
    };

    return (
        <>
            <div className="dialog-header">
                <h1>Personnalise ton serveur</h1>
                <p>Donne une personnalité à ton nouveau serveur en choisissant un nom et une icône. Tu pourras toujours les modifier plus tard.</p>
                <button className="close-btn" onClick={onClose} aria-label="Fermer">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M17.3 18.7a1 1 0 0 0 1.4-1.4L13.42 12l5.3-5.3a1 1 0 0 0-1.42-1.4L12 10.58l-5.3-5.3a1 1 0 0 0-1.4 1.42L10.58 12l-5.3 5.3a1 1 0 1 0 1.42 1.4L12 13.42l5.3 5.3Z"/>
                    </svg>
                </button>
            </div>
            <div className="dialog-content scrollbar-thin">
                <div className="upload-icon-wrapper">
                    {!guildIcon && (
                    <div className="upload-icon">
                        <Icons.UploadPicture/>
                        <input type="file" accept="image/*" onChange={handleFileChange}/>
                    </div>
                    )}
                    {guildIcon && (
                        <img className="filled-icon" src={guildIcon} />
                    )}
                </div>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="guild-name">Nom du serveur</label>
                    <input
                        type="text"
                        id="guild-name"
                        value={guildName}
                        onInput={(evt) => setGuildName(evt.currentTarget.value)}
                        autoFocus
                    />
                    <div className="guild-lines">En créant un serveur, tu acceptes la <strong><a href="https://discord.com/guidelines" className="anchor">Charte d'Utilisation de la Communauté Discord</a></strong>.</div>
                </form>
                {error && <div className="error">{error}</div>}
            </div>
            <div className="dialog-footer">
                <button type="button" onClick={onClose}>Retour</button>
                <button type="button" onClick={handleSubmit}>Créer</button>
            </div>
        </>
    );
};