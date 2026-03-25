
import React from 'react';
import { getLuminance, hexToRgb } from '../services/colorService';

interface SuggestionChipProps {
  colorHex: string;
  onClick: () => void;
}

export const SuggestionChip: React.FC<SuggestionChipProps> = ({ colorHex, onClick }) => {
  const luminance = getLuminance(hexToRgb(colorHex));
  const textColor = luminance > 0.5 ? 'text-black' : 'text-white';

  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 text-sm font-mono rounded-md shadow-sm hover:scale-105 transform transition-transform duration-150`}
      style={{ backgroundColor: colorHex, color: textColor }}
    >
      {colorHex}
    </button>
  );
};
