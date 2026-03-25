import React from 'react';
import { Color } from '../types';
import { Icon } from './Icon';
import { motion } from 'framer-motion';

interface PaletteListProps {
    colors: Color[];
    activeColorId: string | null;
    onColorSelect: (id: string) => void;
    onColorRemove: (id: string) => void;
    onColorAdd: () => void;
}

export const PaletteList: React.FC<PaletteListProps> = ({ colors, activeColorId, onColorSelect, onColorRemove, onColorAdd }) => {
    return (
        <div className="space-y-3">
            <p className="text-sm text-slate-500 dark:text-slate-400">The first color is your background. Click any color to edit it below.</p>
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-6 lg:grid-cols-5 xl:grid-cols-6 gap-2">
                {colors.map((color, index) => (
                    <div key={color.id} className="relative group">
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onColorSelect(color.id)}
                            className={`w-full aspect-square rounded-lg border-2 transition-all duration-150 ${activeColorId === color.id ? 'border-blue-500 scale-105 ring-4 ring-blue-500/20' : 'border-transparent hover:border-slate-300 dark:hover:border-slate-600'}`}
                            style={{ backgroundColor: color.hex }}
                            aria-label={`Select ${color.hex}`}
                        >
                           {index === 0 && <span className="absolute bottom-1 right-1 text-xs font-bold mix-blend-difference text-white">BG</span>}
                        </motion.button>
                        {color.id !== 'bg' && (
                             <button 
                                onClick={() => onColorRemove(color.id)} 
                                className="absolute -top-1 -right-1 w-5 h-5 bg-slate-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all duration-150 scale-75 hover:scale-100"
                                aria-label={`Remove ${color.hex}`}
                             >
                                <Icon name="trash" className="w-3 h-3"/>
                             </button>
                        )}
                    </div>
                ))}
                 <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={onColorAdd}
                    className="w-full aspect-square rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-blue-500 hover:text-blue-500 dark:hover:text-blue-500 transition-colors flex items-center justify-center"
                    aria-label="Add new color"
                >
                    <Icon name="plus" className="w-6 h-6" />
                </motion.button>
            </div>
        </div>
    )
}