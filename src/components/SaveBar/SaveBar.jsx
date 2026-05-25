import { useTransition, animated } from "@react-spring/web";
import { saveBarTransition } from "../../utils/animations.js";
import styles from "./SaveBar.module.css";
import Button from "../Button/Button.jsx";

export default function SaveBar({ show, onReset, onSave, isSubmitting }) {
    const transitions = useTransition(show, saveBarTransition);

    return transitions((style, item) =>
        item ? (
            <animated.div className={styles.saveBarWrapper} style={style}>
                <div className={styles.saveBar}>
                    <div className={styles.message}>Attention, il reste des modifications non enregistrées !</div>
                    <div className={styles.saveBarButtons}>
                        <Button variant="link" className={styles.resetBtn} onClick={onReset}>Réinitialiser</Button>
                        <Button variant="success" size="small" submitting={isSubmitting} onClick={onSave}>Enregistrer les modifications</Button>
                    </div>
                </div>
            </animated.div>
        ) : null
    );
};