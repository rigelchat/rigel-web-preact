import { useMemo } from "preact/hooks";
import { getTimeFormatter, getDateTimeFormatter, getDateFormatter, formatLongTimestamp, formatRelativeTime } from "../utils/date";

export function useFormatter(locale = "fr-FR") {
    return useMemo(() => ({
        timeFormatter: getTimeFormatter(locale),
        dateTimeFormatter: getDateTimeFormatter(locale),
        dateFormatter: getDateFormatter(locale),
        formatLongTimestamp: (date) => formatLongTimestamp(date, locale),
        formatRelativeTime: (date) => formatRelativeTime(date, locale)
    }), [locale]);
};
