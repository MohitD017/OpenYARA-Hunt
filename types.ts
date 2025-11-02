export interface YaraRule {
  id: string;
  name: string;
  category: string;
  tags?: string[];
  cve?: string[];
  content: string;
  author: string;
  lastModified: string;
  description: string;
}

export interface Match {
  ruleName: string;
  fileName: string;
}

export interface HuntResult {
  matches: Match[];
  filesScanned: number;
  rulesApplied: number;
  duration: number; // in milliseconds
  metrics: HuntMetrics;
  report: Record<string, string[]>;
}

export interface HuntMetrics {
  precision: number;
  recall: number;
  f1Score: number;
  falsePositiveRate: number;
}