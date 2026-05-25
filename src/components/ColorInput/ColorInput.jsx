import styles from "./ColorInput.module.css";
import * as Icons from "../../icons/Icons.jsx";

export default function ColorInput({ value, onChange }) {
    return (
        <div className={styles.colorInputWrapper}>
            <input
                type="color"
                className={styles.colorInput}
                style={{ "--selected-color": value }}
                value={value}
                onInput={(evt) => onChange(evt.target.value)}
            />
            <Icons.Edit className={styles.editIcon} />
        </div>
    );
};