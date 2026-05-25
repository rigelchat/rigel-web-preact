import { useState, useEffect, useRef, useCallback, useMemo } from "preact/hooks";
import classNames from "classnames";
import { Events } from "rigel.js";

import "./ChatContent.css";
import "./ChatForm.css";
import * as Icons from "../../icons/Icons";
import { useFormatter } from "../../hooks/useFormatter";
import ReverseInfiniteScroll from "../ReverseInfiniteScroll/ReverseInfiniteScroll";
import ChatSkeletonLoader from "../ChatSkeletonLoader/ChatSkeletonLoader";
import Message from "../Message/Message";
import ChatForm from "./ChatForm";

const FETCH_LIMIT = 50;
const conversationCache = new Map();

function WelcomeChat({ channel }) {
    return (
        <div className="welcome-container">
            <div className="empty-channel-icon">
                <Icons.ChannelIcons.GuildText/>
            </div>
            <h3 className="header">Bienvenue dans #{channel.name} !</h3>
            <div className="description">C'est le début du salon #{channel.name}.</div>
        </div>
    );
};

function MessageDivider({ date, isUnread, locale }) {
    const { dateFormatter } = useFormatter(locale);

    return (
        <div className={classNames("message-divider", {
            "is-unread": isUnread
        })}>
            {date && <span className="date">{dateFormatter.format(date)}</span>}
            {isUnread && (
                <div className="end-cap">
                    <svg class="cap" viewBox="0 0 8 13" width="8" height="13">
                        <path fill="var(--status-danger)" d="M8.16639 0.5H9C10.933 0.5 12.5 2.067 12.5 4V9C12.5 10.933 10.933 12.5 9 12.5H8.16639C7.23921 12.5 6.34992 12.1321 5.69373 11.4771L0.707739 6.5L5.69373 1.52292C6.34992 0.86789 7.23921 0.5 8.16639 0.5Z"/>
                    </svg>
                    nouveau
                </div>
            )}
        </div>
    );
};

export default function ChatContent({ client, channel }) {
    const [messages, setMessages] = useState([]);
    const [error, setError] = useState(null);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const scrollerRef = useRef(null);

    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            for (const [channelId, cache] of conversationCache.entries()) {
                if (channelId !== channel.id && now - (cache.lastAccess || 0) > 30 * 60 * 1000) {
                    conversationCache.delete(channelId);
                };
            };
        }, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        setError(false);
        let cache = conversationCache.get(channel.id);
        if (cache) {
            setMessages([...cache.messages]);
            setHasMoreMessages(cache.hasMoreMessages);
            cache.lastAccess = Date.now();
        } else {
            cache = {};
            setMessages([]);
            setHasMoreMessages(true);
            channel.messages.fetch({ limit: FETCH_LIMIT }).then(async (newMessages) => {
                const sorted = [...newMessages.values()].sort((a, b) => a.createdTimestamp - b.createdTimestamp);
                setMessages(sorted);
                setHasMoreMessages(sorted.length >= FETCH_LIMIT);
                cache.lastAccess = Date.now();
                cache.messages = sorted;
                cache.hasMoreMessages = sorted.length >= FETCH_LIMIT;
                conversationCache.set(channel.id, cache);
            }).catch((err) => {
                console.error(err);
                setError(true);
            });
        };

        const handleMessageCreate = (message) => {
            if (message.channelId !== channel.id) return;
            setMessages((prev) => {
                const newMessages = [...prev];
                const existingMsgIndex = newMessages.findIndex((msg) => msg.nonce && msg.nonce === message.nonce);
                if (existingMsgIndex !== -1) {
                    newMessages[existingMsgIndex] = message;
                } else {
                    newMessages.push(message);
                };
                const cache = conversationCache.get(channel.id);
                cache.messages = newMessages;
                return newMessages;
            });
        };

        const handleMessageUpdate = (oldMessage, newMessage) => {
            if (newMessage.channelId !== channel.id) return;
            setMessages((prev) => {
                const newMessages = prev.map((msg) => (msg.id === newMessage.id ? newMessage : msg));
                const cache = conversationCache.get(channel.id);
                if (cache) cache.messages = newMessages;
                return newMessages;
            });
        };

        const handleMessageDelete = (message) => {
            if (message.channelId !== channel.id) return;
            setMessages((prev) => {
                const newMessages = prev.filter((msg) => msg.id !== message.id);
                const cache = conversationCache.get(channel.id);
                if (cache) cache.messages = newMessages;
                return newMessages;
            });
        };

        client.on(Events.MessageCreate, handleMessageCreate);
        client.on(Events.MessageUpdate, handleMessageUpdate);
        client.on(Events.MessageDelete, handleMessageDelete);

        return () => {
            client.removeListener(Events.MessageCreate, handleMessageCreate);
            client.removeListener(Events.MessageUpdate, handleMessageUpdate);
            client.removeListener(Events.MessageDelete, handleMessageDelete);
        };
    }, [channel.id]);

    const loadMoreMessage = useCallback(async () => {
        const cache = conversationCache.get(channel.id);
        if (!cache || cache.messages.length === 0) return;

        const oldest = cache.messages.reduce((prev, curr) => !prev || curr.createdTimestamp < prev.createdTimestamp ? curr : prev, null);

        try {
            const newMessages = await channel.messages.fetch({ limit: FETCH_LIMIT, before: oldest.id });
            setMessages((prev) => {
                const sorted = [...newMessages.values(), ...prev].sort((a, b) => a.createdTimestamp - b.createdTimestamp);
                cache.messages = sorted;
                return sorted;
            });
            setHasMoreMessages(newMessages.size === FETCH_LIMIT);
            cache.hasMoreMessages = newMessages.size === FETCH_LIMIT;
        } catch (error) {
            console.error(error);
            setError(true);
        };
    }, [channel.id]);

    const skeletonLoader = useMemo(() => <ChatSkeletonLoader/>, [channel.id]);

    return (
        <div className="chat-content">
            <div className="chat-messages">
                <ReverseInfiniteScroll
                    key={channel.id}
                    scrollerRef={scrollerRef}
                    data={messages}
                    hasMore={hasMoreMessages}
                    next={loadMoreMessage}
                    itemContent={(msg, idx) => {
                        const previousMsg = idx > 0 ? messages[idx - 1] : null;
                        const showDateDivider = !previousMsg || msg.createdAt.toDateString() !== previousMsg.createdAt.toDateString();
                        const isGroupStart = !previousMsg || previousMsg.system || msg.author.id !== previousMsg.author.id || msg.createdTimestamp - previousMsg.createdTimestamp >= 5 * 60 * 1000;
                        return (
                            <>
                                {showDateDivider && <MessageDivider key={msg.createdAt.toISOString()} date={msg.createdAt} isUnread={!previousMsg} locale={client.settings.locale}/>}
                                <Message
                                    key={msg.nonce ?? msg.id}
                                    client={client}
                                    message={msg}
                                    isGroupStart={isGroupStart}
                                    setMessages={setMessages}
                                />
                            </>
                        );
                    }}
                    loader={skeletonLoader}
                    endMessage={<WelcomeChat channel={channel}/>}
                    className="messages-scroller scrollbar-auto scrollbar-themed"
                />
            </div>
            <ChatForm
                client={client}
                channel={channel}
                error={error}
                setMessages={setMessages}
                scrollerRef={scrollerRef}
            />
        </div>
    );
};