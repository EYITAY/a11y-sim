import React from 'react';
import { Color as ColorType, VisionType, VISION_TYPES } from '../types';
import { Icon } from './Icon';

interface SimulationPanelProps {
  colors: ColorType[];
  visionType: VisionType;
  uploadedImage: string | null;
  showTextShadow: boolean;
}

const visionFilterMap: Record<VisionType, string> = {
    normal: '',
    deuteranopia: 'url(#deuteranopia)',
    protanopia: 'url(#protanopia)',
    tritanopia: 'url(#tritanopia)',
    achromatopsia: 'url(#achromatopsia)',
    deuteranomaly: 'url(#deuteranomaly)',
    protanomaly: 'url(#protanomaly)',
    tritanomaly: 'url(#tritanomaly)',
    achromatomaly: 'url(#achromatomaly)',
    blurred: 'blur(3px)',
    'low-contrast': 'contrast(60%)',
};

const FallbackUI: React.FC<{colors: ColorType[], showTextShadow: boolean}> = ({ colors, showTextShadow }) => {
    const [bg, c1, c2, c3] = colors;
    const safeBg = bg?.hex || '#FFFFFF';
    const safeC1 = c1?.hex || '#1F2937';
    const safeC2 = c2?.hex || '#4B5563';
    const safeC3 = c3?.hex || '#3B82F6';

    const textShadowStyle = showTextShadow ? '0 1px 2px rgba(0,0,0,0.5)' : 'none';

    const getButtonTextColor = () => {
        if (!c3) return '#FFFFFF';
        const c3Luminance = getLuminance(hexToRgb(c3.hex));
        return c3Luminance > 0.5 ? '#000000' : '#FFFFFF';
    }
    
    // Quick helpers to avoid errors on deleted colors
    const getLuminance = (rgb: {r: number, g: number, b: number}) => {
        const a = [rgb.r, rgb.g, rgb.b].map(v => {
            v /= 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    }
    const hexToRgb = (hex: string) => {
        hex = hex.replace(/^#/, '');
        const bigint = parseInt(hex, 16);
        return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
    }

    return (
        <div className="w-full max-w-sm mx-auto p-5 sm:p-6 rounded-xl shadow-lg" style={{ backgroundColor: safeBg }}>
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-inner" style={{ backgroundColor: safeC1 }}>
                    <Icon name="sparkles" className="w-6 h-6" style={{ color: safeBg }} />
                </div>
                <div className="flex-1">
                    <h2 className="text-xl font-bold truncate" style={{ color: safeC1, textShadow: textShadowStyle }}>Feature Title</h2>
                    <p className="text-sm truncate" style={{ color: safeC2, textShadow: textShadowStyle }}>A short, catchy subtitle.</p>
                </div>
            </div>
            <p className="mb-6 text-sm sm:text-base" style={{ color: safeC2, textShadow: textShadowStyle }}>
                This is a realistic example of how your chosen colors will look together on a user interface component.
            </p>
            <button className="w-full py-2.5 px-4 rounded-lg font-semibold text-base transition-transform transform hover:scale-105" style={{ backgroundColor: safeC3, color: getButtonTextColor(), textShadow: textShadowStyle }}>
                Take Action
            </button>
        </div>
    );
};


export const SimulationPanel: React.FC<SimulationPanelProps> = ({ colors, visionType, uploadedImage, showTextShadow }) => {
  const visionTypeName = VISION_TYPES.find(vt => vt.id === visionType)?.name || 'Normal Vision';

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 sm:p-6">
      <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-4">{visionTypeName} Simulation</h3>
      
      <div className="bg-slate-100 dark:bg-slate-800/50 rounded-lg p-2 sm:p-4 min-h-[450px] flex justify-center items-center">
        {uploadedImage ? (
            <div 
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center w-full"
              style={{ filter: visionFilterMap[visionType] }}
            >
                {/* Column 1: Image and Palette */}
                <div className="space-y-4">
                    <img src={uploadedImage} alt="User upload" className="max-w-full max-h-[50vh] object-contain mx-auto rounded-lg shadow-md" />
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                        <h4 className="text-md font-semibold mb-3 text-slate-600 dark:text-slate-400 text-center">Affected Palette</h4>
                        <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                        {colors.map((color, index) => (
                            <div key={color.id} className="text-center">
                                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg shadow-inner border border-slate-200 dark:border-slate-700" style={{ backgroundColor: color.hex }}></div>
                                <p className="mt-1 text-xs font-mono text-slate-500 dark:text-slate-400">{color.hex}</p>
                                <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">{index === 0 ? 'BG' : `C${index}`}</p>
                            </div>
                        ))}
                        </div>
                    </div>
                </div>

                {/* Column 2: Fallback UI Card */}
                <div>
                   <FallbackUI colors={colors} showTextShadow={showTextShadow} />
                </div>
            </div>
        ) : (
            <div className="w-full text-center text-slate-500 dark:text-slate-400" style={{ filter: visionFilterMap[visionType] }}>
                <div className="max-w-xs mx-auto">
                    <Icon name="image" className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-slate-400 dark:text-slate-500 mb-4" />
                    <h4 className="text-lg font-semibold text-slate-600 dark:text-slate-300">Simulate on an Image</h4>
                    <p className="text-sm sm:text-base">Upload a design screenshot for the most accurate simulation, or preview with a sample UI card:</p>
                </div>
                <div className="mt-6">
                    <FallbackUI colors={colors} showTextShadow={showTextShadow} />
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
