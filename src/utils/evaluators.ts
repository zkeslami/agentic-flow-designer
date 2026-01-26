// Evaluator Functions Library
// Implements various evaluation strategies for nodes, subgraphs, and flows

import type {
  EvaluatorConfig,
  EvaluatorResult,
  EvaluatorType,
  DataPoint,
  TestCaseResult,
  EvaluationSummary,
} from '../types/evaluation';

// ============================================
// Core Evaluator Interface
// ============================================

export interface EvaluatorFn {
  (
    actual: unknown,
    expected: unknown,
    config: Record<string, unknown>,
    context?: EvaluationContext
  ): Promise<EvaluatorResult>;
}

export interface EvaluationContext {
  input: Record<string, unknown>;
  trajectory?: string[];
  expectedTrajectory?: string[];
  contextUsed?: string;
  executionTrace?: ExecutionStep[];
}

export interface ExecutionStep {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  input: unknown;
  output: unknown;
  durationMs: number;
  timestamp: string;
}

// ============================================
// Evaluator Registry
// ============================================

const evaluatorRegistry: Record<EvaluatorType, EvaluatorFn> = {
  exact_match: exactMatchEvaluator,
  contains: containsEvaluator,
  json_similarity: jsonSimilarityEvaluator,
  context_precision: contextPrecisionEvaluator,
  llm_judge_output: llmJudgeOutputEvaluator,
  llm_judge_trajectory: llmJudgeTrajectoryEvaluator,
  trajectory_match: trajectoryMatchEvaluator,
};

export function getEvaluator(type: EvaluatorType): EvaluatorFn {
  return evaluatorRegistry[type];
}

// ============================================
// Exact Match Evaluator
// ============================================

async function exactMatchEvaluator(
  actual: unknown,
  expected: unknown,
  config: Record<string, unknown>
): Promise<EvaluatorResult> {
  const startTime = Date.now();
  const caseSensitive = config.caseSensitive as boolean ?? false;
  const trimWhitespace = config.trimWhitespace as boolean ?? true;

  let actualStr = String(actual);
  let expectedStr = String(expected);

  if (trimWhitespace) {
    actualStr = actualStr.trim();
    expectedStr = expectedStr.trim();
  }

  if (!caseSensitive) {
    actualStr = actualStr.toLowerCase();
    expectedStr = expectedStr.toLowerCase();
  }

  const passed = actualStr === expectedStr;

  return {
    evaluatorType: 'exact_match',
    evaluatorName: 'Exact Match',
    score: passed ? 1 : 0,
    passed,
    details: {
      expected: expectedStr,
      actual: actualStr,
      diff: passed ? null : { expected: expectedStr, actual: actualStr },
    },
    latencyMs: Date.now() - startTime,
  };
}

// ============================================
// Contains Evaluator
// ============================================

async function containsEvaluator(
  actual: unknown,
  _expected: unknown,
  config: Record<string, unknown>
): Promise<EvaluatorResult> {
  const startTime = Date.now();
  const keywords = (config.keywords as string[]) || [];
  const matchAll = config.matchAll as boolean ?? false;
  const caseSensitive = config.caseSensitive as boolean ?? false;

  let actualStr = String(actual);
  if (!caseSensitive) {
    actualStr = actualStr.toLowerCase();
  }

  const matchResults: Record<string, boolean> = {};
  let matchCount = 0;

  for (const keyword of keywords) {
    const searchKeyword = caseSensitive ? keyword : keyword.toLowerCase();
    const found = actualStr.includes(searchKeyword);
    matchResults[keyword] = found;
    if (found) matchCount++;
  }

  const passed = matchAll
    ? matchCount === keywords.length
    : matchCount > 0;

  const score = keywords.length > 0 ? matchCount / keywords.length : 1;

  return {
    evaluatorType: 'contains',
    evaluatorName: 'Contains Keywords',
    score,
    passed,
    details: {
      expected: keywords,
      actual: actualStr.substring(0, 500), // Truncate for display
      breakdown: matchResults as unknown as Record<string, number>,
    },
    latencyMs: Date.now() - startTime,
  };
}

// ============================================
// JSON Similarity Evaluator
// ============================================

async function jsonSimilarityEvaluator(
  actual: unknown,
  expected: unknown,
  config: Record<string, unknown>
): Promise<EvaluatorResult> {
  const startTime = Date.now();
  const threshold = (config.threshold as number) ?? 0.9;
  const ignoreFields = (config.ignoreFields as string[]) || [];
  const strictTypeMatching = config.strictTypeMatching as boolean ?? false;

  let actualObj: Record<string, unknown>;
  let expectedObj: Record<string, unknown>;

  try {
    actualObj = typeof actual === 'string' ? JSON.parse(actual) : actual as Record<string, unknown>;
    expectedObj = typeof expected === 'string' ? JSON.parse(expected) : expected as Record<string, unknown>;
  } catch {
    return {
      evaluatorType: 'json_similarity',
      evaluatorName: 'JSON Similarity',
      score: 0,
      passed: false,
      details: {
        expected,
        actual,
        reasoning: 'Failed to parse JSON',
      },
      latencyMs: Date.now() - startTime,
    };
  }

  const similarity = calculateJsonSimilarity(actualObj, expectedObj, ignoreFields, strictTypeMatching);
  const passed = similarity >= threshold;

  return {
    evaluatorType: 'json_similarity',
    evaluatorName: 'JSON Similarity',
    score: similarity,
    passed,
    details: {
      expected: expectedObj,
      actual: actualObj,
      diff: getJsonDiff(expectedObj, actualObj),
      breakdown: { similarity, threshold },
    },
    latencyMs: Date.now() - startTime,
  };
}

function calculateJsonSimilarity(
  actual: unknown,
  expected: unknown,
  ignoreFields: string[],
  strictTypes: boolean,
  path: string = ''
): number {
  // Handle null/undefined
  if (expected === null || expected === undefined) {
    return actual === null || actual === undefined ? 1 : 0;
  }

  // Check if field should be ignored
  if (ignoreFields.some(f => path.endsWith(f))) {
    return 1;
  }

  // Type mismatch
  if (strictTypes && typeof actual !== typeof expected) {
    return 0;
  }

  // Primitive comparison
  if (typeof expected !== 'object') {
    if (String(actual) === String(expected)) return 1;
    // Partial string match for non-strict
    if (!strictTypes && typeof actual === 'string' && typeof expected === 'string') {
      return stringSimilarity(actual, expected);
    }
    return 0;
  }

  // Array comparison
  if (Array.isArray(expected)) {
    if (!Array.isArray(actual)) return 0;
    if (expected.length === 0) return actual.length === 0 ? 1 : 0;

    let totalScore = 0;
    const maxLen = Math.max(expected.length, actual.length);

    for (let i = 0; i < maxLen; i++) {
      if (i < expected.length && i < actual.length) {
        totalScore += calculateJsonSimilarity(
          actual[i],
          expected[i],
          ignoreFields,
          strictTypes,
          `${path}[${i}]`
        );
      }
    }

    return totalScore / maxLen;
  }

  // Object comparison
  const expectedObj = expected as Record<string, unknown>;
  const actualObj = actual as Record<string, unknown>;
  const allKeys = new Set([...Object.keys(expectedObj), ...Object.keys(actualObj || {})]);
  const filteredKeys = [...allKeys].filter(k => !ignoreFields.includes(k));

  if (filteredKeys.length === 0) return 1;

  let totalScore = 0;
  for (const key of filteredKeys) {
    if (key in expectedObj && actualObj && key in actualObj) {
      totalScore += calculateJsonSimilarity(
        actualObj[key],
        expectedObj[key],
        ignoreFields,
        strictTypes,
        path ? `${path}.${key}` : key
      );
    } else if (key in expectedObj) {
      totalScore += 0; // Missing in actual
    } else {
      totalScore += 0.5; // Extra in actual (partial penalty)
    }
  }

  return totalScore / filteredKeys.length;
}

function stringSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length === 0 || b.length === 0) return 0;

  // Simple Levenshtein-based similarity
  const longer = a.length > b.length ? a : b;
  const shorter = a.length > b.length ? b : a;

  if (longer.includes(shorter)) {
    return shorter.length / longer.length;
  }

  // Basic character overlap
  const aChars = new Set(a.toLowerCase().split(''));
  const bChars = new Set(b.toLowerCase().split(''));
  const intersection = [...aChars].filter(c => bChars.has(c)).length;
  const union = new Set([...aChars, ...bChars]).size;

  return intersection / union;
}

function getJsonDiff(expected: unknown, actual: unknown, path: string = ''): Record<string, unknown> {
  const diff: Record<string, unknown> = {};

  if (typeof expected !== 'object' || expected === null) {
    if (expected !== actual) {
      diff[path || 'value'] = { expected, actual };
    }
    return diff;
  }

  if (Array.isArray(expected)) {
    const actualArr = Array.isArray(actual) ? actual : [];
    expected.forEach((item, i) => {
      Object.assign(diff, getJsonDiff(item, actualArr[i], `${path}[${i}]`));
    });
    return diff;
  }

  const expectedObj = expected as Record<string, unknown>;
  const actualObj = (actual as Record<string, unknown>) || {};

  for (const key of Object.keys(expectedObj)) {
    const newPath = path ? `${path}.${key}` : key;
    if (!(key in actualObj)) {
      diff[newPath] = { expected: expectedObj[key], actual: undefined };
    } else {
      Object.assign(diff, getJsonDiff(expectedObj[key], actualObj[key], newPath));
    }
  }

  return diff;
}

// ============================================
// Context Precision Evaluator
// ============================================

async function contextPrecisionEvaluator(
  actual: unknown,
  expected: unknown,
  config: Record<string, unknown>,
  context?: EvaluationContext
): Promise<EvaluatorResult> {
  const startTime = Date.now();
  const threshold = (config.threshold as number) ?? 0.8;
  const relevanceWeight = (config.relevanceWeight as number) ?? 0.6;
  const coverageWeight = (config.coverageWeight as number) ?? 0.4;

  const actualStr = String(actual).toLowerCase();
  const contextStr = context?.contextUsed?.toLowerCase() || '';
  const expectedStr = String(expected).toLowerCase();

  // Calculate relevance: how much of the response is grounded in context
  const relevanceScore = calculateRelevance(actualStr, contextStr);

  // Calculate coverage: how well the response covers expected content
  const coverageScore = calculateCoverage(actualStr, expectedStr);

  const score = relevanceScore * relevanceWeight + coverageScore * coverageWeight;
  const passed = score >= threshold;

  return {
    evaluatorType: 'context_precision',
    evaluatorName: 'Context Precision',
    score,
    passed,
    details: {
      expected: expectedStr.substring(0, 200),
      actual: actualStr.substring(0, 200),
      breakdown: {
        relevance: relevanceScore,
        coverage: coverageScore,
        threshold,
      },
    },
    latencyMs: Date.now() - startTime,
  };
}

function calculateRelevance(response: string, context: string): number {
  if (!context) return 0.5; // No context to compare

  // Extract key phrases from response and check if in context
  const responseWords = new Set(response.split(/\s+/).filter(w => w.length > 3));
  const contextWords = new Set(context.split(/\s+/).filter(w => w.length > 3));

  if (responseWords.size === 0) return 0;

  let grounded = 0;
  for (const word of responseWords) {
    if (contextWords.has(word)) grounded++;
  }

  return grounded / responseWords.size;
}

function calculateCoverage(response: string, expected: string): number {
  if (!expected) return 1;

  const expectedWords = new Set(expected.split(/\s+/).filter(w => w.length > 3));
  const responseWords = new Set(response.split(/\s+/).filter(w => w.length > 3));

  if (expectedWords.size === 0) return 1;

  let covered = 0;
  for (const word of expectedWords) {
    if (responseWords.has(word)) covered++;
  }

  return covered / expectedWords.size;
}

// ============================================
// LLM Judge Output Evaluator
// ============================================

async function llmJudgeOutputEvaluator(
  actual: unknown,
  expected: unknown,
  config: Record<string, unknown>,
  _context?: EvaluationContext
): Promise<EvaluatorResult> {
  const startTime = Date.now();
  const criteria = (config.criteria as string[]) || ['accuracy', 'relevance', 'completeness'];
  const scoreScale = (config.scoreScale as number) ?? 5;
  // rubric can be used for custom evaluation criteria in future
  void config.rubric;

  // In a real implementation, this would call an LLM API
  // For demo purposes, we'll simulate the evaluation
  const simulatedScores: Record<string, number> = {};
  let totalScore = 0;

  for (const criterion of criteria) {
    // Simulate scoring based on basic heuristics
    const score = simulateLLMScore(actual, expected, criterion);
    simulatedScores[criterion] = score;
    totalScore += score;
  }

  const averageScore = totalScore / criteria.length;
  const normalizedScore = averageScore / scoreScale;
  const passed = normalizedScore >= 0.7; // 70% threshold

  return {
    evaluatorType: 'llm_judge_output',
    evaluatorName: 'LLM Judge (Output)',
    score: normalizedScore,
    passed,
    details: {
      expected,
      actual,
      reasoning: generateLLMReasoning(simulatedScores, criteria),
      breakdown: simulatedScores,
    },
    latencyMs: Date.now() - startTime,
  };
}

function simulateLLMScore(actual: unknown, expected: unknown, criterion: string): number {
  // Simulate LLM scoring - in production this calls an actual LLM
  const actualStr = String(actual).toLowerCase();
  const expectedStr = String(expected).toLowerCase();

  switch (criterion) {
    case 'accuracy':
      return stringSimilarity(actualStr, expectedStr) * 5;
    case 'relevance':
      return actualStr.length > 0 ? 3.5 + Math.random() * 1.5 : 1;
    case 'completeness':
      return Math.min(actualStr.length / Math.max(expectedStr.length, 1), 1) * 5;
    case 'coherence':
      return actualStr.split(/[.!?]/).length > 1 ? 4 : 2.5;
    case 'safety':
      return 4.5; // Default safe
    default:
      return 3 + Math.random() * 2;
  }
}

function generateLLMReasoning(scores: Record<string, number>, criteria: string[]): string {
  const parts: string[] = [];

  for (const criterion of criteria) {
    const score = scores[criterion] || 0;
    const rating = score >= 4 ? 'strong' : score >= 3 ? 'adequate' : 'weak';
    parts.push(`${criterion}: ${rating} (${score.toFixed(1)}/5)`);
  }

  return `Evaluation Summary:\n${parts.join('\n')}`;
}

// ============================================
// LLM Judge Trajectory Evaluator
// ============================================

async function llmJudgeTrajectoryEvaluator(
  _actual: unknown,
  _expected: unknown,
  config: Record<string, unknown>,
  context?: EvaluationContext
): Promise<EvaluatorResult> {
  const startTime = Date.now();
  const allowExtraSteps = config.allowExtraSteps as boolean ?? true;
  const evaluateReasoning = config.evaluateReasoning as boolean ?? true;

  const actualTrajectory = context?.trajectory || [];
  const expectedTrajectory = context?.expectedTrajectory || [];

  // Evaluate trajectory alignment
  const trajectoryScore = evaluateTrajectoryAlignment(
    actualTrajectory,
    expectedTrajectory,
    allowExtraSteps
  );

  // Evaluate reasoning quality (simulated)
  const reasoningScore = evaluateReasoning ? simulateReasoningScore(context?.executionTrace) : 1;

  const score = evaluateReasoning
    ? trajectoryScore * 0.6 + reasoningScore * 0.4
    : trajectoryScore;

  const passed = score >= 0.7;

  return {
    evaluatorType: 'llm_judge_trajectory',
    evaluatorName: 'LLM Judge (Trajectory)',
    score,
    passed,
    details: {
      expected: expectedTrajectory,
      actual: actualTrajectory,
      reasoning: `Trajectory alignment: ${(trajectoryScore * 100).toFixed(1)}%${evaluateReasoning ? `\nReasoning quality: ${(reasoningScore * 100).toFixed(1)}%` : ''}`,
      breakdown: {
        trajectoryScore,
        reasoningScore: evaluateReasoning ? reasoningScore : undefined,
      } as Record<string, number>,
    },
    latencyMs: Date.now() - startTime,
  };
}

function evaluateTrajectoryAlignment(
  actual: string[],
  expected: string[],
  allowExtra: boolean
): number {
  if (expected.length === 0) return actual.length === 0 ? 1 : 0.5;

  let matchedSteps = 0;
  let expectedIndex = 0;

  for (const step of actual) {
    if (expectedIndex < expected.length && step === expected[expectedIndex]) {
      matchedSteps++;
      expectedIndex++;
    } else if (!allowExtra) {
      // Penalty for extra steps when not allowed
      matchedSteps -= 0.5;
    }
  }

  const coverageScore = matchedSteps / expected.length;
  const extraPenalty = allowExtra ? 0 : Math.max(0, actual.length - expected.length) * 0.1;

  return Math.max(0, Math.min(1, coverageScore - extraPenalty));
}

function simulateReasoningScore(trace?: ExecutionStep[]): number {
  if (!trace || trace.length === 0) return 0.5;

  // Simulate reasoning evaluation based on trace quality
  let score = 0.5;

  // Reward for having outputs at each step
  const stepsWithOutput = trace.filter(s => s.output !== null && s.output !== undefined);
  score += (stepsWithOutput.length / trace.length) * 0.3;

  // Reward for reasonable execution times
  const avgLatency = trace.reduce((sum, s) => sum + s.durationMs, 0) / trace.length;
  if (avgLatency < 5000) score += 0.2;

  return Math.min(1, score);
}

// ============================================
// Trajectory Match Evaluator
// ============================================

async function trajectoryMatchEvaluator(
  _actual: unknown,
  _expected: unknown,
  config: Record<string, unknown>,
  context?: EvaluationContext
): Promise<EvaluatorResult> {
  const startTime = Date.now();
  const expectedPath = (config.expectedPath as string[]) || context?.expectedTrajectory || [];
  const strictOrder = config.strictOrder as boolean ?? true;
  const allowMissingSteps = config.allowMissingSteps as boolean ?? false;
  const maxExtraSteps = (config.maxExtraSteps as number) ?? 2;

  const actualPath = context?.trajectory || [];

  // Calculate match score
  const { score, missingSteps, extraSteps, matchedSteps } = calculateTrajectoryMatch(
    actualPath,
    expectedPath,
    strictOrder,
    allowMissingSteps,
    maxExtraSteps
  );

  const passed = score >= 0.8;

  return {
    evaluatorType: 'trajectory_match',
    evaluatorName: 'Trajectory Match',
    score,
    passed,
    details: {
      expected: expectedPath,
      actual: actualPath,
      diff: {
        missingSteps,
        extraSteps,
        matchedSteps,
      },
      breakdown: {
        matchedCount: matchedSteps.length,
        missingCount: missingSteps.length,
        extraCount: extraSteps.length,
      },
    },
    latencyMs: Date.now() - startTime,
  };
}

function calculateTrajectoryMatch(
  actual: string[],
  expected: string[],
  strictOrder: boolean,
  allowMissing: boolean,
  maxExtra: number
): {
  score: number;
  missingSteps: string[];
  extraSteps: string[];
  matchedSteps: string[];
} {
  const matchedSteps: string[] = [];
  const missingSteps: string[] = [];
  const extraSteps: string[] = [];

  if (strictOrder) {
    // Order-sensitive matching
    let actualIdx = 0;
    for (const expectedStep of expected) {
      let found = false;
      while (actualIdx < actual.length) {
        if (actual[actualIdx] === expectedStep) {
          matchedSteps.push(expectedStep);
          found = true;
          actualIdx++;
          break;
        }
        extraSteps.push(actual[actualIdx]);
        actualIdx++;
      }
      if (!found) {
        missingSteps.push(expectedStep);
      }
    }
    // Remaining actual steps are extra
    while (actualIdx < actual.length) {
      extraSteps.push(actual[actualIdx]);
      actualIdx++;
    }
  } else {
    // Order-insensitive matching
    const actualSet = new Set(actual);
    const expectedSet = new Set(expected);

    for (const step of expected) {
      if (actualSet.has(step)) {
        matchedSteps.push(step);
      } else {
        missingSteps.push(step);
      }
    }

    for (const step of actual) {
      if (!expectedSet.has(step)) {
        extraSteps.push(step);
      }
    }
  }

  // Calculate score
  let score = 0;
  if (expected.length > 0) {
    const matchRatio = matchedSteps.length / expected.length;
    score = matchRatio;

    // Penalty for missing steps (if not allowed)
    if (!allowMissing && missingSteps.length > 0) {
      score *= 1 - (missingSteps.length / expected.length) * 0.5;
    }

    // Penalty for extra steps (beyond threshold)
    if (extraSteps.length > maxExtra) {
      score *= 1 - ((extraSteps.length - maxExtra) * 0.1);
    }
  } else {
    score = actual.length === 0 ? 1 : (actual.length <= maxExtra ? 0.8 : 0.5);
  }

  return {
    score: Math.max(0, Math.min(1, score)),
    missingSteps,
    extraSteps,
    matchedSteps,
  };
}

// ============================================
// Run Evaluation Suite
// ============================================

export async function runEvaluation(
  dataPoint: DataPoint,
  actualOutput: Record<string, unknown>,
  actualTrajectory: string[],
  evaluators: EvaluatorConfig[],
  executionTrace?: ExecutionStep[]
): Promise<TestCaseResult> {
  const startTime = Date.now();
  const evaluatorResults: EvaluatorResult[] = [];

  const context: EvaluationContext = {
    input: dataPoint.input,
    trajectory: actualTrajectory,
    expectedTrajectory: dataPoint.expectedTrajectory,
    contextUsed: dataPoint.context,
    executionTrace,
  };

  for (const evaluator of evaluators) {
    const evalFn = getEvaluator(evaluator.type);
    const result = await evalFn(
      actualOutput,
      dataPoint.expectedOutput,
      evaluator.config,
      context
    );

    // Apply weight
    result.score *= evaluator.weight;
    evaluatorResults.push(result);
  }

  // Calculate aggregate score (weighted average)
  const totalWeight = evaluators.reduce((sum, e) => sum + e.weight, 0);
  const weightedSum = evaluatorResults.reduce((sum, r) => sum + r.score, 0);
  const aggregateScore = totalWeight > 0 ? weightedSum / totalWeight : 0;

  const allPassed = evaluatorResults.every(r => r.passed);

  return {
    dataPointId: dataPoint.id,
    input: dataPoint.input,
    actualOutput,
    actualTrajectory,
    evaluatorResults,
    aggregateScore,
    passed: allPassed && aggregateScore >= 0.7,
    executionTimeMs: Date.now() - startTime,
  };
}

// ============================================
// Calculate Summary Statistics
// ============================================

export function calculateSummary(results: TestCaseResult[]): EvaluationSummary {
  if (results.length === 0) {
    return {
      totalTests: 0,
      passed: 0,
      failed: 0,
      passRate: 0,
      averageScore: 0,
      scoreByEvaluator: {},
      averageLatencyMs: 0,
    };
  }

  const passed = results.filter(r => r.passed).length;
  const failed = results.length - passed;

  // Calculate score by evaluator
  const scoreByEvaluator: Record<string, { total: number; count: number }> = {};
  for (const result of results) {
    for (const evalResult of result.evaluatorResults) {
      const key = evalResult.evaluatorType;
      if (!scoreByEvaluator[key]) {
        scoreByEvaluator[key] = { total: 0, count: 0 };
      }
      scoreByEvaluator[key].total += evalResult.score;
      scoreByEvaluator[key].count++;
    }
  }

  const averageByEvaluator: Record<string, number> = {};
  for (const [key, { total, count }] of Object.entries(scoreByEvaluator)) {
    averageByEvaluator[key] = total / count;
  }

  // Calculate trajectory accuracy if applicable
  const trajectoryResults = results.filter(r => r.actualTrajectory.length > 0);
  const trajectoryAccuracy = trajectoryResults.length > 0
    ? trajectoryResults.filter(r =>
        r.evaluatorResults.some(e =>
          e.evaluatorType.includes('trajectory') && e.passed
        )
      ).length / trajectoryResults.length
    : undefined;

  return {
    totalTests: results.length,
    passed,
    failed,
    passRate: passed / results.length,
    averageScore: results.reduce((sum, r) => sum + r.aggregateScore, 0) / results.length,
    scoreByEvaluator: averageByEvaluator,
    averageLatencyMs: results.reduce((sum, r) => sum + r.executionTimeMs, 0) / results.length,
    trajectoryAccuracy,
  };
}
