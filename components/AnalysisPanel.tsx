import React from 'react';
import { AnalysisResult, WCAGLevel } from '../types';
import { ComplianceBadge } from './ComplianceBadge';
import { SuggestionChip } from './SuggestionChip';
import { Icon } from './Icon';

interface AnalysisPanelProps {
  results: AnalysisResult[];
  backgroundColor: string;
  wcagLevel: WCAGLevel;
  onApplySuggestion: (id: string, hex: string) => void;
  isAiLoading: boolean;
  hasReport: boolean;
  onOpenReport: () => void;
  onClearReportData: () => void;
}

const AiPlaceholder: React.FC<{ isLoading: boolean }> = ({ isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center text-center p-8 bg-slate-50 dark:bg-slate-800/50 rounded-lg min-h-[400px]">
        <Icon name="loader" className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="mt-4 text-slate-600 dark:text-slate-300 font-semibold">Generating Insights...</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">The full report will open shortly.</p>
      </div>
    );
  }
  return (
    <div className="flex-grow flex flex-col items-center justify-center text-center p-8 bg-slate-50 dark:bg-slate-800/50 rounded-lg min-h-[400px]">
      <Icon name="sparkles" className="w-10 h-10 text-slate-400 dark:text-slate-500 mx-auto" />
      <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 font-semibold">Get Feedback</p>
      <p className="text-sm text-slate-500 dark:text-slate-400">Click "Prepare Report" on the left to review contrast details, then unlock the report via Stripe to generate AI insights.</p>
    </div>
  );
};


export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  results,
  backgroundColor,
  wcagLevel,
  onApplySuggestion,
  isAiLoading,
  hasReport,
  onOpenReport,
  onClearReportData,
}) => {
  return (
    <div className="space-y-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 sm:p-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                    <Icon name="clipboard-check" className="w-6 h-6 text-green-600" />
                    WCAG Contrast Analysis
                </h2>
                <div className="space-y-4">
                    {results.map((result, index) => (
                        <div key={result.id} className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                            <div className="flex flex-wrap justify-between items-start gap-2">
                                <div>
                                    <h3 className="font-semibold text-slate-700 dark:text-slate-300 flex items-center">
                                        <div className="w-5 h-5 rounded-full mr-2 border dark:border-slate-600" style={{backgroundColor: result.hex}}></div>
                                        Color {index + 1} on Background
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-mono">{result.hex} on {backgroundColor}</p>
                                </div>
                                <ComplianceBadge ratio={result.ratio} level={wcagLevel} />
                            </div>
                            <div className="mt-3 p-4 rounded-lg text-sm" style={{ backgroundColor, color: result.hex }}>
                                <p className="font-bold">Contrast Ratio: {result.ratio.toFixed(2)}:1</p>
                                <p>The quick brown fox jumps over the lazy dog.</p>
                            </div>
                            {!result.passes && result.suggestions.length > 0 && (
                                <div className="mt-4">
                                    <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-300">Suggestions:</h4>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {result.suggestions.map(hex => (
                                            <SuggestionChip key={hex} colorHex={hex} onClick={() => onApplySuggestion(result.id, hex)} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    {hasReport && (
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                        <button
                          onClick={onOpenReport}
                          className="w-full text-white bg-blue-600 hover:bg-blue-700 font-semibold py-2 px-4 rounded-lg transition-colors"
                        >
                          Open Report
                        </button>
                        <button
                          onClick={onClearReportData}
                          className="w-full text-slate-600 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 font-semibold py-2 px-4 rounded-lg transition-colors"
                        >
                          Start New Analysis
                        </button>
                      </div>
                    )}
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 sm:p-6 flex flex-col">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                    <Icon name="sparkles" className="w-6 h-6 text-blue-600" />
                    Design Insights
                </h2>
                <AiPlaceholder isLoading={isAiLoading} />
            </div>
        </div>
    </div>
  );
};