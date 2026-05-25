import { useState, useMemo, useRef, useCallback } from "preact/hooks";
import { lazy } from "preact/compat";
import classNames from "classnames";
import emojiData from "emojibase-data/en/compact.json";

import styles from "./EmojiPicker.module.css";
import * as Icons from "../../icons/Icons";
import Input from "../Input/Input";
import Emoji from "../Emoji/Emoji";
import VirtualizedGrid from "../VirtualizedGrid/VirtualizedGrid";

const EMOJI_CATEGORIES = {
    people: { name: "Peronnes", icon: Icons.People, groups: [0, 1] },
    nature: { name: "Nature", icon: Icons.Nature, groups: [3] },
    food: { name: "Nourriture", icon: Icons.Food, groups: [4] },
    activity: { name: "Activités", icon: Icons.Activity, groups: [6] },
    travel: { name: "Voyage", icon: Icons.Travel, groups: [5] },
    objects: { name: "Objets", icon: Icons.Objects, groups: [7] },
    symbols: { name: "Symboles", icon: Icons.Symbols, groups: [8] },
    flags: { name: "Drapeaux", icon: Icons.Flag, groups: [9] }
};

const EMOJI_SIZE = 48;
const EMOJIS_PER_ROW = 9;

export default function EmojiPicker({ onClose, addToInput, textareaRef }) {
    const [activeCategory, setActiveCategory] = useState("people");
    const gridRef = useRef(null);

    const emojiSections = useMemo(() => {
        return Object.entries(EMOJI_CATEGORIES).map(([key, category]) => ({
            key,
            name: category.name,
            icon: category.icon,
            data: emojiData
                .filter((e) => category.groups.includes(e.group))
                .map((e) => ({ unicode: e.unicode, label: e.label }))
        }));
    }, []);

    const handleEmojiClick = useCallback((emoji) => {
        if (addToInput) addToInput(emoji.unicode);
        onClose();
        if (textareaRef?.current) {
            textareaRef.current.focus();
        };
    }, [addToInput, onClose, textareaRef]);

    const scrollToCategory = useCallback((key) => {
        if (gridRef.current?.scrollToSection) {
            gridRef.current.scrollToSection(key);
        };
    }, []);

    const handleActiveCategoryChange = useCallback((key) => {
        setActiveCategory(key);
    }, []);

    const renderEmojiSection = useCallback((section, visibleRange) => {
        if (!visibleRange.isVisible) {
            return null;
        };

        return (
            <div
                className={styles.categoryEmojis}
                style={{
                    position: "relative",
                    minHeight: `${section.totalRows * EMOJI_SIZE}px`,
                }}
            >
                {section.data.map((emoji, index) => {
                    if (index < visibleRange.start || index >= visibleRange.end) {
                        return null;
                    };

                    const row = Math.floor(index / EMOJIS_PER_ROW);
                    const col = index % EMOJIS_PER_ROW;

                    return (
                        <button
                            key={index}
                            className={styles.emojiItem}
                            style={{
                                position: 'absolute',
                                top: `${row * EMOJI_SIZE}px`,
                                left: `${col * EMOJI_SIZE + 8}px`,
                            }}
                            onClick={() => handleEmojiClick(emoji)}
                        >
                            <Emoji unicode={emoji.unicode} label={emoji.label} className={styles.emoji}/>
                        </button>
                    );
                })}
            </div>
        );
    }, [handleEmojiClick]);

    const renderSectionHeader = useCallback((section) => {
        return (
            <div className={styles.categoryHeader}>
                <section.icon className={styles.icon}/>
                {section.name}
            </div>
        );
    }, []);

    return (
        <div className={styles.pickerContainer}>
            <div className={styles.header}>
                <Input 
                    type="text" 
                    placeholder="Trouver l'émoji parfait"
                />
            </div>
            <div className={styles.emojiContainer}>
                <div className={styles.categoryList}>
                    {emojiSections.map((section) => (
                        <button
                            key={section.key}
                            className={classNames(styles.categoryItem, { [styles.active]: activeCategory === section.key })}
                            onClick={() => scrollToCategory(section.key)}
                        >
                            <section.icon className={styles.icon}/>
                        </button>
                    ))}
                </div>
                <VirtualizedGrid
                    sections={emojiSections}
                    renderSection={renderEmojiSection}
                    renderSectionHeader={renderSectionHeader}
                    itemSize={EMOJI_SIZE}
                    itemsPerRow={EMOJIS_PER_ROW}
                    onActiveChange={handleActiveCategoryChange}
                    className={classNames(styles.emojiGrid, "scrollbar-thin")}
                    scrollRef={gridRef}
                />
            </div>
        </div>
    );
};