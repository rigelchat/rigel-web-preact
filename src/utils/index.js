import { getComputedColorElem } from "./color.js";

export function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export function isGecko() {
    return /(firefox|iceweasel|waterfox|icecat|librewolf|seamonkey)\//i.test(navigator.userAgent);
};

export function isPwa() {
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    const isIosStandalone = typeof navigator !== "undefined" && navigator.standalone === true;
    return isStandalone || isIosStandalone;
};

export function forceReflow() {
    document.documentElement.style.display = "none";
    document.documentElement.offsetHeight;
    document.documentElement.style.display = "";
};

export function applyUserTheme(userSettings) {
    const html = document.documentElement;
    html.style.setProperty("--saturation-factor", 1);
    html.classList.remove("theme-dark", "theme-light");
    html.classList.add(`theme-${getThemeName(userSettings)}`);

    if (userSettings?.backgroundGradientPreset) {
        html.classList.add("custom-theme-background");
        html.dataset.customTheme = userSettings.backgroundGradientPreset;
    } else {
        html.classList.remove("custom-theme-background");
        html.dataset.customTheme = null;
    };

    const themeColorMeta = document.querySelector("head meta[name='theme-color']");
    setTimeout(() => {
        themeColorMeta.content = getComputedColorElem(document.getElementById("app"));
    }, 100);
};

export function resetUserTheme() {
    const html = document.documentElement;
    html.classList.remove("theme-light", "custom-theme-background");
    html.classList.add("theme-dark");
    html.style.setProperty("--saturation-factor", 1);
    html.dataset.customTheme = null;

    const themeColorMeta = document.querySelector("head meta[name='theme-color']");
    themeColorMeta.content = "#313338";
};

export function getThemeName(userSettings) {
    if (!userSettings?.theme) return "dark";
    if (userSettings.theme === "auto") return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    return userSettings.theme;
};

export function openDiscordLoginPopup({
    popupWidth = 700,
    popupHeight = 800,
    clientId,
    redirectUri,
    scopes = "identify",
    responseType = "code",
    onSuccess,
    onError,
    onClose
}) {
    const params = `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=${popupWidth},height=${popupHeight},top=${window.innerHeight / 2 - popupHeight / 2},left=${window.innerWidth / 2 - popupWidth / 2}`;
    const url = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&response_type=${responseType}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}`;
    const popup = window.open(url, "Discord Auth", params);

    const messageInterval = setInterval(() => {
        if (popup) {
            popup.postMessage({
                params: { responseType },
                source: "discord-login-popup"
            }, window.location.origin || "*");
        };
    }, 500);

    const closeInterval = setInterval(() => {
        if (popup && popup.closed) {
            clearInterval(closeInterval);
            clearInterval(messageInterval);
            if (typeof onClose === "function") onClose();
        };
    }, 500);

    const closePopup = () => {
        clearInterval(closeInterval);
        clearInterval(messageInterval);
        window.removeEventListener("message", handleMessage);
        if (popup) popup.close();
    };

    const handleMessage = ({ data }) => {
        if (data.access_token || data.code) {
            if (typeof onSuccess === "function") onSuccess(data);
            closePopup();
        } else if (data.error_description) {
            if (typeof onError === "function") onError(data.error_description);
            closePopup();
        };
    };

    window.addEventListener("message", handleMessage, false);
};

export class Cache extends Map {
    constructor(options = {}) {
        super();
        this.defaultTTL = options.ttl ?? 60 * 1000;
        this.maxSize = options.maxSize ?? 100;
    };

    get(key) {
        const cached = super.get(key);
        if (!cached) return null;

        if (Date.now() > cached.expiresAt) {
            super.delete(key);
            return null;
        };

        return cached.data;
    };

    set(key, data, ttl) {
        if (this.size >= this.maxSize && !super.has(key)) {
            this.evictOldest();
        };

        return super.set(key, {
            data,
            expiresAt: Date.now() + (ttl ?? this.defaultTTL),
            createdAt: Date.now()
        });
    };

    has(key) {
        return this.get(key) !== null;
    };

    cleanup() {
        const now = Date.now();
        for (const [key, cached] of this) {
            if (now > cached.expiresAt) {
                super.delete(key);
            };
        };
    };

    evictOldest() {
        let oldestKey = null;
        let oldestTime = Infinity;

        for (const [key, cached] of this) {
            if (cached.createdAt < oldestTime) {
                oldestTime = cached.createdAt;
                oldestKey = key;
            };
        };

        if (oldestKey) {
            super.delete(oldestKey);
        };
    };
};