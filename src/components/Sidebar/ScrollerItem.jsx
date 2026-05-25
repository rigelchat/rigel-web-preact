import { useContext } from "preact/hooks";
import classNames from "classnames";
import { ChannelType } from "rigel.js";

import "./ScrollerItem.css";
import * as Icons from "../../icons/Icons";
import { RouteContext } from "../../contexts/RouteContext";

export default function ScrollerItem({ channel }) {
    const { goToGuildChannel, guildChannelRouteParams } = useContext(RouteContext);

    return (
        <div
            key={channel.id}
            className={classNames("item", {
                category: channel.type === ChannelType.GuildCategory,
                selected: guildChannelRouteParams?.channelId === channel.id
            })}
            onClick={() => {
                if (channel.isTextBased()) {
                    goToGuildChannel(channel.guildId, channel.id);
                };
            }}
        >
            <Icons.ChannelIcons.Dynamic channel={channel} className={channel.type === ChannelType.GuildCategory ? "icon-caret" : "icon"}/>
            <span className="name">{channel.name}</span>
        </div>
    );
};