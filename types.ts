
export interface Color {
  id: string;
  hex: string;
}

export type VisionType = 'normal' | 'deuteranopia' | 'protanopia' | 'tritanopia' | 'achromatopsia' | 'achromatomaly' | 'deuteranomaly' | 'protanomaly' | 'tritanomaly' | 'blurred' | 'low-contrast';

export const VISION_TYPES: { id: VisionType; name: string }[] = [
    { id: 'normal', name: 'Normal Vision' },
    { id: 'deuteranopia', name: 'Deuteranopia (Green-Blind)' },
    { id: 'protanopia', name: 'Protanopia (Red-Blind)' },
    { id: 'tritanopia', name: 'Tritanopia (Blue-Blind)' },
    { id: 'achromatopsia', name: 'Achromatopsia (Monochromacy)' },
    { id: 'achromatomaly', name: 'Achromatomaly (Partial Monochromacy)' },
    { id: 'deuteranomaly', name: 'Deuteranomaly (Green-Weak)' },
    { id: 'protanomaly', name: 'Protanomaly (Red-Weak)' },
    { id: 'tritanomaly', name: 'Tritanomaly (Blue-Weak)' },
    { id: 'blurred', name: 'Blurred Vision' },
    { id: 'low-contrast', name: 'Low Contrast Sensitivity' },
];

export type WCAGLevel = 'AA' | 'AAA';

export const WCAG_LEVELS: Record<WCAGLevel, { name: string; ratio: number; largeTextRatio: number; }> = {
    AA: { name: 'AA', ratio: 4.5, largeTextRatio: 3 },
    AAA: { name: 'AAA', ratio: 7, largeTextRatio: 4.5 },
};


export interface AnalysisResult extends Color {
  ratio: number;
  passes: boolean;
  suggestions: string[];
}

export interface ReportData {
  colors: Color[];
  wcagLevel: WCAGLevel;
  analysisResults: AnalysisResult[];
  aiInsights: string;
  visionType: VisionType;
  imageUsed: boolean;
}
