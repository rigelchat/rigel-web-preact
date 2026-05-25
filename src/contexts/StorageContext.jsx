import { createContext } from "preact";

export const StorageContext = createContext(null);

const Keys = {
    AppIcon: "appIcon",
    StartupVideo: "startupVideo",
    UserSettings: "userSettings",
    CollapsedCategories: "collapsedCategories",
    ChannelSection: "channelSection",
    Notifications: "notifications",
    VideoVolume: "videoVolume",
    InstanceConfig: "instanceConfig",
    Token: "token",
    MultiAccount: "multiAccount"
};

const localStorage = window.localStorage;
const sessionStorage = window.sessionStorage;
delete window.localStorage;
delete window.sessionStorage;

export function StorageProvider({ children }) {
    for (const key in Keys) {
        const storageKey = Keys[key];
        const value = localStorage.getItem(storageKey);
        if (value !== null) continue;
        const newValue = {
            [Keys.StartupVideo]: "default-2021",
            [Keys.ChannelSection]: JSON.stringify({ isMembersOpen: true }),
            [Keys.CollapsedCategories]: JSON.stringify({}),
            [Keys.Notifications]: JSON.stringify({ desktopEnabled: false }),
            [Keys.VideoVolume]: "1"
        }[storageKey];
        if (!newValue) continue;
        localStorage.setItem(storageKey, newValue);
    };

    // App Icon
    const getAppIcon = () => {
        return localStorage.getItem(Keys.AppIcon);
    };

    const setAppIcon = (appIcon) => {
        localStorage.setItem(Keys.AppIcon, appIcon);
    };

    // Startup Video
    const getStartupVideo = () => {
        return localStorage.getItem(Keys.StartupVideo);
    };

    const setStartupVideo = (startupVideo) => {
        localStorage.setItem(Keys.StartupVideo, startupVideo);
    };

    // Channel Section
    const getChannelSection = () => {
        return JSON.parse(localStorage.getItem(Keys.ChannelSection));
    };

    const setChannelSection = (channelSection) => {
        localStorage.setItem(Keys.ChannelSection, JSON.stringify(channelSection));
    };

    // User Settings
    const getUserSettings = () => {
        try {
            return JSON.parse(localStorage.getItem(Keys.UserSettings));
        } catch (error) {
            return {};
        };
    };

    const setUserSettings = (userSettings) => {
        localStorage.setItem(Keys.UserSettings, JSON.stringify(userSettings));
    };

    // Collapsed Categories
    const getCollapsedCategories = () => {
        return JSON.parse(localStorage.getItem(Keys.CollapsedCategories));
    };

    const setCollapsedCategories = (collapsedCategories) => {
        localStorage.setItem(Keys.CollapsedCategories, JSON.stringify(collapsedCategories));
    };

    const toggleCategoryCollapse = (categoryId, value) => {
        const collapsedCategories = getCollapsedCategories();
        if (value) {
            collapsedCategories[categoryId] = true;
        } else {
            delete collapsedCategories[categoryId];
        };
        setCollapsedCategories(collapsedCategories);
    };

    // Notifications
    const getNotifications = () => {
        return JSON.parse(localStorage.getItem(Keys.Notifications));
    };

    const setNotifications = (notifications) => {
        localStorage.setItem(Keys.Notifications, JSON.stringify(notifications));
    };

    // Token
    const getToken = () => {
        const token = localStorage.getItem(Keys.Token);
        return /^[\w-]+\.[\w-]+\.[\w-]+$/.test(token) ? token : null;
    };

    const setToken = (token) => {
        localStorage.setItem(Keys.Token, token);
    };

    // Multi Account
    const getAllAccounts = () => {
        try {
            return JSON.parse(localStorage.getItem(Keys.MultiAccount)) || [];
        } catch (error) {
            return [];
        };
    };

    const setMultiAccount = (multiAccount) => {
        localStorage.setItem(Keys.MultiAccount, JSON.stringify(multiAccount));
    };

    const addAccount = (newAccount) => {
        const accounts = getAllAccounts();

        const existingIndex = accounts.findIndex((account) => account.userId === newAccount.userId && account.instanceConfig.api === newAccount.instanceConfig.api);
        if (existingIndex !== -1) {
            accounts[existingIndex] = newAccount;
        } else {
            accounts.push(newAccount);
        };

        setMultiAccount(accounts);
    };

    const removeAccount = (userId) => {
        const accounts = getAllAccounts();
        const newAccounts = accounts.filter((acc) => acc.userId !== userId);
        setMultiAccount(newAccounts);
    };

    // Video Volume
    const getVideoVolume = () => {
        const volume = parseFloat(localStorage.getItem(Keys.VideoVolume));
        return isNaN(volume) ? 1 : Math.max(0, Math.min(1, volume));
    };

    const setVideoVolume = (volume) => {
        const parsedVolume = parseFloat(volume);
        const clampedVolume = Math.max(0, Math.min(1, isNaN(parsedVolume) ? 1 : parsedVolume));
        localStorage.setItem(Keys.VideoVolume, clampedVolume.toString());
    };

    // Instance Config
    const getInstanceConfig = () => {
        try {
            return JSON.parse(localStorage.getItem(Keys.InstanceConfig));
        } catch (error) {
            return {};
        };
    };

    const setInstanceConfig = (instanceConfig) => {
        localStorage.setItem(Keys.InstanceConfig, JSON.stringify(instanceConfig));
    };

    // Clear
    const safeClear = () => {
        for (const key of [
            Keys.AppIcon,
            Keys.StartupVideo,
            Keys.UserSettings,
            Keys.CollapsedCategories,
            Keys.ChannelSection,
            Keys.InstanceConfig,
            Keys.Token
        ]) {
            localStorage.removeItem(key);
        };
    };

    const hardClear = () => {
        for (const key of Keys) {
            localStorage.removeItem(key);
        };
    };

    const value = {
        // App Icon
        getAppIcon,
        setAppIcon,

        // Startup Video
        getStartupVideo,
        setStartupVideo,

        // Channel Section
        getChannelSection,
        setChannelSection,

        // User Settings
        getUserSettings,
        setUserSettings,

        // Collapsed Categories
        getCollapsedCategories,
        setCollapsedCategories,
        toggleCategoryCollapse,

        // Notifications
        getNotifications,
        setNotifications,

        // Token
        getToken,
        setToken,

        // Multi Account
        getAllAccounts,
        addAccount,
        removeAccount,

        // Video Volume
        getVideoVolume,
        setVideoVolume,

        // Instance Config
        getInstanceConfig,
        setInstanceConfig,

        // Utilities
        safeClear,
        hardClear
    };

    return (
        <StorageContext.Provider value={value}>
            {children}
        </StorageContext.Provider>
    );
};