import { useState, useRef, useEffect, useCallback, useMemo } from "preact/hooks";

export default function VirtualizedGrid({
    sections = [],
    renderSection,
    renderSectionHeader,
    itemSize,
    itemsPerRow,
    onActiveChange,
    scrollRef: externalScrollRef,
    ...props
}) {
    const [scrollTop, setScrollTop] = useState(0);
    const [containerHeight, setContainerHeight] = useState(0);
    const [activeSection, setActiveSection] = useState(sections[0]?.key);
    const internalScrollRef = useRef(null);
    const scrollRef = externalScrollRef || internalScrollRef;

    const sectionsWithMetadata = useMemo(() => {
        let currentOffset = 0;

        return sections.map((section) => {
            const itemCount = section.data?.length || 0;
            const totalRows = Math.ceil(itemCount / itemsPerRow);
            const headerHeight = renderSectionHeader ? 40 : 0;
            const sectionHeight = totalRows * itemSize + headerHeight;

            const metadata = {
                ...section,
                offset: currentOffset,
                height: sectionHeight,
                headerHeight,
                totalRows,
                itemCount
            };

            currentOffset += sectionHeight;

            return metadata;
        });
    }, [sections, itemSize, itemsPerRow, renderSectionHeader]);

    const totalHeight = useMemo(() => {
        return sectionsWithMetadata.reduce((acc, section) => acc + section.height, 0);
    }, [sectionsWithMetadata]);

    const getVisibleRangeForSection = useCallback((section, scrollTop, containerHeight) => {
        const sectionTop = section.offset + section.headerHeight;
        const sectionBottom = section.offset + section.height;

        if (sectionBottom < scrollTop || sectionTop > scrollTop + containerHeight) {
            return { start: -1, end: -1, isVisible: false };
        };

        const visibleTop = Math.max(scrollTop, sectionTop);
        const visibleBottom = Math.min(scrollTop + containerHeight, sectionBottom);

        const startRow = Math.max(0, Math.floor((visibleTop - sectionTop) / itemSize));
        const endRow = Math.min(section.totalRows, Math.ceil((visibleBottom - sectionTop) / itemSize));

        return {
            start: startRow * itemsPerRow,
            end: Math.min(section.itemCount, endRow * itemsPerRow),
            isVisible: true
        };
    }, [itemSize, itemsPerRow]);

    useEffect(() => {
        const handleScroll = () => {
            if (!scrollRef.current) return;

            const currentScrollTop = scrollRef.current.scrollTop;
            const currentHeight = scrollRef.current.clientHeight;

            setScrollTop(currentScrollTop);
            setContainerHeight(currentHeight);

            const offset = 50;
            for (const section of sectionsWithMetadata) {
                const sectionTop = section.offset;
                const sectionBottom = section.offset + section.height;

                if (currentScrollTop >= sectionTop - offset && currentScrollTop < sectionBottom - offset) {
                    if (activeSection !== section.key) {
                        setActiveSection(section.key);
                        onActiveChange?.(section.key);
                    };
                    break;
                };
            };
        };

        const container = scrollRef.current;
        if (container) {
            setScrollTop(container.scrollTop);
            setContainerHeight(container.clientHeight);

            container.addEventListener("scroll", handleScroll, { passive: true });
            return () => container.removeEventListener("scroll", handleScroll);
        };
    }, [sectionsWithMetadata, scrollRef, activeSection, onActiveChange]);

    const scrollToSection = useCallback((sectionKey) => {
        const section = sectionsWithMetadata.find(s => s.key === sectionKey);
        if (section && scrollRef.current) {
            scrollRef.current.scrollTo({ top: section.offset, behavior: "instant" });
        };
    }, [sectionsWithMetadata, scrollRef]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollToSection = scrollToSection;
            scrollRef.current.activeSection = activeSection;
        };
    }, [scrollToSection, activeSection, scrollRef]);

    return (
        <div
            ref={scrollRef}
            style={{
                position: "relative",
                height: "100%",
                overflowY: "auto"
            }}
            {...props}
        >
            <div style={{ position: "relative", minHeight: `${totalHeight}px` }}>
                {sectionsWithMetadata.map((section) => {
                    const visibleRange = getVisibleRangeForSection(section, scrollTop, containerHeight);
                    return (
                        <div
                            key={section.key}
                            style={{ position: "relative", minHeight: `${section.height}px` }}
                        >
                            {renderSectionHeader && renderSectionHeader(section)}
                            {renderSection(section, visibleRange)}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
