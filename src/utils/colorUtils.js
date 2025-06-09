export function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    return { r, g, b };
}

export function rgbToHex(r, g, b) {
    return `#` + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

export function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

export function hexToHsl(hex) {
    const { r, g, b } = hexToRgb(hex);
    return rgbToHsl(r, g, b);
}

export function hslToRgb(h, s, l) {
    s /= 100;
    l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n =>
        l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return {
        r: Math.round(255 * f(0)),
        g: Math.round(255 * f(8)),
        b: Math.round(255 * f(4)),
    };
}

export function getTriadicColors(hex) {
    const { h, s, l } = hexToHsl(hex); // h is 0-360, s, l are 0-100

    const h1 = (h + 120) % 360;
    const h2 = (h + 240) % 360;

    const rgb1 = hslToRgb(h1, s, l);
    const hex1 = rgbToHex(rgb1.r, rgb1.g, rgb1.b);

    const rgb2 = hslToRgb(h2, s, l);
    const hex2 = rgbToHex(rgb2.r, rgb2.g, rgb2.b);

    return [
        { hex: hex1, hsl: { h: h1, s: s, l: l }, rgb: rgb1 },
        { hex: hex2, hsl: { h: h2, s: s, l: l }, rgb: rgb2 }
    ];
}
