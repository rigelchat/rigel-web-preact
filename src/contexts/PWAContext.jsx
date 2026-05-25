import { createContext } from "preact";
import { useState, useEffect } from "preact/hooks";
import { useRegisterSW } from "virtual:pwa-register/preact";

export const PWAContext = createContext();

export function PWAProvider({ children }) {
    const [deferredPrompt, setDeferredPrompt] = useState(null);

    const { needRefresh: [needRefresh, setNeedRefresh], updateServiceWorker } = useRegisterSW({
        onRegisteredSW(wScriptUrl, registration) {
            if (registration?.waiting) setNeedRefresh(true);
        },
        onNeedRefresh() {
            setNeedRefresh(true);
        }
    });

    useEffect(() => {
        const handler = (evt) => {
            evt.preventDefault();
            setDeferredPrompt(evt);
        };

        window.addEventListener("beforeinstallprompt", handler);

        return () => window.removeEventListener("beforeinstallprompt", handler);
    }, []);

    const installPWA = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
            setDeferredPrompt(null);
        };
    };

    return (
        <PWAContext.Provider value={{ deferredPrompt, installPWA, needRefresh, updateServiceWorker }}>
            {children}
        </PWAContext.Provider>
    );
};