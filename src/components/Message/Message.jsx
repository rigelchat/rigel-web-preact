import { MessageType } from "rigel.js";
import DefaultMessage from "./DefaultMessage";
import UserJoinMessage from "./UserJoinMessage";
import GuildBoostMessage from "./GuildBoostMessage";
import AutoModerationActionMessage from "./AutoModerationActionMessage";

export default function Message({ client, message, isGroupStart, setMessages }) {
    switch (message.type) {
        case MessageType.Default:
        case MessageType.Reply: {
            return <DefaultMessage client={client} message={message} isGroupStart={isGroupStart} setMessages={setMessages}/>;
        };

        case MessageType.UserJoin: {
            return <UserJoinMessage client={client} message={message} isGroupStart={isGroupStart}/>;
        };

        case MessageType.GuildBoost:
        case MessageType.GuildBoostTier1:
        case MessageType.GuildBoostTier2:
        case MessageType.GuildBoostTier3: {
            return <GuildBoostMessage client={client} message={message} isGroupStart={isGroupStart}/>;
        };

        case MessageType.AutoModerationAction: {
            return <AutoModerationActionMessage client={client} message={message} isGroupStart={isGroupStart}/>;
        };
    };
};