export const ErrorCodes = Object.fromEntries([
    "ClientInvalidOption",
    "ClientInvalidProvidedShards",
    "ClientMissingIntents",
    "ClientNotReady",

    "TokenInvalid",
    "TokenMissing",
    "ApplicationCommandPermissionsTokenMissing",

    "WSCloseRequested",
    "WSConnectionExists",
    "WSNotOpen",
    "ManagerDestroyed",

    "BitFieldInvalid",

    "ShardingInvalid",
    "ShardingRequired",
    "InvalidIntents",
    "DisallowedIntents",
    "ShardingNoShards",
    "ShardingInProcess",
    "ShardingInvalidEvalBroadcast",
    "ShardingShardNotFound",
    "ShardingAlreadySpawned",
    "ShardingProcessExists",
    "ShardingWorkerExists",
    "ShardingReadyTimeout",
    "ShardingReadyDisconnected",
    "ShardingReadyDied",
    "ShardingNoChildExists",
    "ShardingShardMiscalculation",

    "ColorRange",
    "ColorConvert",

    "InviteOptionsMissingChannel",

    "ButtonLabel",
    "ButtonURL",
    "ButtonCustomId",

    "SelectMenuCustomId",
    "SelectMenuPlaceholder",
    "SelectOptionLabel",
    "SelectOptionValue",
    "SelectOptionDescription",

    "InteractionCollectorError",

    "FileNotFound",

    "UserBannerNotFetched",
    "UserNoDMChannel",

    "VoiceNotStageChannel",

    "VoiceStateNotOwn",
    "VoiceStateInvalidType",

    "ReqResourceType",

    "ImageFormat",
    "ImageSize",

    "MessageBulkDeleteType",
    "MessageContentType",
    "MessageNonceRequired",
    "MessageNonceType",

    "SplitMaxLen",

    "BanResolveId",
    "FetchBanResolveId",

    "PruneDaysType",

    "GuildChannelResolve",
    "GuildVoiceChannelResolve",
    "GuildChannelOrphan",
    "GuildChannelUnowned",
    "GuildOwned",
    "GuildMembersTimeout",
    "GuildSoundboardSoundsTimeout",
    "GuildUncachedMe",
    "ChannelNotCached",
    "StageChannelResolve",
    "GuildScheduledEventResolve",
    "FetchOwnerId",

    "InvalidType",
    "InvalidElement",

    "MessageThreadParent",
    "MessageExistingThread",
    "ThreadInvitableType",

    "WebhookMessage",
    "WebhookTokenUnavailable",
    "WebhookURLInvalid",
    "WebhookApplication",
    "MessageReferenceMissing",

    "EmojiType",
    "EmojiManaged",
    "MissingManageGuildExpressionsPermission",
    "MissingManageEmojisAndStickersPermission",

    "NotGuildSoundboardSound",
    "NotGuildSticker",

    "ReactionResolveUser",

    "VanityURL",

    "InviteResolveCode",

    "InviteNotFound",

    "DeleteGroupDMChannel",
    "FetchGroupDMChannel",

    "MemberFetchNonceLength",

    "GlobalCommandPermissions",
    "GuildUncachedEntityResolve",

    "InteractionAlreadyReplied",
    "InteractionNotReplied",
    "InteractionEphemeralReplied",

    "CommandInteractionOptionNotFound",
    "CommandInteractionOptionType",
    "CommandInteractionOptionEmpty",
    "CommandInteractionOptionNoSubcommand",
    "CommandInteractionOptionNoSubcommandGroup",
    "CommandInteractionOptionInvalidChannelType",
    "AutocompleteInteractionOptionNoFocusedOption",

    "ModalSubmitInteractionFieldNotFound",
    "ModalSubmitInteractionFieldType",

    "InvalidMissingScopes",
    "InvalidScopesWithPermissions",

    "NotImplemented",

    "SweepFilterReturn",

    "GuildForumMessageRequired",

    "EntitlementCreateInvalidOwner",

    "BulkBanUsersOptionEmpty",

    "PollAlreadyExpired"
].map((key) => [key, key]));

const Messages = {
    [ErrorCodes.ClientInvalidOption]: (prop, must) => `The ${prop} option must be ${must}`,
    [ErrorCodes.ClientInvalidProvidedShards]: "None of the provided shards were valid.",
    [ErrorCodes.ClientMissingIntents]: "Valid intents must be provided for the Client.",
    [ErrorCodes.ClientNotReady]: (action) => `The client needs to be logged in to ${action}.`,

    [ErrorCodes.TokenInvalid]: "An invalid token was provided.",
    [ErrorCodes.TokenMissing]: "Request to use token, but token was unavailable to the client.",
    [ErrorCodes.ApplicationCommandPermissionsTokenMissing]: "Editing application command permissions requires an OAuth2 bearer token, but none was provided.",

    [ErrorCodes.WSCloseRequested]: "WebSocket closed due to user request.",
    [ErrorCodes.WSConnectionExists]: "There is already an existing WebSocket connection.",
    [ErrorCodes.WSNotOpen]: (data = "data") => `WebSocket not open to send ${data}`,
    [ErrorCodes.ManagerDestroyed]: "Manager was destroyed.",

    [ErrorCodes.BitFieldInvalid]: (bit) => `Invalid bitfield flag or number: ${bit}.`,

    [ErrorCodes.ShardingInvalid]: "Invalid shard settings were provided.",
    [ErrorCodes.ShardingRequired]: "This session would have handled too many guilds - Sharding is required.",
    [ErrorCodes.InvalidIntents]: "Invalid intent provided for WebSocket intents.",
    [ErrorCodes.DisallowedIntents]: "Privileged intent provided is not enabled or whitelisted.",
    [ErrorCodes.ShardingNoShards]: "No shards have been spawned.",
    [ErrorCodes.ShardingInProcess]: "Shards are still being spawned.",
    [ErrorCodes.ShardingInvalidEvalBroadcast]: "Script to evaluate must be a function",
    [ErrorCodes.ShardingShardNotFound]: (id) => `Shard ${id} could not be found.`,
    [ErrorCodes.ShardingAlreadySpawned]: (count) => `Already spawned ${count} shards.`,
    [ErrorCodes.ShardingProcessExists]: (id) => `Shard ${id} already has an active process.`,
    [ErrorCodes.ShardingWorkerExists]: (id) => `Shard ${id} already has an active worker.`,
    [ErrorCodes.ShardingReadyTimeout]: (id) => `Shard ${id}'s Client took too long to become ready.`,
    [ErrorCodes.ShardingReadyDisconnected]: (id) => `Shard ${id}'s Client disconnected before becoming ready.`,
    [ErrorCodes.ShardingReadyDied]: (id) => `Shard ${id}'s process exited before its Client became ready.`,
    [ErrorCodes.ShardingNoChildExists]: (id) => `Shard ${id} has no active process or worker.`,
    [ErrorCodes.ShardingShardMiscalculation]: (shard, guild, count) => `Calculated invalid shard ${shard} for guild ${guild} with ${count} shards.`,

    [ErrorCodes.ColorRange]: "Color must be within the range 0 - 16777215 (0xFFFFFF).",
    [ErrorCodes.ColorConvert]: (color) => `Unable to convert "${color}" to a number.`,

    [ErrorCodes.InviteOptionsMissingChannel]: "A valid guild channel must be provided when GuildScheduledEvent is EXTERNAL.",

    [ErrorCodes.ButtonLabel]: "MessageButton label must be a string",
    [ErrorCodes.ButtonURL]: "MessageButton URL must be a string",
    [ErrorCodes.ButtonCustomId]: "MessageButton customId must be a string",

    [ErrorCodes.SelectMenuCustomId]: "MessageSelectMenu customId must be a string",
    [ErrorCodes.SelectMenuPlaceholder]: "MessageSelectMenu placeholder must be a string",
    [ErrorCodes.SelectOptionLabel]: "MessageSelectOption label must be a string",
    [ErrorCodes.SelectOptionValue]: "MessageSelectOption value must be a string",
    [ErrorCodes.SelectOptionDescription]: "MessageSelectOption description must be a string",

    [ErrorCodes.InteractionCollectorError]: (reason) => `Collector received no interactions before ending with reason: ${reason}`,

    [ErrorCodes.FileNotFound]: (file) => `File could not be found: ${file}`,

    [ErrorCodes.UserBannerNotFetched]: "You must fetch this user's banner before trying to generate its URL!",
    [ErrorCodes.UserNoDMChannel]: "No DM Channel exists!",

    [ErrorCodes.VoiceNotStageChannel]: "You are only allowed to do this in stage channels.",

    [ErrorCodes.VoiceStateNotOwn]: "You cannot self-deafen/mute/request to speak on VoiceStates that do not belong to the ClientUser.",
    [ErrorCodes.VoiceStateInvalidType]: (name) => `${name} must be a boolean.`,

    [ErrorCodes.ReqResourceType]: "The resource must be a string, Buffer or a valid file stream.",

    [ErrorCodes.ImageFormat]: (format) => `Invalid image format: ${format}`,
    [ErrorCodes.ImageSize]: (size) => `Invalid image size: ${size}`,

    [ErrorCodes.MessageBulkDeleteType]: "The messages must be an Array, Collection, or number.",
    [ErrorCodes.MessageContentType]: "Message content must be a string.",
    [ErrorCodes.MessageNonceRequired]: "Message nonce is required when enforceNonce is true.",
    [ErrorCodes.MessageNonceType]: "Message nonce must be an integer or a string.",

    [ErrorCodes.SplitMaxLen]: "Chunk exceeds the max length and contains no split characters.",

    [ErrorCodes.BanResolveId]: (ban = false) => `Couldn't resolve the user id to ${ban ? "ban" : "unban"}.`,
    [ErrorCodes.FetchBanResolveId]: "Couldn't resolve the user id to fetch the ban.",

    [ErrorCodes.PruneDaysType]: "Days must be a number",

    [ErrorCodes.GuildChannelResolve]: "Could not resolve channel to a guild channel.",
    [ErrorCodes.GuildVoiceChannelResolve]: "Could not resolve channel to a guild voice channel.",
    [ErrorCodes.GuildChannelOrphan]: "Could not find a parent to this guild channel.",
    [ErrorCodes.GuildChannelUnowned]: "The fetched channel does not belong to this manager's guild.",
    [ErrorCodes.GuildOwned]: "Guild is owned by the client.",
    [ErrorCodes.GuildMembersTimeout]: "Members didn't arrive in time.",
    [ErrorCodes.GuildSoundboardSoundsTimeout]: "Soundboard sounds didn't arrive in time.",
    [ErrorCodes.GuildUncachedMe]: "The client user as a member of this guild is uncached.",
    [ErrorCodes.ChannelNotCached]: "Could not find the channel where this message came from in the cache!",
    [ErrorCodes.StageChannelResolve]: "Could not resolve channel to a stage channel.",
    [ErrorCodes.GuildScheduledEventResolve]: "Could not resolve the guild scheduled event.",
    [ErrorCodes.FetchOwnerId]: (type) => `Couldn't resolve the ${type} ownerId to fetch the ${type} ${type === "group DM" ? "owner" : "member"}.`,

    [ErrorCodes.InvalidType]: (name, expected, an = false) => `Supplied ${name} is not a${an ? "n" : ""} ${expected}.`,
    [ErrorCodes.InvalidElement]: (type, name, elem) => `Supplied ${type} ${name} includes an invalid element: ${elem}`,

    [ErrorCodes.MessageThreadParent]: "The message was not sent in a guild text or news channel",
    [ErrorCodes.MessageExistingThread]: "The message already has a thread",
    [ErrorCodes.ThreadInvitableType]: (type) => `Invitable cannot be edited on ${type}`,

    [ErrorCodes.WebhookMessage]: "The message was not sent by a webhook.",
    [ErrorCodes.WebhookTokenUnavailable]: "This action requires a webhook token, but none is available.",
    [ErrorCodes.WebhookURLInvalid]: "The provided webhook URL is not valid.",
    [ErrorCodes.WebhookApplication]: "This message webhook belongs to an application and cannot be fetched.",
    [ErrorCodes.MessageReferenceMissing]: "The message does not reference another message",

    [ErrorCodes.EmojiType]: "Emoji must be a string or GuildEmoji/ReactionEmoji",
    [ErrorCodes.EmojiManaged]: "Emoji is managed and has no Author.",
    [ErrorCodes.MissingManageGuildExpressionsPermission]: (guild) => `Client must have Manage Guild Expressions permission in guild ${guild} to see emoji authors.`,
    [ErrorCodes.MissingManageEmojisAndStickersPermission]: (guild) => `Client must have Manage Emojis and Stickers permission in guild ${guild} to see emoji authors.`,

    [ErrorCodes.NotGuildSoundboardSound]: (action) => `Soundboard sound is a default (non-guild) soundboard sound and can't be ${action}.`,
    [ErrorCodes.NotGuildSticker]: "Sticker is a standard (non-guild) sticker and has no author.",

    [ErrorCodes.ReactionResolveUser]: "Couldn't resolve the user id to remove from the reaction.",

    [ErrorCodes.VanityURL]: "This guild does not have the vanity URL feature enabled.",

    [ErrorCodes.InviteResolveCode]: "Could not resolve the code to fetch the invite.",

    [ErrorCodes.InviteNotFound]: "Could not find the requested invite.",

    [ErrorCodes.DeleteGroupDMChannel]: "Bots don't have access to Group DM Channels and cannot delete them",
    [ErrorCodes.FetchGroupDMChannel]: "Bots don't have access to Group DM Channels and cannot fetch them",

    [ErrorCodes.MemberFetchNonceLength]: "Nonce length must not exceed 32 characters.",

    [ErrorCodes.GlobalCommandPermissions]: "Permissions for global commands may only be fetched or modified by providing a GuildResolvable or from a guild's application command manager.",
    [ErrorCodes.GuildUncachedEntityResolve]: (type) => `Cannot resolve ${type} from an arbitrary guild, provide an id instead`,

    [ErrorCodes.InteractionAlreadyReplied]: "The reply to this interaction has already been sent or deferred.",
    [ErrorCodes.InteractionNotReplied]: "The reply to this interaction has not been sent or deferred.",
    [ErrorCodes.InteractionEphemeralReplied]: "Ephemeral responses cannot be deleted.",

    [ErrorCodes.CommandInteractionOptionNotFound]: (name) => `Required option "${name}" not found.`,
    [ErrorCodes.CommandInteractionOptionType]: (name, type, expected) => `Option "${name}" is of type: ${type}; expected ${expected}.`,
    [ErrorCodes.CommandInteractionOptionEmpty]: (name, type) => `Required option "${name}" is of type: ${type}; expected a non-empty value.`,
    [ErrorCodes.CommandInteractionOptionNoSubcommand]: "No subcommand specified for interaction.",
    [ErrorCodes.CommandInteractionOptionNoSubcommandGroup]: "No subcommand group specified for interaction.",
    [ErrorCodes.CommandInteractionOptionInvalidChannelType]: (name, type, expected) => `The type of channel of the option "${name}" is: ${type}; expected ${expected}.`,
    [ErrorCodes.AutocompleteInteractionOptionNoFocusedOption]: "No focused option for autocomplete interaction.",

    [ErrorCodes.ModalSubmitInteractionFieldNotFound]: (customId) => `Required field with custom id "${customId}" not found.`,
    [ErrorCodes.ModalSubmitInteractionFieldType]: (customId, type, expected) => `Field with custom id "${customId}" is of type: ${type}; expected ${expected}.`,

    [ErrorCodes.InvalidMissingScopes]: "At least one valid scope must be provided for the invite",
    [ErrorCodes.InvalidScopesWithPermissions]: "Permissions cannot be set without the bot scope.",

    [ErrorCodes.NotImplemented]: (what, name) => `Method ${what} not implemented on ${name}.`,

    [ErrorCodes.SweepFilterReturn]: "The return value of the sweepFilter function was not false or a Function",

    [ErrorCodes.GuildForumMessageRequired]: "You must provide a message to create a guild forum thread",

    [ErrorCodes.EntitlementCreateInvalidOwner]: "You must provide either a guild or a user to create an entitlement, but not both",

    [ErrorCodes.BulkBanUsersOptionEmpty]: "Option 'users' array or collection is empty",

    [ErrorCodes.PollAlreadyExpired]: "This poll has already expired."
};

function message(code, args) {
    if (!(code in ErrorCodes)) throw new Error("Error code must be a valid RigeljsErrorCodes");
    const msg = Messages[code];
    if (!msg) throw new Error(`No message associated with error code: ${code}.`);
    if (typeof msg === "function") return msg(...args);
    if (!args?.length) return msg;
    args.unshift(msg);
    return String(...args);
};

function makeRigeljsError(Base) {
    return class RigeljsError extends Base {
        constructor(code, ...args) {
            super(message(code, args));
            this.code = code;
            Error.captureStackTrace?.(this, RigeljsError);
        };

        get name() {
            return `${super.name} [${this.code}]`;
        };
    };
};

export const RigeljsError = makeRigeljsError(Error);
export const RigeljsTypeError = makeRigeljsError(TypeError);
export const RigeljsRangeError = makeRigeljsError(RangeError);