import { useState, useMemo, useCallback, useEffect, useContext } from "preact/hooks";
import { Events } from "rigel.js";

import "./GuildTextChannelView.css";
import ChatContent from "../components/ChatContent/ChatContent";
import ChannelMembers from "../components/ChannelMembers/ChannelMembers";
import ChannelHeader from "../components/ChannelHeader/ChannelHeader";
import { StorageContext } from "../contexts/StorageContext";
import { isMobile } from "../utils/index.js";

export default function GuildPage({ client, channelId }) {
	const storage = useContext(StorageContext);
	const [, forceUpdate] = useState({});
	const [showMembers, setShowMembers] = useState(() => {
		try {
			const channelSection = storage.getChannelSection() || { isMembersOpen: true };
			return channelSection.isMembersOpen;
		} catch (error) {
			return true;
		};
	});

	const channel = useMemo(() => channelId ? client?.channels?.cache?.get(channelId) : null, [channelId, client?.channels?.cache]);

	useEffect(() => {
		if (!client) return;

		const handleUpdate = () => forceUpdate({});

		client.on(Events.Ready, handleUpdate);
		client.on(Events.ShardResume, handleUpdate);
		client.on(Events.ChannelUpdate, handleUpdate);

		return () => {
			client.removeListener(Events.Ready, handleUpdate);
			client.removeListener(Events.ShardResume, handleUpdate);
			client.removeListener(Events.ChannelUpdate, handleUpdate);
		};
	}, [client]);

	const handleToggleMembers = useCallback(() => {
		setShowMembers((value) => {
			const newValue = !value;
			try {
				const channelSection = storage.getChannelSection() || {};
				storage.setChannelSection({ ...channelSection, isMembersOpen: newValue });
			} catch (error) {
				console.warn("Failed to save channelSection:", error);
			};
			return newValue;
		});
	}, [storage]);

	useEffect(() => {
		const handleStorageChange = (evt) => {
			if (evt.key === "ChannelSectionStore") {
				try {
					const newChannelSection = JSON.parse(evt.newValue || '{"isMembersOpen": true}');
					setShowMembers(newChannelSection.isMembersOpen);
				} catch (error) { };
			};
		};

		window.addEventListener("storage", handleStorageChange);
		return () => window.removeEventListener("storage", handleStorageChange);
	}, []);

	return (
		<div className="guild-text-channel-view">
			<ChannelHeader channel={channel} onToggleMembers={handleToggleMembers} showMembers={showMembers}/>
			{!(isMobile() && showMembers) && <ChatContent client={client} channel={channel}/>}
			{showMembers && <ChannelMembers client={client} channel={channel}/>}
		</div>
	);
};