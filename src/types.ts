export interface AnalysisResult {
  id: string;
  url: string;
  timestamp: number;
  repoName: string;
  markdown: string;
  nodeDetails?: Record<string, string>;
  categoryScores?: Record<string, number> | null;
  fileTree?: string[];
}

export type AnalysisDepth = 'quick' | 'standard' | 'deep';

export interface Phase {
  title: string;
  content: string;
  score?: string;
}
