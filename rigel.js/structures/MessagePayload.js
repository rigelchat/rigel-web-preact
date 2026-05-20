import Buffer from "buffer";
import { DiscordSnowflake } from "@sapphire/snowflake";
import Message from "./Message.js";
import MessageManager from "../managers/MessageManager.js";
import { MessageFlags } from "../Constants.js";
import { RigeljsError, RigeljsRangeError, ErrorCodes } from "../errors.js";
import { resolveFile } from "../utils/DataResolver.js";
import MessageFlagsBitField from "../utils/MessageFlagsBitField.js";
import { isJSONEncodable, verifyString, resolvePartialEmoji, basename } from "../utils/Utils.js";

class MessagePayload {
    constructor(target, options) {
        this.target = target;
        this.options = options;
        this.body = null;
        this.files = null;
    };

    static async resolveFile(fileLike) {
        let attachment;
        let name;

        const findName = (thing) => {
            if (typeof thing === "string") {
                return basename(thing);
            };

            if (thing.path) {
                return basename(thing.path);
            };

            return "file.jpg";
        };

        const ownAttachment = typeof fileLike === "string" || fileLike instanceof Buffer || typeof fileLike.pipe === "function";
        if (ownAttachment) {
            attachment = fileLike;
            name = findName(attachment);
        } else {
            attachment = fileLike.attachment;
            name = fileLike.name ?? findName(attachment);
        };

        const { data, contentType } = await resolveFile(attachment);
        return { data, name, contentType };
    };

    static create(target, options, extra = {}) {
        return new this(target, typeof options !== "object" || options === null ? { content: options, ...extra } : { ...options, ...extra });
    };

    get isWebhook() {
        // const Webhook = require('./Webhook');
        // const WebhookClient = require('../client/WebhookClient');
        // return this.target instanceof Webhook || this.target instanceof WebhookClient;
        return false;
    };

    get isUser() {
        // const User = require('./User');
        // const { GuildMember } = require('./GuildMember');
        // return this.target instanceof User || this.target instanceof GuildMember;
        return false;
    };

    get isMessage() {
        return this.target instanceof Message;
    };

    get isMessageManager() {
        return this.target instanceof MessageManager;
    };

    makeContent() {
        let content;
        if (this.options.content === null) {
            content = "";
        } else if (this.options.content !== undefined) {
            content = verifyString(this.options.content, RigeljsRangeError, ErrorCodes.MessageContentType, true);
        };
        return content;
    };

    resolveBody() {
        if (this.body) return this;
        const isInteraction = this.isInteraction;
        const isWebhook = this.isWebhook;

        const content = this.makeContent();
        const tts = Boolean(this.options.tts);

        let nonce;
        if (this.options.nonce !== undefined) {
            nonce = this.options.nonce;
            if (typeof nonce === "number" ? !Number.isInteger(nonce) : typeof nonce !== "string") {
                throw new RigeljsRangeError(ErrorCodes.MessageNonceType);
            };
        };

        let enforce_nonce = Boolean(this.options.enforceNonce);
        if (nonce === undefined) {
            if (this.options.enforceNonce !== false && this.target.client.options.enforceNonce) {
                nonce = DiscordSnowflake.generate().toString();
                enforce_nonce = true;
            } else if (enforce_nonce) {
                throw new RigeljsError(ErrorCodes.MessageNonceRequired);
            };
        };

        const components = this.options.components?.map((component) =>
            isJSONEncodable(component) ? component.toJSON() : this.target.client.options.jsonTransformer(component)
        );

        let username;
        let avatarURL;
        let threadName;
        let appliedTags;
        if (isWebhook) {
            username = this.options.username ?? this.target.name;
            if (this.options.avatarURL) avatarURL = this.options.avatarURL;
            if (this.options.threadName) threadName = this.options.threadName;
            if (this.options.appliedTags) appliedTags = this.options.appliedTags;
        };

        let flags;
        if (this.options.flags != null) {
            flags = new MessageFlagsBitField(this.options.flags).bitfield;
        };

        if (isInteraction && this.options.ephemeral) {
            flags |= MessageFlags.Ephemeral;
        };

        let allowedMentions =
            this.options.allowedMentions === undefined
                ? this.target.client.options.allowedMentions
                : this.options.allowedMentions;

        if (allowedMentions?.repliedUser !== undefined) {
            allowedMentions = { ...allowedMentions, replied_user: allowedMentions.repliedUser };
            delete allowedMentions.repliedUser;
        };

        let message_reference;
        if (typeof this.options.reply === "object") {
            const reference = this.options.reply.messageReference;
            const message_id = this.isMessage ? (reference.id ?? reference) : this.target.messages.resolveId(reference);
            if (message_id) {
                message_reference = {
                    message_id,
                    fail_if_not_exists: this.options.reply.failIfNotExists ?? this.target.client.options.failIfNotExists
                };
            };
        };

        if (typeof this.options.forward === 'object') {
            const reference = this.options.forward.message;
            const channel_id = reference.channelId ?? this.target.client.channels.resolveId(this.options.forward.channel);
            const guild_id = reference.guildId ?? this.target.client.guilds.resolveId(this.options.forward.guild);
            const message_id = this.target.messages.resolveId(reference);
            if (message_id) {
                if (!channel_id) throw new RigeljsError(ErrorCodes.InvalidType, 'channelId', 'TextBasedChannelResolvable');
                message_reference = {
                    type: MessageReferenceType.Forward,
                    message_id,
                    channel_id,
                    guild_id: guild_id ?? undefined
                };
            };
        };

        const attachments = this.options.files?.map((file, index) => ({
            id: index.toString(),
            description: file.description
        }));
        if (Array.isArray(this.options.attachments)) {
            this.options.attachments.push(...(attachments ?? []));
        } else {
            this.options.attachments = attachments;
        };

        let poll;
        if (this.options.poll) {
            poll = {
                question: {
                    text: this.options.poll.question.text,
                },
                answers: this.options.poll.answers.map(answer => ({
                    poll_media: { text: answer.text, emoji: resolvePartialEmoji(answer.emoji) },
                })),
                duration: this.options.poll.duration,
                allow_multiselect: this.options.poll.allowMultiselect,
                layout_type: this.options.poll.layoutType
            };
        };

        this.body = {
            content,
            tts,
            nonce,
            enforce_nonce,
            embeds: this.options.embeds?.map(embed =>
                isJSONEncodable(embed) ? embed.toJSON() : this.target.client.options.jsonTransformer(embed),
            ),
            components,
            username,
            avatar_url: avatarURL,
            allowed_mentions:
                this.isMessage && message_reference === undefined && this.target.author.id !== this.target.client.user.id
                    ? undefined
                    : allowedMentions,
            flags,
            message_reference,
            attachments: this.options.attachments,
            sticker_ids: this.options.stickers?.map(sticker => sticker.id ?? sticker),
            thread_name: threadName,
            applied_tags: appliedTags,
            poll
        };
        return this;
    };

    async resolveFiles() {
        if (this.files) return this;
        this.files = await Promise.all(this.options.files?.map((file) => this.constructor.resolveFile(file)) ?? []);
        return this;
    };
};

export default MessagePayload;