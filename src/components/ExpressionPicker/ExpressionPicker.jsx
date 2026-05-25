import { useState, useEffect } from "preact/hooks";
import classNames from "classnames";

import styles from "./ExpressionPicker.module.css";
import GifPicker from "./GifPicker";
import EmojiPicker from "./EmojiPicker";
import { useFloatingPosition } from "../../hooks/useFloatingPosition";

export default function ExpressionPicker({
    client,
    channel,
    setMessages,
    scrollerRef,
    onClose,
    onTabChange,
    addToInput,
    defaultTab = "emoji",
    textareaRef,
    chatTextAreaRef
}) {
    const [activeTab, setActiveTab] = useState(defaultTab);
    const [pickerRef, positionStyle] = useFloatingPosition(chatTextAreaRef, "top-right", 8);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (onTabChange) onTabChange(tab);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target) &&
                chatTextAreaRef?.current && !chatTextAreaRef.current.contains(event.target)) {
                onClose();
            };
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('contextmenu', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('contextmenu', handleClickOutside);
        };
    }, [onClose, chatTextAreaRef]);

    return (
        <div
            ref={pickerRef}
            className={styles.expressionPicker}
            style={positionStyle}
        >
            <div className={styles.nav}>
                <button
                    className={classNames(styles.item, { [styles.active]: activeTab === "gif" })}
                    onClick={() => handleTabChange("gif")}
                >
                    GIF
                </button>
                <button
                    className={classNames(styles.item, { [styles.active]: activeTab === "emoji" })}
                    onClick={() => handleTabChange("emoji")}
                >
                    Émoji
                </button>
            </div>
            {activeTab === "gif" && (
                <GifPicker
                    client={client}
                    channel={channel}
                    setMessages={setMessages}
                    scrollerRef={scrollerRef}
                    onClose={onClose}
                />
            )}
            {activeTab === "emoji" && (
                <EmojiPicker
                    onClose={onClose}
                    addToInput={addToInput}
                    textareaRef={textareaRef}
                />
            )}
        </div>
    );
};