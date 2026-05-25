import classNames from "classnames";
import styles from "./SegmentedControl.module.css";

export default function SegmentedControl({ options, value, onChange, className }) {
    return (
        <div className={classNames(styles.container, className)}>
            {options.map((option) => (
                <div
                    key={option.value}
                    className={classNames(styles.option, {
                        [styles.selected]: value === option.value
                    })}
                    onClick={() => onChange(option.value)}
                >
                    {option.label}
                </div>
            ))}
        </div>
    );
}
