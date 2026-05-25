import classNames from "classnames";

import styles from "./InputLabel.module.css";

export default function InputLabel({ error, required = false, children, ...props }) {
    return (
        <label className={classNames(styles.inputLabel, {
            [styles.error]: error
        })} {...props}>
            {children}
            {required && <span className={styles.required}>*</span>}
            {error && (
                <span className={styles.errorMessage}> - {error}</span>
            )}
        </label>
    );
};