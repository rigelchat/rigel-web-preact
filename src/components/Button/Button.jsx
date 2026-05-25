import classNames from "classnames";

import styles from "./Button.module.css";

export default function Button({
    variant = "primary",
    size = "small",
    fullWidth = false,
    submitting = false,
    colorLink = false,
    className,
    children,
    ...props 
}) {
    return (
        <button
            className={classNames(
                styles.button,
                styles[variant],
                {
                    large: styles.sizeLarge,
                    medium: styles.sizeMedium,
                    small: styles.sizeSmall,
                    mini: styles.sizeMini
                }[size],
                {
                    [styles.fullWidth]: fullWidth,
                    [styles.submitting]: submitting,
                    [styles.colorLink]: colorLink
                },
                className
            )}
            {...props}
        >
            {submitting ? (
                <div className={styles.pulsingEllipsis}>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            ) : (
                children
            )}
        </button>
    );
};