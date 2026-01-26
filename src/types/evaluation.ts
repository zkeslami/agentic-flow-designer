// Evaluation Types for Agentic Flow Designer
// Supports offline and online evaluation modes with multiple evaluator types

// Note: AgentNode and Edge types are used when integrating with the flow
// They are commented out here to avoid unused import warnings

// ============================================
// Core Evaluation Types
// ============================================

export type EvaluationMode = 'offline' | 'online';

export type EvaluationScope = 'node' | 'subgraph' | 'flow';

export type EvaluatorType =
  | 'exact_match'
  | 'contains'
  | 'json_similarity'
  | 'context_precision'
  | 'llm_judge_output'
  | 'llm_judge_trajectory'
  | 'trajectory_match';

export type EvaluationStatus = 'pending' | 'running' | 'completed' | 'failed';

export type TriggerType =
  | 'manual'
  | 'on_run_complete'
  | 'on_node_execute'
  | 'scheduled'
  | 'on_error'
  | 'on_threshold_breach';

// ============================================
// Evaluator Configurations
// ============================================

export interface EvaluatorConfig {
  type: EvaluatorType;
  name: string;
  description: string;
  weight: number; // 0-1, for weighted scoring
  config: Record<string, unknown>;
}

export interface ExactMatchConfig extends EvaluatorConfig {
  type: 'exact_match';
  config: {
    caseSensitive: boolean;
    trimWhitespace: boolean;
  };
}

export interface ContainsConfig extends EvaluatorConfig {
  type: 'contains';
  config: {
    keywords: string[];
    matchAll: boolean;
    caseSensitive: boolean;
  };
}

export interface JsonSimilarityConfig extends EvaluatorConfig {
  type: 'json_similarity';
  config: {
    threshold: number; // 0-1
    ignoreFields: string[];
    strictTypeMatching: boolean;
  };
}

export interface ContextPrecisionConfig extends EvaluatorConfig {
  type: 'context_precision';
  config: {
    threshold: number; // 0-1
    relevanceWeight: number;
    coverageWeight: number;
  };
}

export interface LLMJudgeOutputConfig extends EvaluatorConfig {
  type: 'llm_judge_output';
  config: {
    model: string;
    criteria: string[];
    rubric?: string;
    scoreScale: number; // e.g., 5 for 1-5 scale
  };
}

export interface LLMJudgeTrajectoryConfig extends EvaluatorConfig {
  type: 'llm_judge_trajectory';
  config: {
    model: string;
    expectedSteps?: string[];
    allowExtraSteps: boolean;
    evaluateReasoning: boolean;
  };
}

export interface TrajectoryMatchConfig extends EvaluatorConfig {
  type: 'trajectory_match';
  config: {
    expectedPath: string[]; // node IDs in expected order
    strictOrder: boolean;
    allowMissingSteps: boolean;
    maxExtraSteps: number;
  };
}

// ============================================
// Dataset Types
// ============================================

export interface DataPoint {
  id: string;
  input: Record<string, unknown>;
  expectedOutput?: Record<string, unknown>;
  expectedTrajectory?: string[]; // Expected node execution path
  context?: string; // For context precision evaluation
  metadata?: {
    source: 'import' | 'test_run' | 'generated' | 'manual';
    createdAt: string;
    tags?: string[];
  };
}

export interface Dataset {
  id: string;
  name: string;
  description?: string;
  dataPoints: DataPoint[];
  createdAt: string;
  updatedAt: string;
  source: 'import' | 'test_run' | 'generated' | 'manual';
  schema?: {
    inputSchema: Record<string, string>;
    outputSchema: Record<string, string>;
  };
}

// ============================================
// Evaluation Configuration
// ============================================

export interface EvaluationTarget {
  scope: EvaluationScope;
  nodeIds?: string[]; // For node or subgraph scope
  startNodeId?: string; // For subgraph scope
  endNodeId?: string; // For subgraph scope
}

export interface OfflineEvaluationConfig {
  mode: 'offline';
  datasetId: string;
  evaluators: EvaluatorConfig[];
  target: EvaluationTarget;
  runCount?: number; // Number of times to run each test case
}

export interface OnlineEvaluationConfig {
  mode: 'online';
  trigger: OnlineTrigger;
  evaluators: EvaluatorConfig[];
  target: EvaluationTarget;
  baselineDatasetId?: string; // For drift detection
  alertThresholds?: {
    minScore: number;
    maxLatency: number;
    maxErrorRate: number;
  };
}

export interface OnlineTrigger {
  type: TriggerType;
  config: {
    // For scheduled triggers
    schedule?: {
      startDate?: string;
      endDate?: string;
      interval?: 'hourly' | 'daily' | 'weekly';
      time?: string;
    };
    // For event triggers
    events?: {
      onEveryRun?: boolean;
      onSpecificNodes?: string[];
      onToolCall?: string[];
      onError?: boolean;
    };
    // Sampling for high-volume
    sampleRate?: number; // 0-1, e.g., 0.1 = 10% of runs
  };
}

// ============================================
// Evaluation Results
// ============================================

export interface EvaluatorResult {
  evaluatorType: EvaluatorType;
  evaluatorName: string;
  score: number; // 0-1
  passed: boolean;
  details: {
    expected?: unknown;
    actual?: unknown;
    diff?: unknown;
    reasoning?: string; // For LLM judge
    breakdown?: Record<string, number>; // Sub-scores
  };
  latencyMs: number;
}

export interface TestCaseResult {
  dataPointId: string;
  input: Record<string, unknown>;
  actualOutput: Record<string, unknown>;
  actualTrajectory: string[];
  evaluatorResults: EvaluatorResult[];
  aggregateScore: number;
  passed: boolean;
  executionTimeMs: number;
  error?: string;
}

export interface EvaluationRun {
  id: string;
  name: string;
  mode: EvaluationMode;
  status: EvaluationStatus;
  config: OfflineEvaluationConfig | OnlineEvaluationConfig;
  startedAt: string;
  completedAt?: string;
  results: TestCaseResult[];
  summary: EvaluationSummary;
  flowVersion?: string; // For versioning
}

export interface EvaluationSummary {
  totalTests: number;
  passed: number;
  failed: number;
  passRate: number;
  averageScore: number;
  scoreByEvaluator: Record<string, number>;
  averageLatencyMs: number;
  trajectoryAccuracy?: number;
  regressionDetected?: boolean;
  driftScore?: number; // Compared to baseline
}

// ============================================
// Comparison Types (for run comparison)
// ============================================

export interface RunComparison {
  currentRunId: string;
  baselineRunId: string;
  scoreDelta: number;
  passRateDelta: number;
  latencyDelta: number;
  regressions: TestCaseRegression[];
  improvements: TestCaseImprovement[];
}

export interface TestCaseRegression {
  dataPointId: string;
  previousScore: number;
  currentScore: number;
  delta: number;
  affectedEvaluators: string[];
}

export interface TestCaseImprovement {
  dataPointId: string;
  previousScore: number;
  currentScore: number;
  delta: number;
  improvedEvaluators: string[];
}

// ============================================
// UI State Types
// ============================================

export interface EvaluationPanelState {
  activeTab: 'datasets' | 'configure' | 'results' | 'online';
  selectedDatasetId: string | null;
  selectedRunId: string | null;
  selectedNodeIds: string[]; // For subgraph selection
  isRunning: boolean;
  currentConfig: Partial<OfflineEvaluationConfig | OnlineEvaluationConfig>;
}

// ============================================
// Default Evaluator Configs
// ============================================

export const DEFAULT_EVALUATORS: Record<EvaluatorType, Omit<EvaluatorConfig, 'type'>> = {
  exact_match: {
    name: 'Exact Match',
    description: 'Checks if output exactly matches expected value',
    weight: 1,
    config: { caseSensitive: false, trimWhitespace: true },
  },
  contains: {
    name: 'Contains Keywords',
    description: 'Checks if output contains specified keywords',
    weight: 0.8,
    config: { keywords: [], matchAll: false, caseSensitive: false },
  },
  json_similarity: {
    name: 'JSON Similarity',
    description: 'Compares JSON structure and values with threshold',
    weight: 1,
    config: { threshold: 0.9, ignoreFields: [], strictTypeMatching: false },
  },
  context_precision: {
    name: 'Context Precision',
    description: 'Evaluates how precisely context was used in response',
    weight: 1,
    config: { threshold: 0.8, relevanceWeight: 0.6, coverageWeight: 0.4 },
  },
  llm_judge_output: {
    name: 'LLM Judge (Output)',
    description: 'Uses LLM to judge output quality against criteria',
    weight: 1,
    config: { model: 'gpt-4', criteria: ['accuracy', 'relevance', 'completeness'], scoreScale: 5 },
  },
  llm_judge_trajectory: {
    name: 'LLM Judge (Trajectory)',
    description: 'Uses LLM to evaluate execution path and reasoning',
    weight: 1,
    config: { model: 'gpt-4', allowExtraSteps: true, evaluateReasoning: true },
  },
  trajectory_match: {
    name: 'Trajectory Match',
    description: 'Compares actual execution path to expected path',
    weight: 1,
    config: { expectedPath: [], strictOrder: true, allowMissingSteps: false, maxExtraSteps: 2 },
  },
};
