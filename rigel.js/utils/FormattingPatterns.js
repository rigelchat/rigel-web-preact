export default {
	User: /<@(?<id>\d{17,20})>/,
    UserWithNickname: /<@!(?<id>\d{17,20})>/,
	UserWithOptionalNickname: /<@!?(?<id>\d{17,20})>/,
	Channel: /<#(?<id>\d{17,20})>/,
	Role: /<@&(?<id>\d{17,20})>/,
	SlashCommand: /<\/(?<fullName>(?<name>[-_\p{Letter}\p{Number}\p{sc=Deva}\p{sc=Thai}]{1,32})(?: (?<subcommandOrGroup>[-_\p{Letter}\p{Number}\p{sc=Deva}\p{sc=Thai}]{1,32}))?(?: (?<subcommand>[-_\p{Letter}\p{Number}\p{sc=Deva}\p{sc=Thai}]{1,32}))?):(?<id>\d{17,20})>/u,
	Emoji: /<(?<animated>a)?:(?<name>\w{2,32}):(?<id>\d{17,20})>/,
	AnimatedEmoji: /<(?<animated>a):(?<name>\w{2,32}):(?<id>\d{17,20})>/,
	StaticEmoji: /<:(?<name>\w{2,32}):(?<id>\d{17,20})>/,
	Timestamp: /<t:(?<timestamp>-?\d{1,13})(:(?<style>[DFRTdft]))?>/,
	DefaultStyledTimestamp: /<t:(?<timestamp>-?\d{1,13})>/,
	StyledTimestamp: /<t:(?<timestamp>-?\d{1,13}):(?<style>[DFRTdft])>/,
	GuildNavigation: /<id:(?<type>customize|browse|guide|linked-roles)>/,
	LinkedRole: /<id:linked-roles:(?<id>\d{17,20})>/
};