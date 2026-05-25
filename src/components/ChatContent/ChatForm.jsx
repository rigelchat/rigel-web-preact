import { useEffect, useRef, useState, useMemo } from "preact/hooks";
import { createPortal } from "preact/compat";
import classNames from "classnames";
import { DiscordSnowflake } from "@sapphire/snowflake";
import { MessageType, PermissionsBitField } from "rigel.js";

import styles from "./ChatForm.module.css";
import * as Icons from "../../icons/Icons";
import { isMobile } from "../../utils/index";
import ExpressionPicker from "../ExpressionPicker/ExpressionPicker";
import Emoji from "../Emoji/Emoji";

const faceEmojis = ["😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃", "😉", "😊", "😇", "🥰", "😍", "🤩", "😘", "😗", "😚", "😙", "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🤫", "🤔"];

const getRandomFaceEmoji = () => {
	const randomIndex = Math.floor(Math.random() * faceEmojis.length);
	return faceEmojis[randomIndex];
};

export default function ChatForm({ client, channel, error, onRetry, setMessages, scrollerRef }) {
	const [value, setValue] = useState("");
	const [emojiIcon, setEmojiIcon] = useState(getRandomFaceEmoji());
	const [showExpressionPicker, setShowExpressionPicker] = useState(false);
	const [expressionPickerTab, setExpressionPickerTab] = useState("gif");
	const formRef = useRef(null);
	const textareaRef = useRef(null);
	const chatTextAreaRef = useRef(null);
	const [typingUsers, setTypingUsers] = useState(new Map());

	const handleSubmit = (evt) => {
		evt.preventDefault();

		const trimmed = value.trim();
		if (!trimmed || !channel) return;

		setValue("");
		const nonce = DiscordSnowflake.generate().toString();

		setMessages((prev) => [...prev, {
			type: MessageType.Default,
			id: nonce,
			content: trimmed,
			author: client.user,
			member: channel.guild.members.me,
			createdTimestamp: Date.now(),
			createdAt: new Date(),
			channelId: channel.id,
			nonce,
			isSending: true,
			isFailed: false
		}]);

		const scroller = scrollerRef.current;
		if (scroller) scroller.scrollToBottom();

		channel.send({
			content: trimmed,
			nonce
		}).catch((err) => {
			console.error(err);
			setMessages((prev) => prev.map((msg) => msg.nonce === nonce ? { ...msg, isSending: false, isFailed: true } : msg));
		});
	};

	const handleEmojiHover = () => {
		setEmojiIcon(getRandomFaceEmoji());
	};

	useEffect(() => {
		const el = textareaRef.current;
		if (!el) return;
		el.style.height = "auto";
		el.style.height = el.scrollHeight + "px";
	}, [value]);

	useEffect(() => {
		if (!channel || isMobile()) return;
		const el = textareaRef.current;
		if (!el) return;
		el.focus();
		const len = el.value.length;
		el.setSelectionRange(len, len);
	}, [channel.id]);

	useEffect(() => {
		if (!client || !channel) return;

		const handleTypingStart = (typing) => {
			// On ne gère que le salon actuel et on ignore l'utilisateur local
			if (typing.channel.id !== channel.id) return;
			if (typing.user.id === client.user.id) return;

			setTypingUsers((prev) => {
				const next = new Map(prev);
				next.set(typing.user.id, {
					user: typing.user,
					timestamp: Date.now(),
				});
				return next;
			});
		};

		client.on("typingStart", handleTypingStart);

		// Nettoyage : retirer les gens qui ne tapent plus (timeout de 10s)
		const interval = setInterval(() => {
			const now = Date.now();
			setTypingUsers((prev) => {
				let hasChanged = false;
				const next = new Map(prev);
				for (const [id, data] of next) {
					if (now - data.timestamp > 10000) {
						next.delete(id);
						hasChanged = true;
					}
				}
				return hasChanged ? next : prev;
			});
		}, 1000);

		return () => {
			client.off("typingStart", handleTypingStart);
			clearInterval(interval);
		};
	}, [client, channel.id]);

	const canSend = channel.permissionsFor(channel.guild.members.me).has(PermissionsBitField.Flags.SendMessages);
	const typingText = useMemo(() => {
		const users = Array.from(typingUsers.values()).map(u => u.user.username);
		if (users.length === 0) return null;
		if (users.length === 1) return <b>{users[0]}</b>;
		if (users.length === 2) return <>{<b>{users[0]}</b>} et {<b>{users[1]}</b>}</>;
		if (users.length === 3) return <>{<b>{users[0]}</b>}, {<b>{users[1]}</b>} et {<b>{users[2]}</b>}</>;
		return "Plusieurs personnes";
	}, [typingUsers]);

	return (
		<form ref={formRef} className={styles.chatForm} onSubmit={handleSubmit}>
			{error && <div className={styles.error} onClick={onRetry}>
				<span>Échec du chargement des messages</span>
				<span>Réessayer</span>
			</div>}
			<div ref={chatTextAreaRef} className={classNames(styles.chatTextArea, {
				[styles.disabled]: !canSend,
				[styles.sansAttachBtn]: !canSend
			})}>
				{canSend ? (
					<>
						<button className={styles.attachBtn}>
							<Icons.ChatIcons.Attachment/>
						</button>
						<textarea
							ref={textareaRef}
							rows={1}
							placeholder={`Envoyer un message dans #${channel?.name}`}
							value={value}
							onInput={(evt) => setValue(evt.currentTarget.value)}
							onKeyDown={(evt) => {
								if (evt.key === "Enter" && !evt.shiftKey) {
									evt.preventDefault();
									formRef.current.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
								};
							}}
						/>
						<div className={styles.buttons}>
							{!isMobile() && (
								<>
									<button 
										type="button"
										className={classNames(styles.gifBtn, {
											[styles.active]: showExpressionPicker && expressionPickerTab === "gif"
										})}
										onClick={() => {
											setExpressionPickerTab("gif");
											setShowExpressionPicker(!showExpressionPicker);
										}}
									>
										<Icons.ChatIcons.GIF className={styles.icon}/>
									</button>
								</>
							)}
							<button 
								type="button"
								className={classNames(styles.emojiBtn, {
									[styles.active]: showExpressionPicker && expressionPickerTab === "emoji"
								})} 
								onMouseEnter={handleEmojiHover}
								onClick={() => {
									setExpressionPickerTab("emoji");
									setShowExpressionPicker(!showExpressionPicker);
								}}
							>
								<Emoji unicode={emojiIcon} className={styles.emoji}/>
							</button>
						</div>
					</>
				) : (
					<textarea
						ref={textareaRef}
						rows={1}
						placeholder="Tu n'as pas la permission d'envoyer des messages dans ce salon."
						disabled
					/>
				)}
			</div>
			<div className={styles.typingIndicator}>
				{typingText && (
					<>
						<div className={styles.typingDots}>
							<span></span><span></span><span></span>
						</div>
						<span className={styles.typingText}>
							{typingText} {typingUsers.size > 1 ? "sont" : "est"} en train d'écrire...
						</span>
					</>
				)}
			</div>
			{showExpressionPicker && createPortal(
				<ExpressionPicker 
					client={client}
					channel={channel}
					setMessages={setMessages}
					scrollerRef={scrollerRef}
					defaultTab={expressionPickerTab}
					textareaRef={textareaRef}
					chatTextAreaRef={chatTextAreaRef}
					onClose={() => setShowExpressionPicker(false)}
					onTabChange={setExpressionPickerTab}
					addToInput={(text) => {
						setValue(prev => prev + text + " ");
					}}
				/>,
				document.body
			)}
		</form>
	);
};