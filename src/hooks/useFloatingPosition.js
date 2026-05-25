import { useRef, useState, useEffect } from "preact/hooks";

export function useFloatingPosition(anchorRef = null, placement = "top", offset = 0) {
    const floatingRef = useRef(null);
    const [position, setPosition] = useState({});
    const [isPositioned, setIsPositioned] = useState(false);

    useEffect(() => {
        if (!anchorRef?.current || !floatingRef.current) {
            setIsPositioned(false);
            return;
        }

        const updatePosition = () => {
            const anchorRect = anchorRef.current.getBoundingClientRect();
            const floatingRect = floatingRef.current.getBoundingClientRect();
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;

            let style = {};

            switch (placement) {
                case "top":
                    style = {
                        bottom: `${windowHeight - anchorRect.top + offset}px`,
                        left: `${anchorRect.left + anchorRect.width / 2 - floatingRect.width / 2}px`,
                    };
                    break;

                case "top-left":
                    style = {
                        bottom: `${windowHeight - anchorRect.top + offset}px`,
                        left: `${anchorRect.left}px`,
                    };
                    break;

                case "top-right":
                    style = {
                        bottom: `${windowHeight - anchorRect.top + offset}px`,
                        right: `${windowWidth - anchorRect.right}px`,
                    };
                    break;

                case "bottom":
                    style = {
                        top: `${anchorRect.bottom + offset}px`,
                        left: `${anchorRect.left + anchorRect.width / 2 - floatingRect.width / 2}px`,
                    };
                    break;

                case "bottom-left":
                    style = {
                        top: `${anchorRect.bottom + offset}px`,
                        left: `${anchorRect.left}px`,
                    };
                    break;

                case "bottom-right":
                    style = {
                        top: `${anchorRect.bottom + offset}px`,
                        right: `${windowWidth - anchorRect.right}px`,
                    };
                    break;

                case "left":
                    style = {
                        top: `${anchorRect.top + anchorRect.height / 2 - floatingRect.height / 2}px`,
                        right: `${windowWidth - anchorRect.left + offset}px`,
                    };
                    break;

                case "right":
                    style = {
                        top: `${anchorRect.top + anchorRect.height / 2 - floatingRect.height / 2}px`,
                        left: `${anchorRect.right + offset}px`,
                    };
                    break;

                default:
                    style = {
                        bottom: `${windowHeight - anchorRect.top + offset}px`,
                        left: `${anchorRect.left}px`,
                    };
            }

            style.position = "fixed";
            style.zIndex = "1000";

            setPosition(style);
            setIsPositioned(true);
        };

        updatePosition();

        window.addEventListener("resize", updatePosition);
        window.addEventListener("scroll", updatePosition, true);

        return () => {
            window.removeEventListener("resize", updatePosition);
            window.removeEventListener("scroll", updatePosition, true);
        };
    }, [anchorRef, placement, offset]);

    return [floatingRef, position, isPositioned];
};