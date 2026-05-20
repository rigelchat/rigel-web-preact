export const AllowedExtensions = ["webp", "png", "gif"];
export const AllowedSizes = [16, 32, 64, 128, 256, 512, 1024, 2048, 4096];

export const WebSocketShardStatus = {
    Ready: "ready",
    Connecting: "connecting",
    Disconnected: "disconnected",
    Identifying: "identifying",
    Resuming: "resuming",
    Handshaking: "handshaking"
};

export const GatewayOPCodes = {
    Dispatch: 0,
    Heartbeat: 1,
    Identify: 2,
    PresenceUpdate: 3,
    VoiceStateUpdate: 4,
    Resume: 6,
    Reconnect: 7,
    RequestGuildMembers: 8,
    InvalidSession: 9,
    Hello: 10,
    HeartbeatACK: 11
};

export const GatewayCapabilityBits = {
    LazyUserNotes: 1 << 0,
    NoAffineUserIds: 1 << 1,
    VersionedReadStates: 1 << 2,
    VersionedUserGuildSettings: 1 << 3,
    DedupeUserObjects: 1 << 4,
    PrioritizedReadPayload: 1 << 5,
    MultipleGuildExperimentPopulations: 1 << 6,
    NonChannelReadStates: 1 << 7,
    AuthTokenRefresh: 1 << 8,
    UserSettingsProto: 1 << 9,
    ClientStateV2: 1 << 10,
    PassiveGuildUpdate: 1 << 11,
    AutoCallConnect: 1 << 12,
    DebounceMessageReactions: 1 << 13,
    PassiveGuildUpdateV2: 1 << 14,
    AutoLobbyConnect: 1 << 15
};

export const GatewayCloseEventCodes = {
    Normal: 1000,
	Resuming: 4200,
	UnknownError: 4000,
	UnknownOpcode: 4001,
	DecodeError: 4002,
	NotAuthenticated: 4003,
	AuthenticationFailed: 4004,
	AlreadyAuthenticated: 4005,
	InvalidSeq: 4007,
	RateLimited: 4008,
	SessionTimedOut: 4009,
	InvalidShard: 4010,
	ShardingRequired: 4011,
	InvalidAPIVersion: 4012,
	InvalidIntents: 4013,
	DisallowedIntents: 4014
};

export const Events = {
    ChannelCreate: "channelCreate",
    ChannelDelete: "channelDelete",
    ChannelPinsUpdate: "channelPinsUpdate",
    ChannelUpdate: "channelUpdate",
    Debug: "debug",
    Error: "error",
    GuildAvailable: "guildAvailable",
    GuildBanAdd: "guildBanAdd",
    GuildBanRemove: "guildBanRemove",
    GuildCreate: "guildCreate",
    GuildDelete: "guildDelete",
    GuildEmojiCreate: "emojiCreate",
    GuildEmojiDelete: "emojiDelete",
    GuildEmojiUpdate: "emojiUpdate",
    GuildMemberAdd: "guildMemberAdd",
    GuildMemberAvailable: "guildMemberAvailable",
    GuildMemberRemove: "guildMemberRemove",
    GuildMembersChunk: "guildMembersChunk",
    GuildMemberUpdate: "guildMemberUpdate",
    GuildRoleCreate: "roleCreate",
    GuildRoleDelete: "roleDelete",
    GuildRoleUpdate: "roleUpdate",
    GuildUnavailable: "guildUnavailable",
    GuildUpdate: "guildUpdate",
    Invalidated: "invalidated",
    InviteCreate: "inviteCreate",
    InviteDelete: "inviteDelete",
    MessageBulkDelete: "messageDeleteBulk",
    MessageCreate: "messageCreate",
    MessageDelete: "messageDelete",
    MessageReactionAdd: "messageReactionAdd",
    MessageReactionRemove: "messageReactionRemove",
    MessageReactionRemoveAll: "messageReactionRemoveAll",
    MessageReactionRemoveEmoji: "messageReactionRemoveEmoji",
    MessageUpdate: "messageUpdate",
    PresenceUpdate: "presenceUpdate",
    ReadStateUpdate: "readStateUpdate",
    Ready: "ready",
    ShardDisconnect: "shardDisconnect",
    ShardError: "shardError",
    ShardReady: "shardReady",
    ShardReconnecting: "shardReconnecting",
    ShardResume: "shardResume",
    TypingStart: "typingStart",
    UserUpdate: "userUpdate",
    UserSettingsUpdate: "userSettingsUpdate",
    Warn: "warn",
    WebhooksUpdate: "webhookUpdate"
};

export const UserFlags = {
	Staff: 1 << 0,
	Partner: 1 << 1,
	VerifiedBot: 1 << 16,
	VerifiedDeveloper: 1 << 17
};

export const MessageFlags = {
	SuppressEmbeds: 1 << 2,
	Ephemeral: 1 << 6,
	SuppressNotifications: 1 << 12
};

export const GuildSystemChannelFlags = {
    SuppressJoinNotifications: 1 << 0,
	SuppressPremiumSubscriptions: 1 << 1,
	SuppressGuildReminderNotifications: 1 << 2,
	SuppressJoinNotificationReplies: 1 << 3,
	SuppressRoleSubscriptionPurchaseNotifications: 1 << 4,
	SuppressRoleSubscriptionPurchaseNotificationReplies: 1 << 5
};

export const ChannelType = {
    GuildText: 0,
    DM: 1,
    GuildVoice: 2,
    GuildCategory: 4,
    GuildAnnouncement: 5,
    AnnouncementThread: 10,
    PublicThread: 11,
    PrivateThread: 12,
    GuildStageVoice: 13,
    GuildDirectory: 14,
    GuildForum: 15,
    GuildMedia: 16
};

export const GuildFeature = {
    AnimatedBanner: "ANIMATED_BANNER",
    AnimatedIcon: "ANIMATED_ICON",
    ApplicationCommandPermissionsV2: "APPLICATION_COMMAND_PERMISSIONS_V2",
    AutoModeration: "AUTO_MODERATION",
    Banner: "BANNER",
    Community: "COMMUNITY",
    CreatorMonetizableProvisional: "CREATOR_MONETIZABLE_PROVISIONAL",
    CreatorStorePage: "CREATOR_STORE_PAGE",
    DeveloperSupportServer: "DEVELOPER_SUPPORT_SERVER",
    Discoverable: "DISCOVERABLE",
    Featurable: "FEATURABLE",
    HasDirectoryEntry: "HAS_DIRECTORY_ENTRY",
    Hub: "HUB",
    InvitesDisabled: "INVITES_DISABLED",
    InviteSplash: "INVITE_SPLASH",
    LinkedToHub: "LINKED_TO_HUB",
    MemberVerificationGateEnabled: "MEMBER_VERIFICATION_GATE_ENABLED",
    MoreSoundboard: "MORE_SOUNDBOARD",
    MonetizationEnabled: "MONETIZATION_ENABLED",
    MoreStickers: "MORE_STICKERS",
    News: "NEWS",
    Partnered: "PARTNERED",
    PreviewEnabled: "PREVIEW_ENABLED",
    PrivateThreads: "PRIVATE_THREADS",
    RaidAlertsDisabled: "RAID_ALERTS_DISABLED",
    RelayEnabled: "RELAY_ENABLED",
    RoleIcons: "ROLE_ICONS",
    RoleSubscriptionsAvailableForPurchase: "ROLE_SUBSCRIPTIONS_AVAILABLE_FOR_PURCHASE",
    RoleSubscriptionsEnabled: "ROLE_SUBSCRIPTIONS_ENABLED",
    Soundboard: "SOUNDBOARD",
    TicketedEventsEnabled: "TICKETED_EVENTS_ENABLED",
    VanityURL: "VANITY_URL",
    Verified: "VERIFIED",
    VIPRegions: "VIP_REGIONS",
    WelcomeScreenEnabled: "WELCOME_SCREEN_ENABLED"
};

export const PermissionFlagsBits = {
    CreateInstantInvite: 1n << 0n,
    KickMembers: 1n << 1n,
    BanMembers: 1n << 2n,
    Administrator: 1n << 3n,
    ManageChannels: 1n << 4n,
    ManageGuild: 1n << 5n,
    AddReactions: 1n << 6n,
    ViewAuditLog: 1n << 7n,
    PrioritySpeaker: 1n << 8n,
    Stream: 1n << 9n,
    ViewChannel: 1n << 10n,
    SendMessages: 1n << 11n,
    SendTTSMessages: 1n << 12n,
    ManageMessages: 1n << 13n,
    EmbedLinks: 1n << 14n,
    AttachFiles: 1n << 15n,
    ReadMessageHistory: 1n << 16n,
    MentionEveryone: 1n << 17n,
    UseExternalEmojis: 1n << 18n,
    ViewGuildInsights: 1n << 19n,
    Connect: 1n << 20n,
    Speak: 1n << 21n,
    MuteMembers: 1n << 22n,
    DeafenMembers: 1n << 23n,
    MoveMembers: 1n << 24n,
    UseVAD: 1n << 25n,
    ChangeNickname: 1n << 26n,
    ManageNicknames: 1n << 27n,
    ManageRoles: 1n << 28n,
    ManageWebhooks: 1n << 29n,
    ManageGuildExpressions: 1n << 30n,
    UseApplicationCommands: 1n << 31n,
    RequestToSpeak: 1n << 32n,
    ManageEvents: 1n << 33n,
    ManageThreads: 1n << 34n,
    CreatePublicThreads: 1n << 35n,
    CreatePrivateThreads: 1n << 36n,
    UseExternalStickers: 1n << 37n,
    SendMessagesInThreads: 1n << 38n,
    UseEmbeddedActivities: 1n << 39n,
    ModerateMembers: 1n << 40n,
    ViewCreatorMonetizationAnalytics: 1n << 41n,
    UseSoundboard: 1n << 42n,
    CreateGuildExpressions: 1n << 43n,
    CreateEvents: 1n << 44n,
    UseExternalSounds: 1n << 45n,
    SendVoiceMessages: 1n << 46n,
    SendPolls: 1n << 49n,
    UseExternalApps: 1n << 50n
};

export const OverwriteType = {
    Role: 0,
    Member: 1
};

export const MessageType = {
    Default: 0,
    RecipientAdd: 1,
    RecipientRemove: 2,
    Call: 3,
    ChannelNameChange: 4,
    ChannelIconChange: 5,
    ChannelPinnedMessage: 6,
    UserJoin: 7,
    GuildBoost: 8,
    GuildBoostTier1: 9,
    GuildBoostTier2: 10,
    GuildBoostTier3: 11,
    ChannelFollowAdd: 12,
    GuildDiscoveryDisqualified: 14,
    GuildDiscoveryRequalified: 15,
    GuildDiscoveryGracePeriodInitialWarning: 16,
    GuildDiscoveryGracePeriodFinalWarning: 17,
    ThreadCreated: 18,
    Reply: 19,
    ChatInputCommand: 20,
    ThreadStarterMessage: 21,
    GuildInviteReminder: 22,
    ContextMenuCommand: 23,
    AutoModerationAction: 24,
    RoleSubscriptionPurchase: 25,
    InteractionPremiumUpsell: 26,
    StageStart: 27,
    StageEnd: 28,
    StageSpeaker: 29,
    StageRaiseHand: 30,
    StageTopic: 31,
    GuildApplicationPremiumSubscription: 32,
    GuildIncidentAlertModeEnabled: 36,
    GuildIncidentAlertModeDisabled: 37,
    GuildIncidentReportRaid: 38,
    GuildIncidentReportFalseAlarm: 39,
    PurchaseNotification: 44,
    PollResult: 46
};

export const NonSystemMessageTypes = [
    MessageType.Default,
    MessageType.Reply,
    MessageType.ChatInputCommand,
    MessageType.ContextMenuCommand
];

export const ActivityType = {
	Playing: 0,
	Streaming: 1,
	Listening: 2,
	Watching: 3,
	Custom: 4,
	Competing: 5
};

export const PresenceUpdateStatus = {
	Online: "online",
	DoNotDisturb: "dnd",
	Idle: "idle",
	Invisible: "invisible",
	Offline: "offline"
}