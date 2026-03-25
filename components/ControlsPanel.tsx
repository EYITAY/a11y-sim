import React from 'react';
import { Color, VisionType, WCAGLevel, VISION_TYPES } from '../types';
import { Icon } from './Icon';
import { Section } from './Section';
import { PaletteList } from './PaletteList';
import { ColorEditor } from './ColorEditor';
import { ImageUploader } from './ImageUploader';

interface ControlsPanelProps {
  colors: Color[];
  activeColor: Color | null;
  visionType: VisionType;
  wcagLevel: WCAGLevel;
  uploadedImage: string | null;
  onAddColor: () => void;
  onRemoveColor: (id: string) => void;
  onUpdateColor: (id: string, hex: string) => void;
  onSetActiveColorId: (id: string) => void;
  onSetUploadedImage: (image: string | null) => void;
  onUpdateVisionType: (type: VisionType) => void;
  onUpdateWcagLevel: (level: WCAGLevel) => void;
  onAnalyzeWithAI: () => void;
  isAiLoading: boolean;
  onExtractColors: () => void;
  isExtracting: boolean;
  showTextShadow: boolean;
  onToggleTextShadow: (val: boolean) => void;
}

const visionFilterMap: Record<VisionType, string> = {
    normal: '',
    deuteranopia: 'url(#deuteranopia)',
    protanopia: 'url(#protanopia)',
    tritanopia: 'url(#tritanopia)',
    achromatopsia: 'url(#achromatopsia)',
    achromatomaly: 'url(#achromatomaly)',
    deuteranomaly: 'url(#deuteranomaly)',
    protanomaly: 'url(#protanomaly)',
    tritanomaly: 'url(#tritanomaly)',
    blurred: 'blur(2px)',
    'low-contrast': 'contrast(60%)',
};

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  colors,
  activeColor,
  visionType,
  wcagLevel,
  uploadedImage,
  onAddColor,
  onRemoveColor,
  onUpdateColor,
  onSetActiveColorId,
  onSetUploadedImage,
  onUpdateVisionType,
  onUpdateWcagLevel,
  onAnalyzeWithAI,
  isAiLoading,
  onExtractColors,
  isExtracting,
  showTextShadow,
  onToggleTextShadow,
}) => {
  const handleDownloadPalette = () => {
    const cssContent = colors.map((c, i) => {
      const name = i === 0 ? '--bg' : `--color-${i}`;
      return `  ${name}: ${c.hex};`;
    }).join('\n');
    
    const fileContent = `:root {\n${cssContent}\n}`;
    const blob = new Blob([fileContent], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'palette.css';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Section title="Color Palette" icon="palette" defaultOpen>
        <PaletteList 
            colors={colors}
            activeColorId={activeColor?.id || null}
            onColorSelect={onSetActiveColorId}
            onColorRemove={onRemoveColor}
            onColorAdd={onAddColor}
        />
        <button
          onClick={handleDownloadPalette}
          className="w-full mt-4 flex items-center justify-center gap-2 py-2 px-4 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm font-semibold"
        >
          <Icon name="download" className="w-4 h-4" />
          Download Palette (CSS)
        </button>
        {activeColor && (
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <h3 className="text-md font-semibold text-slate-700 dark:text-slate-300 mb-4">
                    Editing: {activeColor.id === 'bg' ? 'Background' : `Color ${colors.slice(1).findIndex(c => c.id === activeColor.id) + 1}`}
                </h3>
                <ColorEditor
                    color={activeColor}
                    onUpdateColor={onUpdateColor}
                />
            </div>
        )}
      </Section>
      
      <Section title="Vision Simulation" icon="eye" defaultOpen>
        <div className="grid grid-cols-2 gap-2">
          {VISION_TYPES.map(vt => (
            <button
              key={vt.id}
              onClick={() => onUpdateVisionType(vt.id)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all duration-200 ${
                visionType === vt.id 
                  ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 ring-1 ring-blue-500' 
                  : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500'
              }`}
            >
              <div 
                className="w-full h-8 rounded mb-1 flex items-center justify-center overflow-hidden bg-gradient-to-r from-red-500 via-green-500 to-blue-500"
                style={{ filter: visionFilterMap[vt.id] }}
              >
                <span className="text-[10px] font-bold text-white drop-shadow-sm">ABC</span>
              </div>
              <span className={`text-[10px] font-medium text-center leading-tight ${
                visionType === vt.id ? 'text-blue-700 dark:text-blue-300' : 'text-slate-600 dark:text-slate-400'
              }`}>
                {vt.name.split(' (')[0]}
              </span>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Image" icon="image">
        <ImageUploader 
            uploadedImage={uploadedImage}
            onSetUploadedImage={onSetUploadedImage}
            onExtractColors={onExtractColors}
            isExtracting={isExtracting}
        />
      </Section>

      <Section title="WCAG Settings" icon="settings">
        <div className="space-y-4">
          <div>
            <h3 className="text-md font-semibold text-slate-700 dark:text-slate-300 mb-2">Compliance Level</h3>
            <div className="flex space-x-4">
              {(['AA', 'AAA'] as WCAGLevel[]).map(level => (
                <label key={level} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="wcag-level"
                    value={level}
                    checked={wcagLevel === level}
                    onChange={() => onUpdateWcagLevel(level)}
                    className="form-radio h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:checked:bg-blue-600"
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">{level}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Subtle Text Shadows</span>
              <div className="relative inline-block w-10 align-middle select-none transition duration-200 ease-in">
                <input 
                  type="checkbox" 
                  name="toggle" 
                  id="toggle-shadow" 
                  checked={showTextShadow}
                  onChange={(e) => onToggleTextShadow(e.target.checked)}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 checked:border-blue-600"
                  style={{ right: showTextShadow ? '0' : 'auto', left: showTextShadow ? 'auto' : '0' }}
                />
                <label htmlFor="toggle-shadow" className="toggle-label block overflow-hidden h-6 rounded-full bg-slate-300 dark:bg-slate-600 cursor-pointer"></label>
              </div>
            </label>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Improves readability on complex backgrounds.</p>
          </div>
        </div>
      </Section>
      
      <button
        onClick={onAnalyzeWithAI}
        disabled={isAiLoading}
        className="w-full mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 shadow-lg hover:shadow-xl"
      >
        {isAiLoading ? (
          <>
            <Icon name="loader" className="w-5 h-5 animate-spin" />
            <span>Finalizing...</span>
          </>
        ) : (
          <>
            <Icon name="sparkles" className="w-5 h-5" />
            Prepare Report
          </>
        )}
      </button>
    </div>
  );
};