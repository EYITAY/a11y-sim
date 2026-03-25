import React, { useState, useEffect } from 'react';
import { Color } from '../types';
import { ColorWheel } from './ColorWheel';
import { hexToHsl, hslToHex } from '../services/colorService';

interface ColorEditorProps {
    color: Color;
    onUpdateColor: (id: string, hex: string) => void;
}

export const ColorEditor: React.FC<ColorEditorProps> = ({ color, onUpdateColor }) => {
    const [hexInput, setHexInput] = useState(color.hex.substring(1));
    const [hsl, setHsl] = useState(hexToHsl(color.hex));

    useEffect(() => {
        setHexInput(color.hex.substring(1));
        setHsl(hexToHsl(color.hex));
    }, [color]);
    
    const handleHslChange = (newHsl: { h: number, s: number, l: number }) => {
        setHsl(newHsl);
        const newHex = hslToHex(newHsl);
        setHexInput(newHex.substring(1));
        onUpdateColor(color.id, newHex);
    };

    const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newHex = e.target.value.toUpperCase();
        setHexInput(newHex);
        if (/^[0-9A-F]{6}$/i.test(newHex)) {
            onUpdateColor(color.id, `#${newHex}`);
            setHsl(hexToHsl(`#${newHex}`));
        }
    };
    
    const handleHexInputBlur = () => {
        let val = hexInput;
        if (!/^[0-9A-F]{6}$/i.test(val)) {
            val = color.hex.substring(1); // revert to last valid color
            setHexInput(val);
        }
    };

    return (
        <div className="space-y-4">
            <ColorWheel
                hsl={hsl}
                onHslChange={(h, s) => handleHslChange({ ...hsl, h, s })}
            />
            <div>
                <label htmlFor="lightness-slider" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Lightness</label>
                 <input
                    id="lightness-slider"
                    type="range"
                    min="0"
                    max="100"
                    value={hsl.l}
                    onChange={(e) => handleHslChange({ ...hsl, l: Number(e.target.value) })}
                    className="w-full h-2 bg-gradient-to-r from-black to-white rounded-lg appearance-none cursor-pointer"
                    style={{'--thumb-color': color.hex} as React.CSSProperties}
                />
            </div>
            <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500 font-medium">#</span>
                <input
                    type="text"
                    aria-label="Hex code"
                    value={hexInput}
                    onChange={handleHexInputChange}
                    onBlur={handleHexInputBlur}
                    className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg py-2 pl-7 pr-3 text-slate-700 dark:text-slate-200 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    maxLength={6}
                />
            </div>
        </div>
    );
}