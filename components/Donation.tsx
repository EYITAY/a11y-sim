import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from './Icon';

interface DonationProps {
    isOpen: boolean;
    onClose: () => void;
}

const STRIPE_DONATION_LINK = 'https://donate.stripe.com/cNidR960b75A1n63vE4Vy0k';

export const Donation: React.FC<DonationProps> = ({ isOpen, onClose }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 20, opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-sm m-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                         <button
                            onClick={onClose}
                            className="absolute top-3 right-3 p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            aria-label="Close donation dialog"
                        >
                            <Icon name="x-circle" className="w-7 h-7" />
                        </button>
                        
                        <div className="p-8 text-center">
                            <Icon name="coffee" className="w-12 h-12 mx-auto text-amber-500 mb-4" />
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Support A11y Sim</h2>
                            <p className="text-slate-600 dark:text-slate-300 mt-2 mb-6">
                                This tool is open-source and free to use. Your contribution helps cover our costs and supports future development.
                            </p>
                            <a
                                href={STRIPE_DONATION_LINK}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 bg-[#635BFF] text-white font-bold py-3 px-6 rounded-lg hover:bg-[#554dff] transition-all duration-300 transform hover:scale-105"
                            >
                                <Icon name="stripe" className="w-5 h-5"/>
                                <span>Donate with Stripe</span>
                            </a>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
