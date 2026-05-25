import { useState, useEffect, useRef, useMemo } from "preact/hooks";
import { useTransition, animated, useSpring } from "@react-spring/web";
import { isMobile } from "../utils/index.js";

import styles from "./SlideLayout.module.css";

const ANIMATION_CONFIG = { tension: 300, friction: 35 };

export default function SlideLayout({ currentSlide, children, onTransitionStart, onTransitionEnd }) {
    const [activeSlide, setActiveSlide] = useState(currentSlide);
    const [measuringSlide, setMeasuringSlide] = useState(null);
    const slideRefs = useRef([]);
    const [height, setHeight] = useState(isMobile() ? "100%" : "auto");
    const [direction, setDirection] = useState("forward");
    const isFirstRender = useRef(true);

    const slides = useMemo(() => Array.isArray(children) ? children : [children], [children]);

    const heightSpring = useSpring({
        config: ANIMATION_CONFIG,
        height,
        immediate: isFirstRender.current
    });

    const transitions = useTransition(activeSlide, {
        from: { 
            position: "absolute",
            top: "50%",
            left: 0,
            width: "100%",
            opacity: 1, 
            transform: direction === "forward" ? "translateX(100%) translateY(-50%)" : "translateX(-100%) translateY(-50%)"
        },
        enter: { 
            position: "absolute",
            top: "50%",
            opacity: 1, 
            transform: "translateX(0%) translateY(-50%)"
        },
        leave: { 
            position: "absolute",
            top: "50%",
            opacity: 1, 
            transform: direction === "forward" ? "translateX(-100%) translateY(-50%)" : "translateX(100%) translateY(-50%)"
        },
        config: ANIMATION_CONFIG,
        immediate: isFirstRender.current,
        onStart: () => {
            if (typeof onTransitionStart === "function") {
                onTransitionStart(activeSlide, currentSlide);
            };
        },
        onRest: () => {
            if (typeof onTransitionEnd === "function") {
                onTransitionEnd(activeSlide);
            };
        }
    });

    useEffect(() => {
        if (currentSlide !== activeSlide) {
            isFirstRender.current = false;
            setMeasuringSlide(currentSlide);
        };
    }, [currentSlide, activeSlide]);

    useEffect(() => {
        if (measuringSlide !== null && slideRefs.current[measuringSlide]) {
            if (!isMobile()) {
                const nextHeight = slideRefs.current[measuringSlide].offsetHeight;
                setHeight(nextHeight);
            };
            setDirection(measuringSlide > activeSlide ? "forward" : "backward");
            setActiveSlide(measuringSlide);
            setMeasuringSlide(null);
        };
    }, [measuringSlide, activeSlide]);

    useEffect(() => {
        if (measuringSlide === null && !isMobile()) {
            const activeChild = slideRefs.current[activeSlide];
            if (activeChild) {
                setHeight(activeChild.offsetHeight);
            };
        };
    }, [activeSlide, measuringSlide]);

    useEffect(() => {
        if (isMobile()) return;
        
        const activeChild = slideRefs.current[activeSlide];
        if (!activeChild || measuringSlide !== null) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const newHeight = entry.target.offsetHeight;
                setHeight(newHeight);
            }
        });

        resizeObserver.observe(activeChild);

        return () => {
            resizeObserver.disconnect();
        };
    }, [activeSlide, measuringSlide]);

    return (
        <animated.div className={styles.slideContainer} style={heightSpring}>
            {measuringSlide !== null && (
                <div
                    ref={(el) => slideRefs.current[measuringSlide] = el}
                    className={`${styles.slide} ${styles.slideMeasuring}`}
                    style={{ height: isMobile() && "100%" }} // todo: casser sur mobile
                >
                    {slides[measuringSlide]}
                </div>
            )}
            {transitions((style, item) => (
                <animated.div
                    ref={(el) => slideRefs.current[item] = el}
                    className={styles.slide}
                    style={{
                        height: isMobile() && "100%",  // todo: casser sur mobile
                        ...style
                    }}
                >
                    {slides[item]}
                </animated.div>
            ))}
        </animated.div>
    );
};