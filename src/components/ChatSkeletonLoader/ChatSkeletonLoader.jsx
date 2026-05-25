import "./ChatSkeletonLoader.css";
import MessagePlaceholder from "./MessagePlaceholder";

export default function ChatSkeletonLoader({ count = 50 }) {
    const placeholders = Array.from({ length: count });
    return (
        <div className="chat-skeleton-loader">
            {placeholders.map((_, index) => (
                <MessagePlaceholder key={index}/>
            ))}
        </div>
    );
};