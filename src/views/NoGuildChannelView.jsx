import "./NoGuildChannelView.css";

export default function NoGuildChannelView() {
    return (
        <div class="no-guild-channel-view">
            <div class="wrapper">
                <img src="/assets/text-guild-channel.svg"/>
                <h2>Aucun salon textuel</h2>
                <p>Te voilà dans un bien étrange lieu. Tu n'as accès à aucun salon textuel, ou alors il n'y en a aucun sur ce serveur.</p>
            </div>
        </div>
    );
};