const getRandom = (min, max) => Math.random() * (max - min) + min;

export default function MessagePlaceholder() {
    const isNewMessage = Math.random() > 0.6;
    const hasAttachment = isNewMessage && Math.random() > 0.8;
    const headerBlobWidth = getRandom(4, 8);
    const contentBlobCount = Math.floor(getRandom(1, 10));
    const attachmentWidth = Math.floor(getRandom(140, 400));
    const attachmentHeight = Math.floor(getRandom(100, 320));

    return (
        <div className="message-placeholder" style={{ marginTop: isNewMessage ? "16px" : null }}>
            <div className="contents">
                {isNewMessage && (
                    <>
                        <div className="avatar" style={{ opacity: 0.08 }}></div>
                        <h3 className="header">
                            <div
                                className="blob"
                                style={{
                                    width: `${headerBlobWidth}rem`,
                                    opacity: 0.2
                                }}
                            ></div>
                        </h3>
                    </>
                )}
                <div className="content">
                    {Array.from({ length: contentBlobCount }).map((_, i) => (
                        <div
                            key={i}
                            className="blob"
                            style={{
                                width: `${getRandom(2, 5)}rem`,
                                opacity: 0.06
                            }}
                        />
                    ))}
                </div>
            </div>
            {hasAttachment && (
                <div className="attachment-container">
                    <div
                        className="attachment"
                        style={{
                            opacity: 0.03,
                            width: `${attachmentWidth}px`,
                            height: `${attachmentHeight}px`
                        }}
                    ></div>
                </div>
            )}
        </div>
    );
};