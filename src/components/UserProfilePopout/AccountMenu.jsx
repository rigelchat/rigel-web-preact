import { useMemo, useState, useRef, useEffect, useCallback, useContext } from "preact/hooks";
import { createPortal } from "preact/compat";
import classNames from "classnames";
import { PresenceUpdateStatus } from "rigel.js";

import styles from "./AccountMenu.module.css";
import * as Icons from "../../icons/Icons";
import { RouteContext } from "../../contexts/RouteContext";
import { StorageContext } from "../../contexts/StorageContext";
import { useFloatingPosition } from "../../hooks/useFloatingPosition";

export default function AccountMenu({ client }) {
    const { goToApp, goToLogin } = useContext(RouteContext);
    const storage = useContext(StorageContext);
    const [isSubMenuVisible, setIsSubMenuVisible] = useState(false);
    const [subMenuPosition, setSubMenuPosition] = useState({ x: 0, y: 0 });
    const itemRef = useRef(null);
    const subMenuRef = useRef(null);
    const subMenuSpacing = 12;

    const accounts = useMemo(() => storage.getAllAccounts(), [storage, client.user.id]);

    const handleMouseEnter = useCallback(() => {
        if (!itemRef.current) return;

        const rect = itemRef.current.getBoundingClientRect();
        let x = rect.right + subMenuSpacing;
        let y = rect.top;

        setSubMenuPosition({ x, y });
        setIsSubMenuVisible(true);

        requestAnimationFrame(() => {
            if (!subMenuRef.current) return;

            const subRect = subMenuRef.current.getBoundingClientRect();
            if (x + subRect.width > window.innerWidth) x = rect.left - subRect.width - subMenuSpacing;
            if (y + subRect.height > window.innerHeight) y = window.innerHeight - subRect.height - subMenuSpacing;

            setSubMenuPosition({ x, y });
        });
    }, []);

    useEffect(() => {
        if (!isSubMenuVisible) return;

        const handleMouseMove = (evt) => {
            if (!subMenuRef.current || itemRef.current?.contains(evt.target)) return;

            const mouseX = evt.clientX;
            const mouseY = evt.clientY;
            const submenuRect = subMenuRef.current.getBoundingClientRect();

            setIsSubMenuVisible(
                mouseX >= (submenuRect.left - subMenuSpacing) &&
                mouseX <= (submenuRect.right + subMenuSpacing) &&
                              mouseY >= submenuRect.top &&
                mouseY <= submenuRect.bottom
            );
        };

        document.addEventListener("mousemove", handleMouseMove);
        return () => document.removeEventListener("mousemove", handleMouseMove);
    }, [isSubMenuVisible]);

    const handleSwitchAccount = useCallback((account) => {
        if (account.token === client.token) return;
        storage.safeClear();
        storage.setToken(account.token);
        storage.setInstanceConfig(account.instanceConfig);
        goToApp();
    }, [storage]);

    const statusIcon = useMemo(() => {
        switch (client.presence.status) {
            case PresenceUpdateStatus.Online: return (
                <svg width="12" height="12" class="svg_bb7847 mask__3aa53 icon__0bfbf mainStatusIcon__87080" viewBox="0 0 12 12">
                    <foreignObject x="0" y="0" width="12" height="12" overflow="visible" mask="url(#svg-mask-status-online)">
                        <div className={styles.status} style="background-color: rgb(35, 165, 90);"></div>
                    </foreignObject>
                </svg>
            );
            case PresenceUpdateStatus.DoNotDisturb: return (
               <svg width="12" height="12" class="svg_bb7847 mask__3aa53 icon__0bfbf mainStatusIcon__87080" viewBox="0 0 12 12">
                    <foreignObject x="0" y="0" width="12" height="12" overflow="visible" mask="url(#svg-mask-status-dnd)">
                        <div className={styles.status} style="background-color: rgb(242, 63, 67);"></div>
                    </foreignObject>
                </svg>
            );
            case PresenceUpdateStatus.Idle: return (
                <svg width="12" height="12" class="svg_bb7847 mask__3aa53 icon__0bfbf mainStatusIcon__87080" viewBox="0 0 12 12">
                    <foreignObject x="0" y="0" width="12" height="12" overflow="visible" mask="url(#svg-mask-status-idle)">
                        <div className={styles.status} style="background-color: rgb(240, 178, 50);"></div>
                    </foreignObject>
                </svg>
            );
            case PresenceUpdateStatus.Invisible: return (
                <svg width="12" height="12" class="svg_bb7847 mask__3aa53 icon__0bfbf mainStatusIcon__87080" viewBox="0 0 12 12">
                    <foreignObject x="0" y="0" width="12" height="12" overflow="visible" mask="url(#svg-mask-status-offline)">
                        <div className={styles.status} style="background-color: rgb(128, 132, 142);"></div>
                    </foreignObject>
                </svg>
            );
        };
    }, [client?.presence?.status]);

    const statusText = useMemo(() => {
        switch (client.presence.status) {
            case PresenceUpdateStatus.Online: return "En ligne";
            case PresenceUpdateStatus.DoNotDisturb: return "Ne pas déranger";
            case PresenceUpdateStatus.Idle: return "Inactif";
            case PresenceUpdateStatus.Invisible: return "Invisible";
        };
    }, [client?.presence?.status]);

    return (
        <div className={styles.accountMenu}>
            <div role="group">
                <div className={styles.itemMenu}>
                    <div className={classNames(styles.iconContainer, styles.iconContainerLeft)}>
                        {statusIcon}
                    </div>
                    <div className={styles.label}>{statusText}</div>
                    <div className={styles.iconContainer}>
                        <Icons.CaretRight className={styles.caret}/>
                    </div>
                </div>
            </div>
            <div className={styles.separator}></div>
            <div role="group">
                <div
                    ref={itemRef}
                    className={classNames(styles.itemMenu, { [styles.hovering]: isSubMenuVisible })}
                    onMouseEnter={handleMouseEnter}
                >
                    <div className={classNames(styles.iconContainer, styles.iconContainerLeft)}>
                        <Icons.Swap/>
                    </div>
                    <div className={styles.label}>Changer de compte</div>
                    <div className={styles.iconContainer}>
                        <Icons.CaretRight className={styles.caret}/>
                    </div>
                </div>
                {isSubMenuVisible && createPortal(
                    <div
                        ref={subMenuRef}
                        className={classNames(styles.subMenu, "scrollbar-thin")}
                        style={{
                            top: `${subMenuPosition.y}px`,
                            left: `${subMenuPosition.x}px`
                        }}
                    >
                        {accounts.length > 0 ? (
                            accounts.map((account) => (
                                <div key={account.token} className={styles.accountItem} onClick={() => handleSwitchAccount(account)}>
                                    <img src={account.avatarUrl} className={styles.accountAvatar}/>
                                    <div className={styles.accountInfo}>
                                        <span className={styles.accountUsername}>{account.username}</span>
                                        <span className={styles.accountInstanceName}>{account.instanceConfig.api}</span>
                                    </div>
                                </div>
                            ))
                        ) : null}
                        <div className={styles.subMenuSeparator}></div>
                        <div className={styles.addAccountItem} onClick={goToLogin}>
                            <span>Ajouter un compte</span>
                        </div>
                    </div>,
                    document.body
                )}
            </div>
            {client.settings.developerMode && (
                <>
                    <div className={styles.separator}></div>
                    <div role="group">
                        <div className={styles.itemMenu}>
                            <div className={classNames(styles.iconContainer, styles.iconContainerLeft)}>
                                <Icons.Identifier className={styles.icon}/>
                            </div>
                            <div className={styles.label}>Copier l'identifiant de l'utilisateur</div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};