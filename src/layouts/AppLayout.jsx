import styles from "./AppLayout.module.css";

export default function AppLayout({ layer, children, ...props }) {
    return (
        <div className={styles.appLayer} data-layer={layer} {...props}>
            {children}
        </div>
    );
};