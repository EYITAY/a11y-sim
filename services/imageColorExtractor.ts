/**
 * Extracts the most dominant colors from an image.
 * @param imageUrl The data URL of the image to process.
 * @param colorCount The number of dominant colors to extract.
 * @param quality The quality of the analysis (higher is slower). 1 means every pixel, 10 means every 10th pixel.
 * @returns A promise that resolves to an array of hex color strings.
 */
export async function extractColorsFromImage(
    imageUrl: string,
    colorCount: number = 6,
    quality: number = 10
): Promise<string[]> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = 'Anonymous';
        image.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (!ctx) {
                return reject(new Error('Could not get canvas context'));
            }

            canvas.width = image.width;
            canvas.height = image.height;
            ctx.drawImage(image, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = imageData.data;
            const pixelCount = canvas.width * canvas.height;

            const colorMap: { [key: string]: number } = {};
            const rgbQuantize = (c: number) => Math.round(c / 32) * 32;

            for (let i = 0; i < pixelCount; i += quality) {
                const offset = i * 4;
                const r = rgbQuantize(pixels[offset]);
                const g = rgbQuantize(pixels[offset + 1]);
                const b = rgbQuantize(pixels[offset + 2]);
                const a = pixels[offset + 3];

                // Ignore transparent pixels
                if (a < 125) continue;

                const key = `${r},${g},${b}`;
                colorMap[key] = (colorMap[key] || 0) + 1;
            }

            const sortedColors = Object.entries(colorMap)
                .sort(([, countA], [, countB]) => countB - countA)
                .map(([rgbString]) => {
                    const [r, g, b] = rgbString.split(',').map(Number);
                    const toHex = (c: number) => c.toString(16).padStart(2, '0');
                    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
                });
                
            resolve(Array.from(new Set(sortedColors)).slice(0, colorCount));
        };
        image.onerror = (err) => {
            reject(new Error('Failed to load image for color extraction. ' + err));
        };
        image.src = imageUrl;
    });
}
