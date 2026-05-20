import { AllowedExtensions, AllowedSizes } from "../Constants.js";

class CDN {
    constructor (client) {
        this.client = client;
    };

    dynamicMakeURL(route, hash, { forceStatic = false, ...options } = {}) {
        return this.makeURL(route, !forceStatic && hash.startsWith("a_") ? { ...options, extension: "gif" } : options);
    };

    makeURL(route, {
        base = this.client.options.rest.cdn,
        extension = AllowedExtensions[0],
        size
    } = {}) {
        extension = String(extension).toLowerCase();
        if (!AllowedExtensions.includes(extension)) throw new RangeError(`Invalid extension provided: ${extension}\n    Must be one of: ${AllowedExtensions.join(", ")}`);
        if (size && !AllowedSizes.includes(size)) throw new RangeError(`Invalid size provided: ${size}\n    Must be one of: ${AllowedSizes.join(", ")}`);
        const url = new URL(`${base}${route}.${extension}`);
        if (size) url.searchParams.set("size", String(size));
        return url.toString();
    };

    icon(id, iconHash, options) {
        return this.dynamicMakeURL(`/icons/${id}/${iconHash}`, iconHash, options);
    };

    banner(id, bannerHash, options) {
        return this.dynamicMakeURL(`/banners/${id}/${bannerHash}`, bannerHash, options);
    };

    avatar(id, avatarHash, options) {
        return this.dynamicMakeURL(`/avatars/${id}/${avatarHash}`, avatarHash, options);
    };

    defaultAvatar(index) {
        return this.makeURL(`/embed/avatars/${index}`, { extension: "png" });
    };

    avatarDecoration(userIdOrAsset, userAvatarDecoration, options) {
        if (userAvatarDecoration) {
            return this.makeURL(`/avatar-decorations/${userIdOrAsset}/${userAvatarDecoration}`, options);
        };
        return this.makeURL(`/avatar-decoration-presets/${userIdOrAsset}`, { ...options, extension: "png" });
    };

    roleIcon(roleId, roleIcon, options) {
        return this.makeURL(`/role-icons/${roleId}/${roleIcon}`, options);
    };
};

export default CDN;