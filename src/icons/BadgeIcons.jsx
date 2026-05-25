import styles from "./Icons.module.css";

export function Bot({ verified, ...props }) {
    return (
        <span className={styles.botBadge} {...props}>
            {verified && (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" className={styles.check}>
                    <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M19.06 6.94a1.5 1.5 0 0 1 0 2.12l-8 8a1.5 1.5 0 0 1-2.12 0l-4-4a1.5 1.5 0 0 1 2.12-2.12L10 13.88l6.94-6.94a1.5 1.5 0 0 1 2.12 0Z"/>
                </svg>
            )}
            <span className={styles.text}>BOT</span>
        </span>
    );
};