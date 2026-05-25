import { useRef, useState } from "preact/hooks";
import classNames from "classnames";

import "./ChannelHeader.css";
import * as Icons from "../../icons/Icons";
import ReadyUpdateButton from "./ReadyUpdateButton";
import { isMobile, isPwa } from "../../utils/index";

export default function ChannelHeader({ channel, onToggleMembers, showMembers }) {
    const [search, setSearch] = useState("");
    const inputRef = useRef(null);

    return (
        <div className="channel-header">
            <div className="channel-meta">
                <Icons.ChannelIcons.Dynamic channel={channel} className="icon"/>
                <h1>{channel.name}</h1>
            </div>
            <div className="toolbar">
                {!isMobile() && (
                    <>
                        <div className="button" title="Paramètres de notification">
                            <Icons.Notifications/>
                        </div>
                        <div className="button" title="Messages épinglés">
                            <Icons.Pin/>
                        </div>
                    </>
                )}
                <div
                    className={classNames("button", { selected: showMembers })}
                    onClick={onToggleMembers}
                    title={showMembers ? "Masquer la liste des membres" : "Afficher la liste des membres"}
                    role="button"
                    aria-pressed={showMembers}
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") onToggleMembers();
                    }}
                >
                    <Icons.Members/>
                </div>
                {!isMobile() && (
                    <div className="search-bar">
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Rechercher"
                            value={search}
                            onInput={(evt) => setSearch(evt.target.value)}
                        />
                        <div
                            className="icon-container"
                            style={{ cursor: search ? "pointer" : undefined }}
                            onMouseDown={(evt) => evt.preventDefault()}
                            onClick={() => {
                                if (search) {
                                    setSearch("");
                                } else {
                                    inputRef.current.focus();
                                };
                            }}
                        >
                            <Icons.Search className={classNames({ visible: !search })}/>
                            <Icons.Close  className={classNames({ visible: !!search })}/>
                        </div>
                    </div>
                )}
                {isPwa() && <ReadyUpdateButton/>}
                {!isMobile() && (
                    <a href="https://github.com/rigelchat" className="button" title="Open source" target="_blank" rel="noopener noreferrer">
                        <Icons.Github/>
                    </a>
                )}
            </div>
        </div>
    );
};