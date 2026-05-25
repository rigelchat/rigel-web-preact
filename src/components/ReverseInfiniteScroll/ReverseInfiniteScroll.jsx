import { useEffect, useLayoutEffect, useRef, useState } from "preact/hooks";

export default function ReverseInfiniteScroll({
    scrollerRef,
    data = [],
    hasMore = false,
    next,
    itemContent,
    loader,
    endMessage,
    ...props
}) {
    const containerRef = useRef(null);
    const loaderRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const prevScrollHeight = useRef(0);
    const prevTopElementHeight = useRef(0);
    const isFirstLoad = useRef(true);

    // Expose scrollToBottom via scrollerRef
    useEffect(() => {
        if (scrollerRef) {
            scrollerRef.current = {
                scrollToBottom: () => {
                    if (containerRef.current) {
                        containerRef.current.scrollTop = containerRef.current.scrollHeight;
                    };
                }
            };
        }
    }, [scrollerRef]);

    // Handle scroll position adjustments when data changes
    useLayoutEffect(() => {
        const container = containerRef.current;
        const topElement = loaderRef.current;
        if (!container || !topElement) return;

        const scrollHeightDif = container.scrollHeight - prevScrollHeight.current;
        const topElementHeightDif = topElement.clientHeight - prevTopElementHeight.current;
        container.scrollTop = Math.max(topElementHeightDif === 0 ? topElement.clientHeight : 0, container.scrollTop + scrollHeightDif);
        prevScrollHeight.current = 0;

        prevTopElementHeight.current = topElement.clientHeight;
    }, [data, hasMore]);

    // Reset on data array reference change (channel change)
    useEffect(() => {
        isFirstLoad.current = true;
        prevScrollHeight.current = 0;
        prevTopElementHeight.current = 0;
    }, [data]);

    // Handle scroll event to load more messages
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleScroll = async () => {
            // Get loader height or fallback to 200px
            const loaderHeight = loaderRef.current?.clientHeight;

            // Check if scrolled near the top
            if (container.scrollTop < loaderHeight && hasMore && !loading) {
                setLoading(true);
                prevScrollHeight.current = container.scrollHeight;

                try {
                    await next();
                } catch (error) {
                    console.error("Error loading more messages:", error);
                } finally {
                    setLoading(false);
                };
            };
        };

        container.addEventListener("scroll", handleScroll);
        return () => container.removeEventListener("scroll", handleScroll);
    }, [hasMore, loading, next]);

    return (
        <div
            ref={containerRef}
            style={{ display: "flex", flexDirection: "column" }}
            {...props}
        >
            <div ref={loaderRef} style={{ marginTop: "auto" }}>
                {hasMore ? loader : endMessage}
            </div>
            {data.map((elem, index) => itemContent(elem, index))}
        </div>
    );
};