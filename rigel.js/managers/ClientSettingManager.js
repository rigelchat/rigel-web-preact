import CachedManager from "./CachedManager.js";

class ClientSettingManager extends CachedManager {
    _patch(data) {
        if ("status" in data) {
            this.client.presence.status = data.status;
        };

        if ("afk_timeout" in data) {
            this.afkTimeout = data.afk_timeout;
        };

        if ("locale" in data) {
            this.locale = data.locale;
        };

        if ("theme" in data) {
            this.theme = data.theme;
        };

        if ("background_gradient_preset" in data) {
            this.backgroundGradientPreset = data.background_gradient_preset;
        };

        if ("developer_mode" in data) {
            this.developerMode = data.developer_mode;
        };
    };

    async edit(data) {
        const newSettings = await this.client.rest.updateUserSettings(data);
        this._patch(newSettings);
        return this;
    };

    setTheme(theme, backgroundGradientPreset) {
        return this.edit({ theme, backgroundGradientPreset });
    };

    toJSON() {
        return {
            status: this.client?.presence?.status,
            afkTimeout: this.afkTimeout,
            locale: this.locale,
            theme: this.theme,
            backgroundGradientPreset: this.backgroundGradientPreset,
            developerMode: this.developerMode
        };
    };
};

export default ClientSettingManager;