export function dec2rgb(c) {
    const r = Math.floor(c / (256 * 256));
    const g = Math.floor(c / 256) % 256;
    const b = c % 256;
    return [r, g, b];
};

export function dec2hex(c) {
    return "#" + c.toString(16).padStart(6, "0");
};

export function rgb2dec(r, g, b) {
    return (r << 16) | (g << 8) | b;
};

export function rgbToHsl(r, g, b) {
    r /= 255, g /= 255, b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max == min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        };
        h /= 6;
    };
    return [Math.floor(h * 360), Math.floor(s * 100), Math.floor(l * 100)];
};

export function hex2dec(hex) {
    return parseInt(hex.replace("#", ""), 16);
};

export function getComputedColorElem(elem) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 1;
    canvas.height = 1;

    const { backgroundColor, backgroundImage } = getComputedStyle(elem);
    const colors = backgroundImage.match(/rgba?\([\d., ]+\)/g);
    if (!colors) return backgroundColor;

    const gradient = ctx.createLinearGradient(0, 0, 1, 1);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, colors[2]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1, 1);

    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return `rgb(${r}, ${g}, ${b})`;
};

export async function extractPalette(imageSource, n = 12) {
    const img = await loadImage(imageSource);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const pixels = [];

    for (let i = 0; i < imageData.length; i += 4) {
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];
        const a = imageData[i + 3];

        if (a < 128) continue;
        pixels.push({ r, g, b });
    };

    if (pixels.length === 0) return [];

    const boxes = medianCut(pixels, n);

    return boxes.map(box => {
        let r = 0, g = 0, b = 0;
        for (const p of box) {
            r += p.r;
            g += p.g;
            b += p.b;
        }
        r = Math.round(r / box.length);
        g = Math.round(g / box.length);
        b = Math.round(b / box.length);

        return {
            r, g, b,
            count: box.length
        };
    }).sort((a, b) => b.count - a.count);
};

function medianCut(pixels, n) {
    let boxes = [pixels];
    while (boxes.length < n) {
        let maxRange = -1;
        let boxToSplit = -1;

        for (let i = 0; i < boxes.length; i++) {
            if (boxes[i].length <= 1) continue;
            const range = getColorRange(boxes[i]);
            if (range.max > maxRange) {
                maxRange = range.max;
                boxToSplit = i;
            };
        };

        if (boxToSplit === -1) break;

        const box = boxes.splice(boxToSplit, 1)[0];
        const range = getColorRange(box);
        box.sort((a, b) => a[range.channel] - b[range.channel]);

        const median = Math.floor(box.length / 2);
        boxes.push(box.slice(0, median));
        boxes.push(box.slice(median));
    }
    return boxes;
}

function getColorRange(pixels) {
    let minR = 255, maxR = 0;
    let minG = 255, maxG = 0;
    let minB = 255, maxB = 0;

    for (const p of pixels) {
        if (p.r < minR) minR = p.r; if (p.r > maxR) maxR = p.r;
        if (p.g < minG) minG = p.g; if (p.g > maxG) maxG = p.g;
        if (p.b < minB) minB = p.b; if (p.b > maxB) maxB = p.b;
    };

    const rRange = maxR - minR;
    const gRange = maxG - minG;
    const bRange = maxB - minB;

    const max = Math.max(rRange, gRange, bRange);
    const channel = max === rRange ? "r" : (max === gRange ? "g" : "b");

    return { max, channel };
};

/**
 * Sélectionne les deux meilleures couleurs pour un profil à partir d'une liste de couleurs extraites.
 * @param {Object[]} colors - Liste des couleurs extraites avec métadonnées.
 * @returns {Object[]} - Un tableau de deux couleurs {r, g, b} [sombre, claire].
 */
export function selectProfileColors(colors) {
    if (!colors || colors.length === 0) return null;

    const processedColors = colors.map(c => {
        const max = Math.max(c.r, c.g, c.b);
        const min = Math.min(c.r, c.g, c.b);

        return {
            ...c,
            saturation: max === 0 ? 0 : (max - min) / max,
            luminance: (0.299 * c.r + 0.587 * c.g + 0.114 * c.b) / 255
        };
    });

    // 1. Trouver la couleur la plus vibrante
    const vibrantCandidates = [...processedColors]
        .filter(c => c.luminance > 0.2 && c.luminance < 0.8)
        .sort((a, b) => (b.saturation * b.count) - (a.saturation * a.count));

    const vibrant = vibrantCandidates[0] || processedColors[0];

    // 2. Trouver une couleur secondaire plus désaturée
    const secondaryCandidates = processedColors
        .filter(c => c !== vibrant)
        .sort((a, b) => {
            const sScoreA = (1 - a.saturation) * a.count;
            const sScoreB = (1 - b.saturation) * b.count;
            return sScoreB - sScoreA;
        });

    const secondary = secondaryCandidates[0] || vibrant;

    // 3. Trier par luminosité (sombre -> clair)
    return [vibrant, secondary].sort((a, b) => {
        const lumA = (0.299 * a.r + 0.587 * a.g + 0.114 * a.b);
        const lumB = (0.299 * b.r + 0.587 * b.g + 0.114 * b.b);
        return lumA - lumB;
    });
}

async function loadImage(source) {
    if (source instanceof HTMLImageElement) {
        if (source.complete) return source;
        await new Promise((resolve, reject) => {
            source.onload = resolve;
            source.onerror = reject;
        });
        return source;
    }

    if (source instanceof Blob) {
        const url = URL.createObjectURL(source);
        const img = new Image();
        img.src = url;
        await new Promise((resolve, reject) => {
            img.onload = () => {
                URL.revokeObjectURL(url);
                resolve();
            };
            img.onerror = reject;
        });
        return img;
    }

    if (typeof source === "string") {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = source;
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
        });
        return img;
    }

    throw new Error("Source d'image invalide");
}