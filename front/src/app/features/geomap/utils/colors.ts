export const hexToRgb = (hex: string, opacity: number = 1): [number, number, number, number] => {
    var bigint = parseInt(hex, 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;

    return [r, g, b, opacity];
}