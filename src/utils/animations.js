import { useState } from "preact/hooks";
import { useSpring } from "@react-spring/web";
import { forceReflow } from "./index.js";

export const slideDownFadeIn = {
    from: {
        transform: "scale(1.05) translateY(-70px)",
        opacity: 0
    },
    to: {
        transform: "scale(1) translateY(0px)",
        opacity: 1
    },
    config: {
        tension: 350,
        friction: 24
    }
};

export const layerTransition = {
    from: { opacity: 0, transform: "scale(1.1)" },
    enter: { opacity: 1, transform: "scale(1)" },
    leave: { opacity: 0, transform: "scale(1.1)" },
    config: {
        tension: 350,
        friction: 24
    }
};

export const saveBarTransition = {
    from: { transform: "translate(-50%, 100%)" },
    enter: { transform: "translate(-50%, 0%)" },
    leave: [
        { transform: "translate(-50%, -60%)", config: { duration: 200 } },
        { transform: "translate(-50%, 100%)" }
    ],
    config: {
        tension: 350,
        friction: 24
    }
};

export function useBaseLayerStyle(active) {
    const [animating, setAnimating] = useState(false);
    const style = useSpring({
        opacity: active ? 0 : 1,
        scale: active ? 0.93 : 1,
        config: {
            tension: 350,
            friction: 24
        },
        onStart: () => setAnimating(true),
        onRest: () => {
            setAnimating(false);
            forceReflow();
        }
    });

    return (active || animating) ? style : { opacity: 1, transform: "none" };
};