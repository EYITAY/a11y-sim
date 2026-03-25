import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'framer-motion';
import { ControlsPanel } from './ControlsPanel';
import { SimulationPanel } from './SimulationPanel';
import { AnalysisPanel } from './AnalysisPanel';
import { Color, VisionType, WCAGLevel, AnalysisResult, WCAG_LEVELS, VISION_TYPES, ReportData } from '../types';
import { calculateContrastRatio, generateSuggestions } from '../services/colorService';
import { extractColorsFromImage } from '../services/imageColorExtractor';
import { FullReportView } from './FullReportView';
import { clearPendingReport, readPendingReport, requestAiAnalysis, verifyReportUnlock } from '../services/backendService';
import { trackEvent } from '../services/analyticsService';

const VisionFilters = () => (
  <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
    <defs>
      <filter id="deuteranopia"><feColorMatrix type="matrix" values="0.625, 0.375, 0, 0, 0, 0.7, 0.3, 0, 0, 0, 0, 0.3, 0.7, 0, 0, 0, 0, 0, 1, 0"/></filter>
      <filter id="protanopia"><feColorMatrix type="matrix" values="0.567, 0.433, 0, 0, 0, 0.558, 0.442, 0, 0, 0, 0, 0.242, 0.758, 0, 0, 0, 0, 0, 1, 0"/></filter>
      <filter id="tritanopia"><feColorMatrix type="matrix" values="0.95, 0.05, 0, 0, 0, 0, 0.433, 0.567, 0, 0, 0, 0.475, 0.525, 0, 0, 0, 0, 0, 1, 0"/></filter>
      <filter id="achromatopsia"><feColorMatrix type="matrix" values="0.299, 0.587, 0.114, 0, 0, 0.299, 0.587, 0.114, 0, 0, 0.299, 0.587, 0.114, 0, 0, 0, 0, 0, 1, 0"/></filter>
      <filter id="deuteranomaly"><feColorMatrix type="matrix" values="0.8, 0.2, 0, 0, 0, 0.258, 0.742, 0, 0, 0, 0, 0.142, 0.858, 0, 0, 0, 0, 0, 1, 0"/></filter>
      <filter id="protanomaly"><feColorMatrix type="matrix" values="0.817, 0.183, 0, 0, 0, 0.333, 0.667, 0, 0, 0, 0, 0.125, 0.875, 0, 0, 0, 0, 0, 1, 0"/></filter>
      <filter id="tritanomaly"><feColorMatrix type="matrix" values="0.967, 0.033, 0, 0, 0, 0, 0.733, 0.267, 0, 0, 0, 0.183, 0.817, 0, 0, 0, 0, 0, 1, 0"/></filter>
      <filter id="achromatomaly"><feColorMatrix type="matrix" values="0.618, 0.320, 0.062, 0, 0, 0.163, 0.775, 0.062, 0, 0, 0.163, 0.320, 0.516, 0, 0, 0, 0, 0, 1, 0"/></filter>
    </defs>
  </svg>
);

export const SimulatorApp: React.FC = () => {
  const [colors, setColors] = useState<Color[]>([
    { id: 'bg', hex: '#FFFFFF' },
    { id: uuidv4(), hex: '#3B82F6' },
    { id: uuidv4(), hex: '#10B981' },
    { id: uuidv4(), hex: '#F97316' },
  ]);
  
  const [activeColorId, setActiveColorId] = useState<string>(colors[1].id);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [visionType, setVisionType] = useState<VisionType>(VISION_TYPES[0].id);
  const [wcagLevel, setWcagLevel] = useState<WCAGLevel>('AA');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'simulation' | 'analysis'>('simulation');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [isReportViewOpen, setIsReportViewOpen] = useState<boolean>(false);
  const [isReportUnlocked, setIsReportUnlocked] = useState<boolean>(false);
  const [showTextShadow, setShowTextShadow] = useState<boolean>(false);
  const [reportPreparedNotice, setReportPreparedNotice] = useState<boolean>(false);
  
  const backgroundColor = colors.find(c => c.id === 'bg')?.hex ?? '#FFFFFF';
  const foregroundColors = colors.filter(c => c.id !== 'bg');
  const activeColor = colors.find(c => c.id === activeColorId) || null;

  const handleAddColor = () => {
    const newColorHex = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0').toUpperCase()}`;
    const newColor = { id: uuidv4(), hex: newColorHex };
    setColors([...colors, newColor]);
    setActiveColorId(newColor.id);
  };

  const handleRemoveColor = (id: string) => {
    if (id === 'bg' || colors.length <= 2) return;
    setColors(prev => {
        const newColors = prev.filter(c => c.id !== id);
        if (activeColorId === id) {
            setActiveColorId(newColors.find(c => c.id !== 'bg')?.id || 'bg');
        }
        return newColors;
    });
  };

  const handleUpdateColor = (id: string, hex: string) => {
    setColors(colors.map(c => (c.id === id ? { ...c, hex: hex.toUpperCase() } : c)));
  };

  const handleExtractColors = useCallback(async () => {
    if (!uploadedImage) return;
    setIsExtracting(true);
    try {
        const extracted = await extractColorsFromImage(uploadedImage, 5);
        if (extracted.length > 0) {
            const newPalette: Color[] = extracted.map((hex, index) => {
                if (index === 0) {
                    return { id: 'bg', hex };
                }
                return { id: uuidv4(), hex };
            });
            setColors(newPalette);
            setActiveColorId(newPalette.find(c => c.id !== 'bg')?.id || 'bg');
        }
    } catch (error) {
        console.error("Failed to extract colors:", error);
    } finally {
        setIsExtracting(false);
    }
  }, [uploadedImage]);

  const analysisResults = useMemo<AnalysisResult[]>(() => {
    const levelInfo = WCAG_LEVELS[wcagLevel];
    return foregroundColors.map(color => {
      const ratio = calculateContrastRatio(color.hex, backgroundColor);
      const passes = ratio >= levelInfo.ratio;
      return {
        ...color,
        ratio,
        passes,
        suggestions: passes ? [] : generateSuggestions(color.hex, backgroundColor, levelInfo.ratio),
      };
    });
  }, [colors, wcagLevel, backgroundColor, foregroundColors]);

  const handleGenerateReport = useCallback(() => {
    setReportData(null);
    setReportError(null);
    setIsReportUnlocked(false);
    setActiveTab('analysis');

    const newReportData: ReportData = {
      colors,
      wcagLevel,
      analysisResults,
      aiInsights: '',
      visionType,
      imageUsed: !!uploadedImage,
    };

    setReportData(newReportData);
    setIsReportViewOpen(false);
    setReportPreparedNotice(true);
    window.setTimeout(() => {
      setReportPreparedNotice(false);
    }, 4000);
    void trackEvent('report_prepared', {
      colorCount: colors.length,
      wcagLevel,
      imageUsed: Boolean(uploadedImage),
    });
  }, [colors, wcagLevel, analysisResults, visionType, uploadedImage]);

  const handleClearReportData = () => {
    setReportData(null);
    setReportError(null);
    setIsReportUnlocked(false);
    setReportPreparedNotice(false);
  }

  useEffect(() => {
    const handleSuccessfulPurchase = (retrievedReport: ReportData) => {
      setReportData(retrievedReport);
      setColors(retrievedReport.colors);
      setWcagLevel(retrievedReport.wcagLevel);
      setVisionType(retrievedReport.visionType);
      setIsReportUnlocked(true);
      setIsReportViewOpen(true);
    };

    const verifyAndUnlockReport = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const hasPaymentSuccess = urlParams.has('payment_success');
      const sessionId = urlParams.get('session_id');

      if (!hasPaymentSuccess || !sessionId) {
        return;
      }

      const pendingReport = readPendingReport();
      if (!pendingReport) {
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      const isUnlocked = await verifyReportUnlock(sessionId);
      if (isUnlocked) {
        void trackEvent('payment_verified', { sessionId });
        setIsAiLoading(true);
        setReportError(null);
        try {
          const aiInsights = await requestAiAnalysis({
            sessionId,
            foregroundColors: pendingReport.colors.filter(c => c.id !== 'bg').map(c => c.hex),
            backgroundColor: pendingReport.colors.find(c => c.id === 'bg')?.hex ?? '#FFFFFF',
            wcagLevel: pendingReport.wcagLevel,
            imageProvided: pendingReport.imageUsed,
          });

          handleSuccessfulPurchase({
            ...pendingReport,
            aiInsights,
          });
          void trackEvent('ai_insights_generated', {
            wcagLevel: pendingReport.wcagLevel,
            imageUsed: pendingReport.imageUsed,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Payment verified, but AI generation failed. Please try again.';
          setReportError(message);
          handleSuccessfulPurchase(pendingReport);
          void trackEvent('ai_insights_generation_failed', {
            reason: message,
          });
        } finally {
          setIsAiLoading(false);
        }
      } else {
        setReportData(pendingReport);
        setIsReportUnlocked(false);
        setIsReportViewOpen(true);
        setReportError('This payment session is invalid or expired. Please unlock the report again.');
        void trackEvent('payment_verification_failed', { sessionId });
      }

      clearPendingReport();
      window.history.replaceState({}, document.title, window.location.pathname);
    };

    void verifyAndUnlockReport();
  }, []);

  return (
    <>
      <VisionFilters />
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-8xl font-sans">
        <header className="relative text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 dark:text-slate-100">
                Vision Analyzer
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mt-2">
                Test your color palettes and designs against various vision simulations.
            </p>
        </header>
        {reportPreparedNotice && (
          <div className="mb-6 p-4 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 flex items-center justify-between gap-3">
            <span className="text-sm font-medium">Report prepared successfully. Click Open Report to continue.</span>
            <button
              onClick={() => setIsReportViewOpen(true)}
              className="text-sm font-semibold bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors"
            >
              Open Report
            </button>
          </div>
        )}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 xl:col-span-3">
             <ControlsPanel
                colors={colors}
                activeColor={activeColor}
                visionType={visionType}
                wcagLevel={wcagLevel}
                uploadedImage={uploadedImage}
                onAddColor={handleAddColor}
                onRemoveColor={handleRemoveColor}
                onUpdateColor={handleUpdateColor}
                onSetActiveColorId={setActiveColorId}
                onSetUploadedImage={setUploadedImage}
                onUpdateVisionType={setVisionType}
                onUpdateWcagLevel={setWcagLevel}
                onAnalyzeWithAI={handleGenerateReport}
                isAiLoading={isAiLoading}
                onExtractColors={handleExtractColors}
                isExtracting={isExtracting}
                showTextShadow={showTextShadow}
                onToggleTextShadow={setShowTextShadow}
              />
          </div>
         
          <div className="lg:col-span-8 xl:col-span-9">
            <div className="flex border-b border-slate-200 dark:border-slate-700">
                {(['simulation', 'analysis'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`capitalize text-lg font-semibold py-3 px-6 -mb-px transition-colors duration-200 ${activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
            <div className="mt-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'simulation' && (
                            <SimulationPanel
                                colors={colors}
                                visionType={visionType}
                                uploadedImage={uploadedImage}
                                showTextShadow={showTextShadow}
                            />
                        )}
                        {activeTab === 'analysis' && (
                            <AnalysisPanel
                                results={analysisResults}
                                backgroundColor={backgroundColor}
                                wcagLevel={wcagLevel}
                                onApplySuggestion={handleUpdateColor}
                                isAiLoading={isAiLoading}
                                hasReport={!!reportData}
                              onOpenReport={() => setIsReportViewOpen(true)}
                                onClearReportData={handleClearReportData}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
          </div>
        </main>
      </div>
      <FullReportView
        isOpen={isReportViewOpen}
        onClose={() => setIsReportViewOpen(false)}
        reportData={reportData}
        isReportUnlocked={isReportUnlocked}
        isAiLoading={isAiLoading}
        errorMessage={reportError}
      />
    </>
  );
};