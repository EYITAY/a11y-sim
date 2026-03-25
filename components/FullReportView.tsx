import React, { useRef, useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { ReportData, AnalysisResult, WCAG_LEVELS, VISION_TYPES } from '../types';
import { Icon } from './Icon';
import { ComplianceBadge } from './ComplianceBadge';
import { createCheckoutSession, storePendingReport } from '../services/backendService';
import { getAttributionMetadata, trackEvent } from '../services/analyticsService';

interface FullReportViewProps {
    isOpen: boolean;
    onClose: () => void;
    reportData: ReportData | null;
    isReportUnlocked: boolean;
    isAiLoading: boolean;
    errorMessage: string | null;
}

const ReportSection: React.FC<{ title: string; icon: string; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-3">
            <Icon name={icon} className="w-6 h-6 text-blue-600" />
            {title}
        </h2>
        <div>{children}</div>
    </div>
);

const UnlockButton: React.FC<{ reportData: ReportData }> = ({ reportData }) => {
    const [isRedirecting, setIsRedirecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleUnlockClick = async () => {
        setIsRedirecting(true);
        setErrorMessage(null);

        try {
            storePendingReport(reportData);
            void trackEvent('checkout_started', {
                wcagLevel: reportData.wcagLevel,
                imageUsed: reportData.imageUsed,
                colorCount: reportData.colors.length,
            });
            const checkoutUrl = await createCheckoutSession({ metadata: getAttributionMetadata() });
            window.location.href = checkoutUrl;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to start checkout. Please try again.';
            setErrorMessage(message);
            setIsRedirecting(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-2">
            <button
                onClick={handleUnlockClick}
                disabled={isRedirecting}
                className="flex items-center justify-center gap-3 bg-[#635BFF] text-white font-bold py-2 px-6 rounded-lg hover:bg-[#554dff] transition-all duration-300 transform hover:scale-105 disabled:opacity-60 disabled:cursor-wait"
            >
                {isRedirecting ? (
                    <>
                        <Icon name="loader" className="w-5 h-5 animate-spin"/>
                        <span>Redirecting to Stripe...</span>
                    </>
                ) : (
                    <>
                        <Icon name="stripe" className="w-5 h-5"/>
                        <span>Unlock Report &amp; PDF ($9.00)</span>
                    </>
                )}
            </button>
            {errorMessage && (
                <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
            )}
        </div>
    );
};

export const FullReportView: React.FC<FullReportViewProps> = ({ isOpen, onClose, reportData, isReportUnlocked, isAiLoading, errorMessage }) => {
    const reportContentRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [showThanks, setShowThanks] = useState(false);
    const insightsSource = reportData?.aiInsights ?? '';

    const insightsHtml = useMemo(() => {
        // Replace 'A11y-GPT' with new greeting before parsing
        const updatedSource = insightsSource.replace(
            /Hello[\s,!]+I'm\s*(A11y(-|\s)?GPT,?\s*)?your (dedicated )?accessibility specialist\.?/i,
            "Hello there! I'm your accessibility specialist and it's a good thing you are considering accessibility in your development."
        );
        const rawHtml = marked.parse(updatedSource, { async: false });
        return DOMPurify.sanitize(rawHtml as string);
    }, [insightsSource]);

    useEffect(() => {
        if(isOpen && isReportUnlocked) {
            setShowThanks(true);
            const timer = setTimeout(() => setShowThanks(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [isOpen, isReportUnlocked]);

    const handleDownloadPdf = async () => {
        const reportElement = reportContentRef.current;
        if (!reportElement) return;

        setIsDownloading(true);

        // Save original styles
        const originalHeight = reportElement.style.height;
        const originalMaxHeight = reportElement.style.maxHeight;
        const originalOverflow = reportElement.style.overflow;
        const originalScrollTop = reportElement.scrollTop;

        // Expand to fit all content and scroll to top
        reportElement.style.height = 'auto';
        reportElement.style.maxHeight = 'none';
        reportElement.style.overflow = 'visible';
        reportElement.scrollTop = 0;

        // Wait for layout to settle
        await new Promise(resolve => setTimeout(resolve, 100));

        try {
            // Render with a white background for PDF
            const canvas = await html2canvas(reportElement, {
                scale: 2,
                backgroundColor: '#fff',
                useCORS: true,
                logging: false,
                windowWidth: reportElement.scrollWidth,
                windowHeight: reportElement.scrollHeight,
            });

            // Restore original styles and scroll
            reportElement.style.height = originalHeight;
            reportElement.style.maxHeight = originalMaxHeight;
            reportElement.style.overflow = originalOverflow;
            reportElement.scrollTop = originalScrollTop;

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });

            // Add a professional header FIRST so it is not covered
            pdf.setFillColor(44, 62, 80); // dark blue header
            pdf.rect(0, 0, canvas.width, 60, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(28);
            pdf.text('A11y Sim Accessibility Report', canvas.width / 2, 38, { align: 'center' });

            // Add watermark BEFORE the report image so it is under the content
            let watermarkAdded = false;
            try {
                const svgString = `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240' viewBox='0 0 24 24' fill='none' stroke='#2c3e50' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' opacity='0.10'><path d='M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z'/><path d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'/></svg>`;
                const svg = new window.Image();
                const svgBase64 = 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(svgString)));
                svg.onload = function() {
                    const watermarkCanvas = document.createElement('canvas');
                    watermarkCanvas.width = 240;
                    watermarkCanvas.height = 240;
                    const ctx = watermarkCanvas.getContext('2d');
                    ctx.drawImage(svg, 0, 0);
                    const pngData = watermarkCanvas.toDataURL('image/png');
                    pdf.addImage(pngData, 'PNG', canvas.width/2 - 120, canvas.height/2 - 120, 240, 240, undefined, 'FAST');
                    watermarkAdded = true;
                    // Now add the report image and save
                    const imgData = canvas.toDataURL('image/png');
                    pdf.addImage(imgData, 'PNG', 0, 60, canvas.width, canvas.height - 60);
                    pdf.save('A11y-Design-Report.pdf');
                };
                svg.src = svgBase64;
            } catch (e) {
                // fallback: just add the report image and save
                const imgData = canvas.toDataURL('image/png');
                pdf.addImage(imgData, 'PNG', 0, 60, canvas.width, canvas.height - 60);
                pdf.save('A11y-Design-Report.pdf');
            }
            if (!watermarkAdded) {
                // If watermark is not added asynchronously, add the report image and save synchronously
                const imgData = canvas.toDataURL('image/png');
                pdf.addImage(imgData, 'PNG', 0, 60, canvas.width, canvas.height - 60);
                pdf.save('A11y-Design-Report.pdf');
            }
        } catch (error) {
            console.error("Error generating PDF:", error);
        } finally {
            setIsDownloading(false);
        }
    };

    if (!reportData) return null;

    const { colors, wcagLevel, analysisResults, aiInsights, visionType, imageUsed } = reportData;
    const backgroundColor = colors.find(c => c.id === 'bg')?.hex ?? '#FFFFFF';
    const visionTypeName = VISION_TYPES.find(vt => vt.id === visionType)?.name || 'Normal Vision';

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 50, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.9, y: 50, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="relative bg-slate-50 dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                             <div className="flex items-center gap-3">
                                <Icon name="chart-bar" className="w-8 h-8 text-blue-600"/>
                                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Full Accessibility Report</h1>
                             </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                aria-label="Close report"
                            >
                                <Icon name="x-circle" className="w-8 h-8" />
                            </button>
                        </header>
                        
                        <main ref={reportContentRef} className="flex-grow overflow-y-auto p-6 space-y-6 bg-slate-50 dark:bg-slate-900">
                            {errorMessage && (
                                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-800 dark:text-amber-200 text-sm font-medium">
                                    {errorMessage}
                                </div>
                            )}
                            <AnimatePresence>
                            {showThanks && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="p-4 mb-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800 text-center"
                                >
                                    <p className="font-semibold text-green-800 dark:text-green-200">Thank you! Your report is unlocked.</p>
                                </motion.div>
                            )}
                            </AnimatePresence>

                            <ReportSection title="Design Insights" icon="sparkles">
                                <div className="relative rounded-lg p-4 shadow-sm" style={{ background: '#fff', letterSpacing: '0.05em', lineHeight: '1.6' }}>
                                    {isAiLoading && isReportUnlocked && (
                                        <div className="mb-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-200 text-sm font-medium flex items-center gap-2">
                                            <Icon name="loader" className="w-4 h-4 animate-spin" />
                                            Generating your AI insights now...
                                        </div>
                                    )}
                                    <div
                                        className={`prose prose-slate max-w-none dark:prose-invert transition-all duration-300 ${!isReportUnlocked ? 'blur-lg pointer-events-none' : ''}`}
                                        // Use Markdown parsing for headings, subheadings, and paragraphs
                                        dangerouslySetInnerHTML={{ __html: insightsHtml }}
                                    />
                                    {!isAiLoading && isReportUnlocked && !aiInsights.trim() && (
                                        <p className="text-slate-600 dark:text-slate-300 text-sm">
                                            Your payment is confirmed. AI insights will appear here once generated.
                                        </p>
                                    )}
                                     {!isReportUnlocked && (
                                        <div className="absolute inset-0 bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm flex flex-col items-center justify-center text-center rounded-lg p-4">
                                            <Icon name="lock" className="w-10 h-10 text-slate-600 dark:text-slate-300" />
                                            <h3 className="mt-4 text-2xl font-bold text-slate-800 dark:text-slate-100">Unlock Full Report</h3>
                                            <p className="mt-1 text-slate-600 dark:text-slate-300">Make a one-time payment to view the full analysis and download the PDF.</p>
                                        </div>
                                    )}
                                </div>
                            </ReportSection>

                            <ReportSection title="WCAG Contrast Analysis" icon="clipboard-check">
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                                    Analysis based on <span className="font-bold">{WCAG_LEVELS[wcagLevel].name}</span> standards. Background color is <span className="font-mono p-1 rounded bg-slate-200 dark:bg-slate-700 text-xs">{backgroundColor}</span>.
                                </p>
                                <div className="space-y-4">
                                    {analysisResults.map((result: AnalysisResult, index: number) => (
                                        <div key={result.id} className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                                            <div className="flex flex-wrap justify-between items-start gap-2">
                                                <div>
                                                    <h3 className="font-semibold text-slate-700 dark:text-slate-300 flex items-center">
                                                        <div className="w-5 h-5 rounded-full mr-2 border dark:border-slate-600" style={{ backgroundColor: result.hex }}></div>
                                                        Color {index + 1} ({result.hex})
                                                    </h3>
                                                </div>
                                                <ComplianceBadge ratio={result.ratio} level={wcagLevel} />
                                            </div>
                                            <div className="mt-3 p-4 rounded-lg text-sm" style={{ backgroundColor, color: result.hex }}>
                                                <p className="font-bold">Contrast Ratio: {result.ratio.toFixed(2)}:1</p>
                                                <p>The quick brown fox jumps over the lazy dog.</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ReportSection>
                            
                             <ReportSection title="Palette & Context" icon="palette">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Analyzed Palette</h3>
                                        <div className="flex flex-wrap gap-3">
                                            {colors.map((color, index) => (
                                                <div key={color.id} className="text-center">
                                                    <div className="w-16 h-16 rounded-lg shadow-inner border border-slate-200 dark:border-slate-700" style={{ backgroundColor: color.hex }}></div>
                                                    <p className="mt-1 text-xs font-mono text-slate-500 dark:text-slate-400">{color.hex}</p>
                                                    <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">{index === 0 ? 'Background' : `Color ${index}`}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                         <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Configuration</h3>
                                         <ul className="text-sm space-y-1 text-slate-600 dark:text-slate-400">
                                            <li><strong>WCAG Level:</strong> {wcagLevel}</li>
                                            <li><strong>Vision Simulation:</strong> {visionTypeName}</li>
                                            <li><strong>Image Used:</strong> {imageUsed ? 'Yes' : 'No'}</li>
                                         </ul>
                                    </div>
                                </div>
                            </ReportSection>

                        </main>
                        
                        <footer className="flex-shrink-0 flex items-center justify-center gap-4 p-4 border-t border-slate-200 dark:border-slate-700">
                           {isReportUnlocked ? (
                                <button
                                    onClick={handleDownloadPdf}
                                    disabled={isDownloading}
                                    className="flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-wait"
                               >
                                {isDownloading ? (
                                    <>
                                        <Icon name="loader" className="w-5 h-5 animate-spin"/>
                                        <span>Downloading...</span>
                                    </>
                                ) : (
                                    <>
                                        <Icon name="download" className="w-5 h-5"/>
                                        <span>Download PDF</span>
                                    </>
                                )}
                               </button>
                           ) : (
                                <UnlockButton reportData={reportData} />
                           )}
                           <button
                                onClick={onClose}
                                className="bg-slate-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-slate-700 transition-colors"
                           >
                            Close Report
                           </button>
                        </footer>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};