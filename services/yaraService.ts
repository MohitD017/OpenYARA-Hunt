
import { YaraRule, HuntResult, HuntMetrics, Match } from '../types.ts';

/**
 * A simplified function to extract string IOCs from YARA rule content for simulation.
 * NOTE: This is a basic parser for demonstration and only handles simple double-quoted strings.
 * It does not support hex strings, regular expressions, or complex conditions.
 * @param ruleContent The text content of the YARA rule.
 * @returns An array of string IOCs.
 */
const extractStringsFromRule = (ruleContent: string): string[] => {
  const stringsSection = ruleContent.match(/strings:\s*\{([^}]+)\}/s);
  if (!stringsSection) return [];

  // Correctly split by newline characters
  const stringLines = stringsSection[1].trim().split('\n');
  const extracted = stringLines.map(line => {
    // Match content inside double quotes
    const match = line.match(/=\s*"([^"]+)"/);
    return match ? match[1] : null;
  }).filter((s): s is string => s !== null);

  return extracted;
};

export const runHunt = async (rules: YaraRule[], files: File[]): Promise<HuntResult> => {
  const startTime = performance.now();
  const matches: Match[] = [];
  const report: Record<string, string[]> = {};

  for (const file of files) {
    report[file.name] = [];
    // Read file content once
    const content = await file.text();
    for (const rule of rules) {
      const ruleStrings = extractStringsFromRule(rule.content);
      // Use .some for efficiency; it stops on the first match.
      const matched = ruleStrings.some(str => content.includes(str));
      
      if (matched) {
        matches.push({ ruleName: rule.name, fileName: file.name });
        if (!report[file.name].includes(rule.name)) {
            report[file.name].push(rule.name);
        }
      }
    }
  }
  
  const endTime = performance.now();

  // Dummy metrics for demonstration. A real scenario would need ground truth labels.
  const metrics = calculateMetrics(matches.length, files.length);

  return {
    matches,
    filesScanned: files.length,
    rulesApplied: rules.length,
    duration: endTime - startTime,
    metrics,
    report,
  };
};

// This is a placeholder for metric calculation.
// In a real-world scenario, you would need a labeled dataset (ground truth)
// to know which files are truly malicious (True Positives) vs. benign (False Positives).
export const calculateMetrics = (
  totalDetections: number,
  totalFiles: number,
): HuntMetrics => {
  // Since we use a benign corpus, all detections are considered False Positives for this simulation.
  const falsePositives = totalDetections;
  const trueNegatives = totalFiles - falsePositives;
  const truePositives = 0; // No actual malware in our test set
  const falseNegatives = 0; // Assume we are not missing any malware we don't have

  const precision = truePositives + falsePositives > 0 ? truePositives / (truePositives + falsePositives) : 0;
  const recall = truePositives + falseNegatives > 0 ? truePositives / (truePositives + falseNegatives) : 0;
  const f1Score = precision + recall > 0 ? (2 * (precision * recall)) / (precision + recall) : 0;
  const falsePositiveRate = falsePositives + trueNegatives > 0 ? falsePositives / (falsePositives + trueNegatives) : 0;

  return {
    precision: parseFloat(precision.toFixed(2)),
    recall: parseFloat(recall.toFixed(2)),
    f1Score: parseFloat(f1Score.toFixed(2)),
    falsePositiveRate: parseFloat(falsePositiveRate.toFixed(2)),
  };
};