import { AnalysisDepth } from '../types';

// Paid Tier 1: Higher limits
const DAILY_LIMIT = 500; // Increased from 50 to 500 for Paid Tier 1
const COSTS: Record<AnalysisDepth, number> = {
  quick: 1,
  standard: 5,
  deep: 20 // Deep analysis is more resource-intensive
};

export const getUsageData = () => {
  const saved = localStorage.getItem('repoAnalyzerUsage');
  const today = new Date().toISOString().split('T')[0];
  
  if (saved) {
    const data = JSON.parse(saved);
    if (data.date === today) return data;
  }
  
  return { date: today, used: 0 };
};

export const canPerformAnalysis = (depth: AnalysisDepth): boolean => {
  const { used } = getUsageData();
  return (used + COSTS[depth]) <= DAILY_LIMIT;
};

export const recordAnalysis = (depth: AnalysisDepth) => {
  const data = getUsageData();
  data.used += COSTS[depth];
  localStorage.setItem('repoAnalyzerUsage', JSON.stringify(data));
};

export const getRemainingUnits = () => {
  const { used } = getUsageData();
  return Math.max(0, DAILY_LIMIT - used);
};

export const getDailyLimit = () => DAILY_LIMIT;
