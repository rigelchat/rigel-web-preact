import { useEffect, useRef } from "preact/hooks";
import "./SidebarHeader.css";

export default function SidebarHeader({ guild, titleOverride, scrollerRef }) {
    const headerRef = useRef(null);
    const bannerContainerRef = useRef(null);
    const bannerRef = useRef(null);
    const bannerImgRef = useRef(null);

    useEffect(() => {
        if (!guild?.banner) return;

        const observer = new ResizeObserver((entries) => {
            if (entries[0] && bannerImgRef.current) {
                const width = entries[0].contentRect.width + "px";
                bannerImgRef.current.style.width = width;
            };
        });

        if (bannerContainerRef.current) {
            observer.observe(bannerContainerRef.current);
        };

        return () => {
            if (bannerContainerRef.current) {
                observer.unobserve(bannerContainerRef.current);
            };
            observer.disconnect();
        };
    }, [guild?.banner, bannerContainerRef, bannerImgRef]);

    useEffect(() => {
        const maxTop = 100;

        const updateBannerPosition = () => {
            const scroller = scrollerRef.current;
            const header = headerRef.current;
            const bannerContainer = bannerContainerRef.current;
            const banner = bannerRef.current;

            if (!header) return;
            if (!bannerContainer || !guild?.banner) {
                header.classList.remove("banner-visible", "theme-dark");
                return;
            };

            const top = Math.min(scroller?.scrollTop || 0, maxTop);
            const topRatio = top / maxTop;

            if (top < maxTop) {
                header.classList.add("banner-visible", "theme-dark");
            } else {
                header.classList.remove("banner-visible", "theme-dark");
            };

            bannerContainer.style.opacity = `${(maxTop - top) / 100}`;
            bannerContainer.style.transform = `translateY(${topRatio * -90}px)`;
            if (banner) {
                banner.style.transform = `translateY(${topRatio * 60}px) scale(${1 + topRatio * 0.2})`;
            };
        };

        updateBannerPosition();
        const scroller = scrollerRef.current;
        scroller.addEventListener("scroll", updateBannerPosition);

        return () => scroller.removeEventListener("scroll", updateBannerPosition);
    }, [guild?.id, guild?.banner, scrollerRef, headerRef, bannerContainerRef, bannerRef]);

    return (
        <div ref={headerRef} className="sidebar-header">
            <div className="header-content">
                <h2>{titleOverride || guild?.name}</h2>
            </div>
            {guild?.banner ? (
                <div ref={bannerContainerRef} className="banner-wrapper">
                    <div ref={bannerRef} className="banner">
                        <img  ref={bannerImgRef} src={guild.bannerURL({ size: 512 })}/>
                    </div>
                </div>
            ) : null}
        </div>
    );
};