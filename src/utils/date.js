export function getTimeFormatter(locale) {
    return new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" });
};

export function getDateTimeFormatter(locale) {
    return new Intl.DateTimeFormat(locale, { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

export function getDateFormatter(locale) {
    return new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" });
};

export function formatLongTimestamp(date, locale) {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);

    const timeFormatter = getTimeFormatter(locale);
    const dateTimeFormatter = getDateTimeFormatter(locale);

    if (date >= startOfToday) {
        const todayStr = locale.startsWith("en") ? "Today at" : "Aujourd'hui à";
        return `${todayStr} ${timeFormatter.format(date)}`;
    };

    if (date >= startOfYesterday) {
        const yesterdayStr = locale.startsWith("en") ? "Yesterday at" : "Hier à";
        return `${yesterdayStr} ${timeFormatter.format(date)}`;
    };

    return dateTimeFormatter.format(date);
};

export function formatRelativeTime(date, locale) {
    if (!date) return "";

    const diff = Math.floor((date.getTime() - Date.now()) / 1000);
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

    if (Math.abs(diff) < 60) return rtf.format(diff, "second");
    const diffMin = Math.floor(diff / 60);
    if (Math.abs(diffMin) < 60) return rtf.format(diffMin, "minute");
    const diffHour = Math.floor(diffMin / 60);
    if (Math.abs(diffHour) < 24) return rtf.format(diffHour, "hour");
    const diffDay = Math.floor(diffHour / 24);
    if (Math.abs(diffDay) < 30) return rtf.format(diffDay, "day");
    const diffMonth = Math.floor(diffDay / 30);
    if (Math.abs(diffMonth) < 12) return rtf.format(diffMonth, "month");
    const diffYear = Math.floor(diffMonth / 12);
    return rtf.format(diffYear, "year");
};

export function formatTimestamp(timestamp, style = "f", locale = "fr-FR") {
    const date = new Date(timestamp * 1000);
    if (isNaN(date.getTime())) return "Invalid Date";
    
    switch (style) {
        case "t": // 16:20
            return new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "numeric" }).format(date);
        case "T": // 16:20:30
            return new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "numeric", second: "numeric" }).format(date);
        case "d": // 20/04/2021
            return new Intl.DateTimeFormat(locale, { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
        case "D": // 20 April 2021
            return new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" }).format(date);
        case "f": // 20 April 2021 16:20
            return new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "numeric" }).format(date);
        case "F": // Tuesday, 20 April 2021 16:20
            return new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "numeric" }).format(date);
        case "R": // Relative
            return formatRelativeTime(date, locale);
        case "s": // 01/01/2026 15:19 (Custom)
            return new Intl.DateTimeFormat(locale, { day: "2-digit", month: "2-digit", year: "numeric", hour: "numeric", minute: "numeric" }).format(date);
        case "S": // 01/01/2026 15:19:55 (Custom)
            return new Intl.DateTimeFormat(locale, { day: "2-digit", month: "2-digit", year: "numeric", hour: "numeric", minute: "numeric", second: "numeric" }).format(date);
        default:
            return new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "numeric" }).format(date);
    };
};