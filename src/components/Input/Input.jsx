import { useRef } from "preact/hooks";
import classNames from "classnames";

import styles from "./Input.module.css";
import * as Icons from "../../icons/Icons";

export default function Input({
    size = "medium",
    rightIcon,
    value,
    className,
    onInput,
    disabled,
    ...props
}) {
    const inputRef = useRef(null);

    const renderIcon = (icon) => {
        if (!icon) return null;

        if (icon === "search") {
            return (
                <div
                    className={styles.iconContainer}
                    style={{ pointerEvents: value ? "auto" : undefined, cursor: value ? "pointer" : undefined }}
                    onMouseDown={(evt) => evt.preventDefault()}
                    onClick={() => {
                        if (value) {
                            onInput?.({ target: { value: "" } });
                        } else {
                            inputRef.current?.focus();
                        }
                    }}
                >
                    <Icons.Search className={classNames({ [styles.visible]: !value })}/>
                    <Icons.Close className={classNames({ [styles.visible]: !!value })}/>
                </div>
            );
        };

        return (
            <div className={styles.iconContainer}>
                {icon}
            </div>
        );
    };

    return (
        <div className={classNames(styles.inputWrapper, { [styles.disabled]: disabled })}>
            <input
                ref={inputRef}
                className={classNames(
                    styles.input,
                    {
                        large: styles.sizeLarge,
                        medium: styles.sizeMedium,
                        small: styles.sizeSmall
                    }[size],
                    {
                        [styles.withRightIcon]: !!rightIcon
                    },
                    className
                )}
                value={value}
                onInput={onInput}
                disabled={disabled}
                {...props}
            />
            {renderIcon(rightIcon)}
        </div>
    );
};