import { useState, useEffect, useLayoutEffect } from "preact/hooks";
import classNames from "classnames";
import { DiscordSnowflake } from "@sapphire/snowflake";
import { MessageType } from "rigel.js";
import * as tenor from "../../utils/tenor.js";

import styles from "./GifPicker.module.css";
import * as Icons from "../../icons/Icons.jsx";
import Input from "../Input/Input.jsx";

export default function GifPicker({ client, channel, setMessages, scrollerRef, onClose }) {
    const [view, setView] = useState("categories");
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [trendingGifs, setTrendingGifs] = useState([]);
    const [gifs, setGifs] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchCategories();
        fetchTrendingGifs();
    }, []);

    const fetchCategories = async () => {
        const data = await tenor.fetchCategories(client.settings.locale);
        setCategories(data);
    };

    const fetchTrendingGifs = async () => {
        const data = await tenor.fetchTrending(client.settings.locale);
        setTrendingGifs(data);
    };

    useLayoutEffect(() => {
        if (searchQuery.trim()) {
            setView("search");
        } else if (view !== "trending") {
            setView("categories");
        };
    }, [searchQuery]);

    useEffect(() => {
        if (searchQuery.trim()) {
            const timer = setTimeout(() => searchGifs(searchQuery, client.settings.locale), 200);
            return () => clearTimeout(timer);
        }
    }, [searchQuery]);

    const fetchTrending = () => {
        setGifs(trendingGifs);
        setView("trending");
    };

    const searchGifs = async (query) => {
        setLoading(true);
        const data = await tenor.searchGifs(query, client.settings.locale);
        setGifs(data);
        setLoading(false);
    };

    const searchCategory = async (categoryName) => {
        setSearchQuery(categoryName);
    };

    const handleBack = () => {
        setSearchQuery("");
        setView("categories");
    };

    const handleGifClick = async (gif) => {
        const gifUrl = gif.itemurl;
        const nonce = DiscordSnowflake.generate().toString();

        setMessages((prev) => [...prev, {
            type: MessageType.Default,
            id: nonce,
            content: gifUrl,
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

        onClose();

        try {
            await channel.send({
                content: gifUrl,
                nonce
            });
        } catch (err) {
            console.error(err);
            setMessages((prev) => prev.map((msg) => 
                msg.nonce === nonce ? { ...msg, isSending: false, isFailed: true } : msg
            ));
        };
    };

    return (
        <div className={styles.pickerContainer}>
            <div className={styles.header}>
                {view !== "categories" && (
                    <button className={styles.backButton} onClick={handleBack}>
                        <Icons.Back className={styles.backIcon}/>
                    </button>
                )}
                {view === "trending" ? (
                    <div className={styles.title}>GIF à la une</div>
                ) : (
                    <Input 
                        placeholder="Recherche sur Tenor"
                        value={searchQuery}
                        onInput={(e) => setSearchQuery(e.target.value)}
                        rightIcon="search"
                    />
                )}
            </div>
            <div className={classNames(styles.gifGrid, "scrollbar-thin")} data-view={view}>
                {!loading && view === "categories" && (
                    <div className={styles.grid}>
                        {trendingGifs.length > 0 && (
                            <div className={styles.categoryItem} onClick={() => fetchTrending()}>
                                <video 
                                    src={trendingGifs[0].media[0].webm.url} 
                                    alt="Trending"
                                    autoPlay
                                    loop
                                    muted
                                />
                                <div className={styles.categoryName}>
                                    <Icons.Trending className={styles.icon}/>
                                    GIF à la une
                                </div>
                            </div>
                        )}
                        {categories.map((category) => (
                            <div key={category.searchterm} className={styles.categoryItem} onClick={() => searchCategory(category.searchterm)}>
                                <img src={category.image} alt={category.searchterm} loading="lazy"/>
                                <div className={styles.categoryName}>{category.searchterm}</div>
                            </div>
                        ))}
                    </div>
                )}
                {!loading && (view === "search" || view === "trending") && (
                    <div className={styles.masonry}>
                        {gifs.map((gif) => {
                            const [width, height] = gif.media[0].webm.dims;
                            return (
                                <div 
                                    key={gif.id} 
                                    className={styles.gifItem} 
                                    onClick={() => handleGifClick(gif)}
                                    style={{ aspectRatio: `${width} / ${height}` }}
                                >
                                    <video 
                                        src={gif.media[0].webm.url} 
                                        alt={gif.content_description}
                                        autoPlay
                                        loop
                                        muted
                                    />
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};