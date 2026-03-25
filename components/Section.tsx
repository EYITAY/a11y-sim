import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from './Icon';

interface SectionProps {
  title: string;
  icon: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export const Section: React.FC<SectionProps> = ({ title, icon, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 text-left"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <Icon name={icon} className="w-6 h-6 text-blue-600" />
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{title}</h2>
        </div>
        <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
        >
            <Icon name="chevron-down" className="w-5 h-5 text-slate-500 dark:text-slate-400" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { opacity: 1, height: 'auto' },
              collapsed: { opacity: 0, height: 0 },
            }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};