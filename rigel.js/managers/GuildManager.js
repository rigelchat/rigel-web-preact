import CachedManager from "./CachedManager.js";
import Guild from "../structures/Guild.js";
import { resolveImage } from "../utils/DataResolver.js";
import { Events } from "../Constants.js";

class GuildManager extends CachedManager {
    constructor(client, iterable) {
        super(client, Guild, iterable);
    };

    async create({ name, icon = null }) {
        const data = await this.client.rest.createGuild({
            name,
            icon: icon && await resolveImage(icon)
        });

        return (
            this.client.guilds.cache.get(data.id) ??
            new Promise((resolve) => {
                let timeout;

                const handleGuild = (guild) => {
                    if (guild.id === data.id) {
                        clearTimeout(timeout);
                        this.client.decrementMaxListeners();
                        resolve(guild);
                    };
                };

                this.client.incrementMaxListeners();
                this.client.on(Events.GuildCreate, handleGuild);

                timeout = setTimeout(() => {
                    this.client.removeListener(Events.GuildCreate, handleGuild);
                    this.client.decrementMaxListeners();
                    resolve(this.client.guilds._add(data));
                }, 10000);
            })
        );
    };

    async fetchDiscoverable() {
        const data = await this.client.rest.getDiscoverableGuilds();

        // todo: move to a new structure
        return data.map((guild) => ({
            id: guild.id,
			name: guild.name,
			icon: guild.icon,
			banner: guild.banner,
			description: guild.description,
			vanityUrlCode: guild.vanity_url_code,
			approximatePresenceCount: guild.approximate_presence_count ?? null,
			approximateMemberCount: guild.approximate_member_count ?? guild.member_count ?? null,
            get nameAcronym() {
                return this.name.replace(/'s /g, " ").replace(/\w+/g, (e) => e[0]).replace(/\s/g, "");
            },
            iconURL: (options = {}) => {
                return guild.icon && this.client.cdn.icon(guild.id, guild.icon, options);
            },
            bannerURL: (options = {}) => {
                return guild.banner && this.client.cdn.banner(guild.id, guild.banner, options);
            }
        }));
    };
};

export default GuildManager;