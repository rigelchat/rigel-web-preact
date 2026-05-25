import { createContext } from "preact";
import { useState, useImperativeHandle, useEffect, useRef, useCallback, useContext } from "preact/hooks";
import { forwardRef, createPortal } from "preact/compat";
import classNames from "classnames";

import styles from "./ContextMenu.module.css";
import * as Icons from "../../icons/Icons";

const ContextMenuContext = createContext({
    hideMenu: () => {},
    isVisible: false
});

export const ContextMenu = forwardRef(({ children }, ref) => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isVisible, setIsVisible] = useState(false);
    const menuRef = useRef(null);

    const hideMenu = useCallback(() => {
        setIsVisible(false);
    }, []);

    useEffect(() => {
        if (!isVisible) return;

        const handleClick = (evt) => {
            if (menuRef.current && !menuRef.current.contains(evt.target)) {
                hideMenu();
            };
        };

        const handleContextMenu = () => {
            hideMenu();
        };

        const handleKeyDown = (evt) => {
            if (evt.key === "Escape") {
                hideMenu();
            };
        };

        const timeoutId = setTimeout(() => {
            document.addEventListener("click", handleClick);
            document.addEventListener("contextmenu", handleContextMenu);
            document.addEventListener("keydown", handleKeyDown);
        }, 0);

        return () => {
            clearTimeout(timeoutId);
            document.removeEventListener("click", handleClick);
            document.removeEventListener("contextmenu", handleContextMenu);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isVisible, hideMenu]);

    useImperativeHandle(ref, () => ({
        show: (evt) => {
            evt.preventDefault();

            const { clientX, clientY } = evt;
            
            setPosition({ x: clientX, y: clientY });
            setIsVisible(true);

            requestAnimationFrame(() => {
                if (!menuRef.current) return;

                const rect = menuRef.current.getBoundingClientRect();
                let x = clientX;
                let y = clientY;

                if (clientX + rect.width > window.innerWidth) {
                    x = clientX - rect.width;
                };

                if (clientY + rect.height > window.innerHeight) {
                    y = clientY - rect.height;
                };

                setPosition({ x, y });
            });
        },
        hide: hideMenu
    }), [hideMenu]);

    return (
        <ContextMenuContext.Provider value={{ hideMenu, isVisible }}>
            {isVisible && createPortal(
                <div
                    ref={menuRef}
                    className={classNames(styles.contextMenu, "scrollbar-thin")}
                    style={{
                        left: `${position.x}px`,
                        top: `${position.y}px`,
                    }}
                    onClick={(evt) => evt.stopPropagation()}
                >
                    {children}
                </div>,
                document.body
            )}
        </ContextMenuContext.Provider>
    );
});

export function ContextMenuItem({
    label,
    subtext,
    icon,
    danger = false,
    disabled = false,
    onClick,
    children
}) {
    const { hideMenu } = useContext(ContextMenuContext);
    const [isSubVisible, setIsSubVisible] = useState(false);
    const [subPosition, setSubPosition] = useState({ x: 0, y: 0 });
    const itemRef = useRef(null);
    const subMenuRef = useRef(null);

    const contextMenuSpacing = 12;
    const hasChildren = children && (Array.isArray(children) ? children.length > 0 : true);

    const handleClick = useCallback((evt) => {
        evt.stopPropagation();
        if (disabled) return;

        if (onClick) {
            onClick(evt);
        };

        if (!hasChildren) {
            hideMenu();
        }
    }, [disabled, onClick, hideMenu, hasChildren]);

    const handleMouseEnter = useCallback(() => {
        if (!hasChildren || disabled) return;

        if (itemRef.current) {
            const rect = itemRef.current.getBoundingClientRect();
            let x = rect.right + contextMenuSpacing;
            let y = rect.top;

            setSubPosition({ x, y });
            setIsSubVisible(true);

            requestAnimationFrame(() => {
                if (!subMenuRef.current) return;

                const subRect = subMenuRef.current.getBoundingClientRect();
                if (x + subRect.width > window.innerWidth) x = rect.left - subRect.width;
                if (y + subRect.height > window.innerHeight) y = window.innerHeight - subRect.height;

                setSubPosition({ x, y });
            });
        }
    }, [hasChildren, disabled]);

    useEffect(() => {
        if (!isSubVisible) return;

        const handleMouseMove = (evt) => {
            if (!subMenuRef.current || itemRef.current?.contains(evt.target)) return;

            const mouseX = evt.clientX;
            const mouseY = evt.clientY;
            const submenuRect = subMenuRef.current.getBoundingClientRect();

            setIsSubVisible(
                mouseX >= (submenuRect.left - contextMenuSpacing) &&
                mouseX <= (submenuRect.right + contextMenuSpacing) &&
                mouseY >= submenuRect.top &&
                mouseY <= submenuRect.bottom
            );
        };

        document.addEventListener("mousemove", handleMouseMove);
        return () => document.removeEventListener("mousemove", handleMouseMove);
    }, [isSubVisible]);

    return (
        <>
            <div
                ref={itemRef}
                className={classNames(styles.item, {
                    [styles.danger]: danger,
                    [styles.disabled]: disabled,
                    [styles.hovering]: isSubVisible
                })}
                onClick={handleClick}
                onMouseEnter={handleMouseEnter}
            >
                <div className={styles.label}>{label}</div>
                {subtext && <div className={styles.subtext}>{subtext}</div>}
                {hasChildren ? (
                    <div className={styles.icon}>
                        <Icons.CaretRight/>
                    </div>
                ) : (
                    icon && <div className={styles.icon}>{icon}</div>
                )}
            </div>
            {hasChildren && isSubVisible && createPortal(
                <div
                    ref={subMenuRef}
                    className={classNames(styles.contextMenu, styles.subMenu, "scrollbar-thin")}
                    style={{
                        left: `${subPosition.x}px`,
                        top: `${subPosition.y}px`,
                    }}
                    onClick={(evt) => evt.stopPropagation()}
                >
                    {children}
                </div>,
                document.body
            )}
        </>
    );
};

export function ContextMenuSeparator() {
    return <div className={styles.separator}/>;
};

export default ContextMenu;