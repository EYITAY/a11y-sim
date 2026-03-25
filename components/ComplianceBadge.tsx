import React from 'react';
import { WCAGLevel, WCAG_LEVELS } from '../types';

interface ComplianceBadgeProps {
  ratio: number;
  level: WCAGLevel;
}

export const ComplianceBadge: React.FC<ComplianceBadgeProps> = ({ ratio, level }) => {
  const levelInfo = WCAG_LEVELS[level];
  const passes = ratio >= levelInfo.ratio;
  const passesLarge = ratio >= levelInfo.largeTextRatio;

  let text = `${level} Fail`;
  let styles = 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';

  if (passes) {
    text = `${level} Pass`;
    styles = 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
  } else if (passesLarge) {
    text = `${level} Pass (Large)`;
    styles = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300';
  }

  return (
    <span className={`px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap ${styles}`}>
      {text}
    </span>
  );
};