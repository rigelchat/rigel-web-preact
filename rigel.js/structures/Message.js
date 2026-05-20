import { DiscordSnowflake } from "@sapphire/snowflake";
import Base from "./Base.js";
import MessagePayload from "./MessagePayload.js";
import Mentions from "./MessageMentions.js";
import { NonSystemMessageTypes } from "../Constants.js";
import { RigeljsError, ErrorCodes } from "../errors.js";
import { messageLink } from "../utils/Formatters.js";

class Message extends Base {
    constructor(client, data) {
        super(client);
        this.channelId = data.channel_id;
        this.guildId = data.guild_id ?? this.channel?.guild?.id ?? null;
        this._patch(data);
    };

    _patch(data) {
        this.id = data.id;

        this.createdTimestamp = DiscordSnowflake.timestampFrom(this.id);

        if ("type" in data) {
            this.type = data.type;
            this.system = !NonSystemMessageTypes.includes(this.type);
        } else {
            this.system ??= null;
            this.type ??= null;
        };

        if ("content" in data) {
            this.content = data.content;
        } else {
            this.content ??= null;
        };

        if ("author" in data) {
            this.author = this.client.users._add(data.author, !data.webhook_id);
        } else {
            this.author ??= null;
        };

        if ("pinned" in data) {
            this.pinned = Boolean(data.pinned);
        } else {
            this.pinned ??= null;
        };

        if ("nonce" in data) {
            this.nonce = data.nonce;
        } else {
            this.nonce ??= null;
        };

        if (data.edited_timestamp) {
            this.editedTimestamp = new Date(data.edited_timestamp).getTime();
        } else {
            this.editedTimestamp ??= null;
        };

        if (!this.mentions) {
            this.mentions = new Mentions(
                this,
                data.mentions,
                data.mention_roles,
                data.mention_everyone,
                data.mention_channels,
                data.referenced_message?.author,
            );
        } else {
            this.mentions = new Mentions(
                this,
                data.mentions ?? this.mentions.users,
                data.mention_roles ?? this.mentions.roles,
                data.mention_everyone ?? this.mentions.everyone,
                data.mention_channels ?? this.mentions.crosspostedChannels,
                data.referenced_message?.author ?? this.mentions.repliedUser
            );
        };

        if ("webhook_id" in data) {
            this.webhookId = data.webhook_id;
        } else {
            this.webhookId ??= null;
        };

        if ("attachments" in data) {
            this.attachments = data.attachments.map(attachment => ({
                id: attachment.id,
                filename: attachment.filename,
                description: attachment.description ?? null,
                contentType: attachment.content_type,
                size: attachment.size,
                url: attachment.url,
                proxyUrl: attachment.proxy_url,
                height: attachment.height ?? null,
                width: attachment.width ?? null,
                ephemeral: attachment.ephemeral ?? false,
                duration: attachment.duration_secs ?? null,
                waveform: attachment.waveform ?? null,
                flags: attachment.flags ?? 0,
                contentScanVersion: attachment.content_scan_version ?? null,
                placeholder: attachment.placeholder ?? null,
                placeholderVersion: attachment.placeholder_version ?? null
            }));
        } else {
            this.attachments ??= [];
        };

        if ("message_reference" in data && data.message_reference) {
            this.reference = {
                channelId: data.message_reference.channel_id,
                guildId: data.message_reference.guild_id,
                messageId: data.message_reference.message_id,
                type: data.message_reference.type,
            };
        } else {
            this.reference ??= null;
        };
    };

    get channel() {
        return this.client.channels.resolve(this.channelId);
    };

    get partial() {
        return typeof this.content !== "string" || !this.author;
    };

    get member() {
        return this.guild?.members.resolve(this.author) ?? null;
    };

    get createdAt() {
        return new Date(this.createdTimestamp);
    };

    get editedAt() {
        return this.editedTimestamp && new Date(this.editedTimestamp);
    };

    get guild() {
        return this.client.guilds.resolve(this.guildId) ?? this.channel?.guild ?? null;
    };

    get url() {
        return messageLink(this.client, this.guildId, this.channelId, this.id);
    };

    async edit(options) {
        if (!this.channel) throw new RigeljsError(ErrorCodes.ChannelNotCached);
        return this.channel.messages.edit(this, options);
    };

    async delete() {
        if (!this.channel) throw new RigeljsError(ErrorCodes.ChannelNotCached);
        await this.channel.messages.delete(this.id);
        return this;
    };

    async reply(options) {
        if (!this.channel) throw new RigeljsError(ErrorCodes.ChannelNotCached);

        let data;
        if (options instanceof MessagePayload) {
            data = options;
        } else {
            data = MessagePayload.create(this, options, {
                reply: {
                    messageReference: this,
                    failIfNotExists: options?.failIfNotExists
                }
            });
        };

        return this.channel.send(data);
    };
};

export default Message;