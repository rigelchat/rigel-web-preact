import { forwardRef } from "preact/compat";
import { PermissionsBitField } from "rigel.js";

import * as Icons from "../../icons/Icons";
import { ContextMenu, ContextMenuItem, ContextMenuSeparator } from "./ContextMenu";

export const GuildContextMenu = forwardRef(({ client, guild }, ref) => {
    const canManageGuild = guild.members.me?.permissions?.has(PermissionsBitField.Flags.ManageGuild);

    return (
        <ContextMenu ref={ref}>
            <ContextMenuItem label="Marqué comme lu" disabled={true}/>
            {canManageGuild && (
                <>
                    <ContextMenuSeparator/>
                    <ContextMenuItem label="Paramètres du serveur">
                        <ContextMenuItem label="Vue d'ensemble"/>
                        <ContextMenuItem label="Rôles"/>
                        <ContextMenuItem label="Émoji"/>
                        <ContextMenuItem label="Lien d'invitation personnalisé"/>
                        <ContextMenuItem label="AutoMod"/>
                        <ContextMenuItem label="Logs du serveurs"/>
                        <ContextMenuItem label="Bannissements"/>
                        <ContextMenuItem label="Paramètres de communauté"/>
                        <ContextMenuItem label="Découverte"/>
                        <ContextMenuItem label="Membres"/>
                    </ContextMenuItem>
                </>
            )}
            {client.user.id !== guild.ownerId && (
                <>
                    <ContextMenuSeparator/>
                    <ContextMenuItem label="Quitter le serveur" danger={true} onClick={() => {
                        if (confirm(`Tu es sûr(e) de vouloir quitter ${guild.name} ?`)) {
                            guild.leave().catch((err) => {
                                const res = err.response;
                                console.error(res || err);
                                alert(res ? `❌ ${res.data.message} (${res.data.code})` : `❌ ${err.message} (${err.code})`);
                            });
                        };
                    }}/>
                </>
            )}
            {client.settings.developerMode && (
                <>
                    <ContextMenuSeparator/>
                    <ContextMenuItem label="Copier l'identifiant du serveur" icon={<Icons.Identifier/>} onClick={() => {
                        navigator.clipboard.writeText(guild.id).catch((err) => {
                            console.error(err);
                            alert("❌ L'identifiant n'a pas pu être copié.");
                        });
                    }}/>
                </>
            )}
        </ContextMenu>
    );
});

export default GuildContextMenu;