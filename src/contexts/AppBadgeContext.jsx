import { createContext } from "preact";
import { useEffect, useRef, useCallback } from "preact/hooks";

export const AppBadgeContext = createContext(null);

export function AppBadgeProvider({ children }) {
    const faviconElementRef = useRef(null);
    const originalFaviconImgRef = useRef(null);

    useEffect(() => {
        faviconElementRef.current = document.head.querySelector("link[rel='shortcut icon']");

        const img = new Image();
        img.src = faviconElementRef.current.href;
        if (img.complete) {
            originalFaviconImgRef.current = img;
        } else {
            img.addEventListener("load", () => {
                originalFaviconImgRef.current = img;
            });
        };
    }, []);

    const setAppBadge = useCallback(async (number) => {
        if (!originalFaviconImgRef.current || !faviconElementRef.current) return;

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = originalFaviconImgRef.current.width;
        canvas.height = originalFaviconImgRef.current.height;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(originalFaviconImgRef.current, 0, 0, canvas.width, canvas.height);

        const radius = (canvas.width * 0.6) / 2;
        const x = canvas.width - radius;
        const y = canvas.height - radius;

        ctx.beginPath();
        ctx.roundRect(
            x - radius * (number > 9 ? 1.7 : 1),
            y - radius,
            radius * 2 * (number > 9 ? 1.35 : 1),
            radius * 2,
            radius
        );
        ctx.fillStyle = "#dd0000";
        ctx.fill();
        ctx.closePath();

        if (number > 0) {
            const numberText = number > 9 ? "+9" : String(number);
            const metrics = ctx.measureText(numberText);
            ctx.fillStyle = "#ffffff";
            ctx.font = `bold ${canvas.width * 0.6}px Arial`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(
                numberText,
                x - (number > 9 ? metrics.width : 0),
                y + (metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent) / 2
            );
        } else {
            const smallRadius = (canvas.width * 0.17) / 2;
            ctx.beginPath();
            ctx.arc(x, y, smallRadius, 0, Math.PI * 2);
            ctx.fillStyle = "#ffffff";
            ctx.fill();
            ctx.closePath();
        };

        faviconElementRef.current.href = canvas.toDataURL("image/x-icon");

        try {
            await navigator.setAppBadge(number);
        } catch (error) {};
    }, []);

    const clearAppBadge = useCallback(async () => {
        if (!originalFaviconImgRef.current || !faviconElementRef.current) return;

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = originalFaviconImgRef.current.width;
        canvas.height = originalFaviconImgRef.current.height;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(originalFaviconImgRef.current, 0, 0, canvas.width, canvas.height);

        faviconElementRef.current.href = canvas.toDataURL("image/x-icon");

        try {
            await navigator.clearAppBadge();
        } catch (error) { };
    }, []);

    return (
        <AppBadgeContext.Provider value={{ setAppBadge, clearAppBadge }}>
            {children}
        </AppBadgeContext.Provider>
    );
};