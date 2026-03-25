export interface RGB { r: number; g: number; b: number; }
export interface HSL { h: number; s: number; l: number; }

export function hexToRgb(hex: string): RGB {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
}

export function rgbToHsl({ r, g, b }: RGB): HSL {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

export function hexToHsl(hex: string): HSL {
    return rgbToHsl(hexToRgb(hex));
}

export function hslToHex({ h, s, l }: HSL): string {
    s /= 100;
    l /= 100;
    const k = (n: number) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
    const toHex = (n: number) => Math.round(n * 255).toString(16).padStart(2, '0');
    return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`.toUpperCase();
}


export function getLuminance({ r, g, b }: RGB): number {
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

export function calculateContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(hexToRgb(color1));
  const lum2 = getLuminance(hexToRgb(color2));
  const ratio = (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);
  return Math.round(ratio * 100) / 100;
}

export function generateSuggestions(color: string, background: string, targetRatio: number): string[] {
    const fgHsl = rgbToHsl(hexToRgb(color));
    const bgLuminance = getLuminance(hexToRgb(background));
    const suggestions = new Set<string>();
    
    const isBgDark = bgLuminance < 0.5;

    for (let i = 1; i < 100; i++) {
        const newLightness = isBgDark ? fgHsl.l + i : fgHsl.l - i;
        if (newLightness < 0 || newLightness > 100) break;

        const newColorHex = hslToHex({ ...fgHsl, l: newLightness });
        if (calculateContrastRatio(newColorHex, background) >= targetRatio) {
            suggestions.add(newColorHex);
            if(suggestions.size >= 2) break;
        }
    }

    if (suggestions.size < 2) {
         for (let i = 1; i < 100; i++) {
            const newLightness = isBgDark ? fgHsl.l + i : fgHsl.l - i;
            if (newLightness < 0 || newLightness > 100) break;

            const newSaturation = Math.max(0, fgHsl.s - 15);
            const newColorHex = hslToHex({ ...fgHsl, l: newLightness, s: newSaturation });
            if (calculateContrastRatio(newColorHex, background) >= targetRatio) {
                suggestions.add(newColorHex);
                 if(suggestions.size >= 2) break;
            }
        }
    }
    
    return Array.from(suggestions);
}