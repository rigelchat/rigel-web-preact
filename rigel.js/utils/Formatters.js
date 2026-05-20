export function channelLink(client, guildId, channelId) {
    const baseUrl = client.options.rest.base;
    return `${baseUrl}/channels/${guildId}/${channelId}`;
};

export function messageLink(client, guildId, channelId, messageId) {
    const baseUrl = client.options.rest.base;
    return `${baseUrl}/channels/${guildId}/${channelId}/${messageId}`;
};