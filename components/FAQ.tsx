import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from './Icon';

const faqData = [
  {
    question: 'How does this tool promote inclusive design?',
    answer: 'By allowing you to experience your designs as users with various vision impairments would, this tool builds empathy and insight. It helps you identify and fix accessibility barriers, ensuring your digital products are usable and welcoming to a more diverse audience.'
  },
  {
    question: 'What are "Design Insights"?',
    answer: "Our analysis provides expert recommendations based on established accessibility principles. It goes beyond simple contrast checks to give you actionable advice on how to improve the usability and readability of your color palette for everyone."
  },
    {
    question: 'Which vision impairments can be simulated?',
    answer: 'The simulator supports 8 different color vision deficiencies (like Protanopia and Deuteranopia), plus general blurred vision and low contrast sensitivity to cover a wide range of visual accessibility needs.'
  },
  {
    question: 'Is my uploaded data, like images, kept private?',
    answer: 'Yes. Your privacy is paramount. All processing, including image simulation and analysis, happens directly in your browser. No image data is ever sent to or stored on our servers.'
  },
  {
    question: 'What are WCAG AA and AAA standards?',
    answer: 'WCAG (Web Content Accessibility Guidelines) are the global standard for web accessibility. Level AA is the widely accepted standard for most websites, while Level AAA is a stricter standard used for more specialized audiences, ensuring maximum accessibility.'
  },
];

const FAQItem: React.FC<{ question: string; answer: string; }> = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-slate-200 dark:border-slate-700">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center text-left py-5"
                aria-expanded={isOpen}
            >
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{question}</h3>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <Icon name="chevron-down" className="w-5 h-5 text-slate-500" />
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
                            open: { opacity: 1, height: 'auto', y: 0 },
                            collapsed: { opacity: 0, height: 0, y: -10 },
                        }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                     >
                        <p className="pb-5 text-slate-600 dark:text-slate-400">
                            {answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};


export const FAQ: React.FC = () => {
    return (
        <section className="py-20 bg-slate-50 dark:bg-slate-900">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="text-center mb-12">
                     <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Frequently Asked Questions</h2>
                </div>
                <div>
                    {faqData.map((item, index) => (
                        <FAQItem key={index} question={item.question} answer={item.answer} />
                    ))}
                </div>
            </div>
        </section>
    );
};