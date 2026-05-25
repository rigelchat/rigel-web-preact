import { EmojiText } from "../components/Emoji/Emoji.jsx";
import MessageEmbed, { isImageUrl } from "../components/Message/MessageEmbed";
import { formatTimestamp } from "./date";

const patterns = [
    { type: "code", regex: /`([^`]+)`/g },
    { type: "bold", regex: /\*\*(.+?)\*\*/g },
    { type: "boldUnderline", regex: /__(.+?)__/g },
    { type: "italic", regex: /([*_])(?!\1)(.+?)\1/g },
    { type: "strikethrough", regex: /~~(.+?)~~/g },
    { type: "link", regex: /\[([^\]]+)\]\(([^)]+)\)/g },
    { type: "autolink", regex: /(https?:\/\/[^\s<]+[^<.,:;"")\]\s])/g },
    { type: "timestamp", regex: /&lt;t:(\d+)(?::([tTdDfFRsS]))?&gt;|<t:(\d+)(?::([tTdDfFRsS]))?>/g }
];

function parseInline(text) {
    if (!text) return [];

    const matches = [];
    patterns.forEach(({ type, regex }) => {
        let match;
        const r = new RegExp(regex.source, regex.flags);
        while ((match = r.exec(text)) !== null) {
            matches.push({
                type,
                index: match.index,
                length: match[0].length,
                match: match,
            });
        };
    });

    matches.sort((a, b) => a.index - b.index);

    const filteredMatches = [];
    let lastEnd = 0;
    matches.forEach((m) => {
        if (m.index >= lastEnd) {
            filteredMatches.push(m);
            lastEnd = m.index + m.length;
        };
    });

    const result = [];
    let lastIndex = 0;
    let counter = 0;

    filteredMatches.forEach((m) => {
        if (m.index > lastIndex) {
            const textBefore = text.substring(lastIndex, m.index);
            if (textBefore) {
                result.push(<EmojiText key={`text-${counter++}`}>{textBefore}</EmojiText>);
            };
        };

        const key = `inline-${counter++}`;
        switch (m.type) {
            case "code":
                result.push(<code key={key}>{m.match[1]}</code>);
                break;
            case "bold":
                result.push(<strong key={key}><EmojiText>{m.match[1]}</EmojiText></strong>);
                break;
            case "boldUnderline":
                result.push(<strong key={key}><u><EmojiText>{m.match[1]}</EmojiText></u></strong>);
                break;
            case "italic":
                result.push(<em key={key}><EmojiText>{m.match[2]}</EmojiText></em>);
                break;
            case "strikethrough":
                result.push(<s key={key}><EmojiText>{m.match[1]}</EmojiText></s>);
                break;
            case "link":
                result.push(
                    <a key={key} href={m.match[2]} target="_blank" rel="noopener noreferrer">
                        <EmojiText>{m.match[1]}</EmojiText>
                    </a>
                );
                break;
            case "autolink":
                result.push(
                    <a key={key} href={m.match[1]} target="_blank" rel="noopener noreferrer">
                        {m.match[1]}
                    </a>
                );
                break;
            case "timestamp":
                const timestamp = m.match[1] || m.match[3];
                const style = m.match[2] || m.match[4] || "f";
                result.push(
                    <span key={key} className="timestamp">
                        {formatTimestamp(parseInt(timestamp), style)}
                    </span>
                );
                break;
        };

        lastIndex = m.index + m.length;
    });

    if (lastIndex < text.length) {
        result.push(<EmojiText key={`text-${counter++}`}>{text.substring(lastIndex)}</EmojiText>);
    };

    return result.length > 0 ? result : [text];
};

export function parseMarkdownToJSX(text) {
    if (!text) return null;

    // const trimmedText = text.trim();
    // if (isImageUrl(trimmedText)) {
    //     return <MessageEmbed url={trimmedText}/>;
    // };

    const lines = text.split("\n");
    const elements = [];
    let counter = 0;
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];
        const key = `line-${counter++}`;

        // Blockquote
        if (line.startsWith("> ")) {
            const blockquoteLines = [];
            while (i < lines.length && lines[i].startsWith("> ")) {
                blockquoteLines.push(lines[i].substring(2));
                i++;
            };
            elements.push(
                <blockquote key={key}>
                    {blockquoteLines.map((bqLine, idx) => (
                        <p key={`bq-${counter}-${idx}`}>{parseInline(bqLine)}</p>
                    ))}
                </blockquote>
            );
            continue;
        };

        // Unordered list
        if (line.match(/^[\*\-]\s+/)) {
            const listItems = [];
            while (i < lines.length && lines[i].match(/^[\*\-]\s+/)) {
                const content = lines[i].replace(/^[\*\-]\s+/, "");
                listItems.push(content);
                i++;
            };
            elements.push(
                <ul key={key}>
                    {listItems.map((item, idx) => (
                        <li key={`ul-${counter}-${idx}`}>{parseInline(item)}</li>
                    ))}
                </ul>
            );
            continue;
        };

        // Ordered list
        if (line.match(/^\d+\.\s+/)) {
            const listItems = [];
            while (i < lines.length && lines[i].match(/^\d+\.\s+/)) {
                const content = lines[i].replace(/^\d+\.\s+/, "");
                listItems.push(content);
                i++;
            };
            elements.push(
                <ol key={key}>
                    {listItems.map((item, idx) => (
                        <li key={`ol-${counter}-${idx}`}>{parseInline(item)}</li>
                    ))}
                </ol>
            );
            continue;
        };

        // Headings
        if (line.startsWith("### ")) {
            const content = line.substring(4);
            elements.push(
                <h3 key={key}>{parseInline(content)}</h3>
            );
            i++;
            continue;
        };

        if (line.startsWith("## ")) {
            const content = line.substring(3);
            elements.push(
                <h2 key={key}>{parseInline(content)}</h2>
            );
            i++;
            continue;
        };

        if (line.startsWith("# ")) {
            const content = line.substring(2);
            elements.push(
                <h1 key={key}>{parseInline(content)}</h1>
            );
            i++;
            continue;
        };

        if (line.trim() === "") {
            elements.push(<br key={key}/>);
            i++;
            continue;
        };

        elements.push(
            <p key={key}>{parseInline(line)}</p>
        );

        i++;
    };

    return elements.length === 1 ? elements[0] : elements;
};