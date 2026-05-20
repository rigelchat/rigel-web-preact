export function parseUserAgent() {
    const ua = navigator.userAgent;

    let os = "Unknown";
    if (/Android/i.test(ua)) {
        os = "Android";
    } else if (/BlackBerry/i.test(ua)) {
        os = "BlackBerry";
    } else if (/Mac OS X/i.test(ua)) {
        os = "Mac OS X";
    } else if (/iPhone|iPad|iPod/i.test(ua)) {
        os = "iOS";
    } else if (/Linux/i.test(ua)) {
        os = "Linux";
    } else if (/Windows Phone/i.test(ua)) {
        os = "Windows Mobile";
    } else if (/Windows/i.test(ua)) {
        os = "Windows";
    } else if (/PlayStation/i.test(ua)) {
        os = "Playstation";
    } else if (/Xbox/i.test(ua)) {
        os = "Xbox";
    };

    let browser = "Unknown";
    if (/FBAV|FBAN/i.test(ua)) {
        browser = "Facebook Mobile";
    } else if (/Konqueror/i.test(ua)) {
        browser = "Konqueror";
    } else if (/Opera Mini/i.test(ua)) {
        browser = "Opera Mini";
    } else if (/Opera|OPR/i.test(ua)) {
        browser = "Opera";
    } else if (/Edg/i.test(ua)) {
        browser = "Edge";
    } else if (/MSIE|Trident/i.test(ua)) {
        browser = "Internet Explorer";
    } else if (/Firefox/i.test(ua)) {
        browser = "Firefox";
    } else if (/CriOS/i.test(ua)) {
        browser = "Chrome iOS";
    } else if (/Chrome/i.test(ua)) {
        if (/Android/i.test(ua) && /Mobile/i.test(ua)) {
            browser = "Android Mobile";
        } else if (/Android/i.test(ua)) {
            browser = "Android Chrome";
        } else {
            browser = "Chrome";
        };
    } else if (/Safari/i.test(ua)) {
        if (/iPhone|iPad|iPod/i.test(ua) && /Mobile/i.test(ua)) {
            browser = "Mobile Safari";
        } else {
            browser = "Safari";
        };
    } else if (/BlackBerry/i.test(ua)) {
        browser = "BlackBerry";
    } else if (/Mozilla/i.test(ua)) {
        browser = "Mozilla";
    };

    return { os, browser };
};