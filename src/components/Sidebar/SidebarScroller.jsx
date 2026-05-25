import { ChannelType } from "rigel.js";
import { useEffect } from "preact/hooks";

import "./SidebarScroller.css";
import ScrollerItem from "./ScrollerItem";

export default function SidebarScroller({ guild, channels, scrollerRef }) {
    useEffect(() => {
        if (!guild?.id) return;
        const scrollerEl = scrollerRef.current;
        if (!scrollerEl) return;
        const selectedEl = scrollerEl.querySelector(".item.selected");
        if (selectedEl) selectedEl.scrollIntoView({ block: "nearest" });
    }, [guild?.id, channels]);

    return (
        <div className="sidebar-scroller scrollbar-thin scrollbar-fade scrollbar-themed" ref={scrollerRef}>
            <div className="scroller-content">
                {guild?.banner ? <div style={{ height: "88px" }}></div> : null}
                {channels.length > 0 && channels[0].type !== ChannelType.GuildCategory ? <div style={{ height: "12px" }}></div> : null}
                {channels.map((channel) => (
                    <ScrollerItem key={channel.id} channel={channel}/>
                ))}
            </div>
        </div>
    );
};