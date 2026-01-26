// Dataset Management Utilities
// Handles dataset creation, import, export, and storage

import type { Dataset, DataPoint, EvaluationRun } from '../types/evaluation';

// ============================================
// Storage Keys
// ============================================

const STORAGE_KEYS = {
  DATASETS: 'afd_datasets',
  EVALUATION_RUNS: 'afd_evaluation_runs',
  ONLINE_CONFIGS: 'afd_online_configs',
};

// ============================================
// Dataset Management
// ============================================

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function createDataset(
  name: string,
  description?: string,
  source: Dataset['source'] = 'manual'
): Dataset {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    name,
    description,
    dataPoints: [],
    createdAt: now,
    updatedAt: now,
    source,
  };
}

export function createDataPoint(
  input: Record<string, unknown>,
  expectedOutput?: Record<string, unknown>,
  expectedTrajectory?: string[],
  context?: string,
  source: 'import' | 'test_run' | 'generated' | 'manual' = 'manual'
): DataPoint {
  return {
    id: generateId(),
    input,
    expectedOutput,
    expectedTrajectory,
    context,
    metadata: {
      source,
      createdAt: new Date().toISOString(),
    },
  };
}

// ============================================
// Local Storage Operations
// ============================================

export function saveDatasets(datasets: Dataset[]): void {
  localStorage.setItem(STORAGE_KEYS.DATASETS, JSON.stringify(datasets));
}

export function loadDatasets(): Dataset[] {
  const stored = localStorage.getItem(STORAGE_KEYS.DATASETS);
  return stored ? JSON.parse(stored) : [];
}

export function saveDataset(dataset: Dataset): void {
  const datasets = loadDatasets();
  const index = datasets.findIndex(d => d.id === dataset.id);
  if (index >= 0) {
    datasets[index] = { ...dataset, updatedAt: new Date().toISOString() };
  } else {
    datasets.push(dataset);
  }
  saveDatasets(datasets);
}

export function deleteDataset(datasetId: string): void {
  const datasets = loadDatasets().filter(d => d.id !== datasetId);
  saveDatasets(datasets);
}

export function getDataset(datasetId: string): Dataset | undefined {
  return loadDatasets().find(d => d.id === datasetId);
}

// ============================================
// Evaluation Run Storage
// ============================================

export function saveEvaluationRuns(runs: EvaluationRun[]): void {
  localStorage.setItem(STORAGE_KEYS.EVALUATION_RUNS, JSON.stringify(runs));
}

export function loadEvaluationRuns(): EvaluationRun[] {
  const stored = localStorage.getItem(STORAGE_KEYS.EVALUATION_RUNS);
  return stored ? JSON.parse(stored) : [];
}

export function saveEvaluationRun(run: EvaluationRun): void {
  const runs = loadEvaluationRuns();
  const index = runs.findIndex(r => r.id === run.id);
  if (index >= 0) {
    runs[index] = run;
  } else {
    runs.unshift(run); // Add to beginning (most recent first)
  }
  // Keep only last 50 runs
  saveEvaluationRuns(runs.slice(0, 50));
}

export function getEvaluationRun(runId: string): EvaluationRun | undefined {
  return loadEvaluationRuns().find(r => r.id === runId);
}

// ============================================
// Import Functions
// ============================================

export interface ImportResult {
  success: boolean;
  dataPoints: DataPoint[];
  errors: string[];
  warnings: string[];
}

export function parseCSV(csvContent: string): ImportResult {
  const lines = csvContent.trim().split('\n');
  const dataPoints: DataPoint[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  if (lines.length < 2) {
    return { success: false, dataPoints: [], errors: ['CSV must have header row and at least one data row'], warnings: [] };
  }

  // Parse header
  const header = parseCSVLine(lines[0]);
  const inputIndex = header.findIndex(h => h.toLowerCase() === 'input');
  const expectedOutputIndex = header.findIndex(h => h.toLowerCase() === 'expected_output' || h.toLowerCase() === 'expectedoutput');
  const trajectoryIndex = header.findIndex(h => h.toLowerCase() === 'expected_trajectory' || h.toLowerCase() === 'trajectory');
  const contextIndex = header.findIndex(h => h.toLowerCase() === 'context');

  if (inputIndex === -1) {
    return { success: false, dataPoints: [], errors: ['CSV must have an "input" column'], warnings: [] };
  }

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    try {
      const values = parseCSVLine(lines[i]);
      if (values.length === 0 || (values.length === 1 && !values[0])) continue;

      const input = parseJSONOrString(values[inputIndex] || '{}');
      const expectedOutput = expectedOutputIndex >= 0 ? parseJSONOrString(values[expectedOutputIndex]) : undefined;
      const trajectory = trajectoryIndex >= 0 && values[trajectoryIndex]
        ? values[trajectoryIndex].split(',').map(s => s.trim())
        : undefined;
      const context = contextIndex >= 0 ? values[contextIndex] : undefined;

      dataPoints.push(createDataPoint(
        typeof input === 'object' ? input as Record<string, unknown> : { value: input },
        expectedOutput ? (typeof expectedOutput === 'object' ? expectedOutput as Record<string, unknown> : { value: expectedOutput }) : undefined,
        trajectory,
        context,
        'import'
      ));
    } catch (e) {
      errors.push(`Row ${i + 1}: ${(e as Error).message}`);
    }
  }

  if (dataPoints.length === 0 && errors.length > 0) {
    return { success: false, dataPoints: [], errors, warnings };
  }

  return { success: true, dataPoints, errors, warnings };
}

export function parseJSON(jsonContent: string): ImportResult {
  const dataPoints: DataPoint[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const parsed = JSON.parse(jsonContent);
    const items = Array.isArray(parsed) ? parsed : (parsed.dataPoints || parsed.data || [parsed]);

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      try {
        const input = item.input || item.query || item;
        const expectedOutput = item.expected_output || item.expectedOutput || item.expected || item.output;
        const trajectory = item.expected_trajectory || item.expectedTrajectory || item.trajectory;
        const context = item.context;

        dataPoints.push(createDataPoint(
          typeof input === 'object' ? input : { value: input },
          expectedOutput ? (typeof expectedOutput === 'object' ? expectedOutput : { value: expectedOutput }) : undefined,
          Array.isArray(trajectory) ? trajectory : undefined,
          context,
          'import'
        ));
      } catch (e) {
        errors.push(`Item ${i + 1}: ${(e as Error).message}`);
      }
    }
  } catch (e) {
    return { success: false, dataPoints: [], errors: [`Invalid JSON: ${(e as Error).message}`], warnings };
  }

  return { success: dataPoints.length > 0, dataPoints, errors, warnings };
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

function parseJSONOrString(value: string): unknown {
  if (!value) return undefined;
  const trimmed = value.trim();

  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) ||
      (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return trimmed;
    }
  }

  return trimmed;
}

// ============================================
// Export Functions
// ============================================

export function exportToCSV(dataset: Dataset): string {
  const headers = ['input', 'expected_output', 'expected_trajectory', 'context'];
  const rows = [headers.join(',')];

  for (const dp of dataset.dataPoints) {
    const row = [
      JSON.stringify(dp.input),
      dp.expectedOutput ? JSON.stringify(dp.expectedOutput) : '',
      dp.expectedTrajectory ? dp.expectedTrajectory.join(',') : '',
      dp.context || '',
    ].map(v => `"${v.replace(/"/g, '""')}"`);
    rows.push(row.join(','));
  }

  return rows.join('\n');
}

export function exportToJSON(dataset: Dataset): string {
  return JSON.stringify({
    name: dataset.name,
    description: dataset.description,
    exportedAt: new Date().toISOString(),
    dataPoints: dataset.dataPoints.map(dp => ({
      input: dp.input,
      expected_output: dp.expectedOutput,
      expected_trajectory: dp.expectedTrajectory,
      context: dp.context,
    })),
  }, null, 2);
}

// ============================================
// AI-Generated Test Cases
// ============================================

export interface GenerationConfig {
  flowDescription: string;
  nodeTypes: string[];
  sampleInput?: Record<string, unknown>;
  count: number;
  includeEdgeCases: boolean;
  includeNegativeCases: boolean;
}

export function generateTestCases(config: GenerationConfig): DataPoint[] {
  const dataPoints: DataPoint[] = [];
  const { count, includeEdgeCases, includeNegativeCases, sampleInput, nodeTypes } = config;

  // Generate standard test cases
  const standardCount = Math.ceil(count * 0.6);
  for (let i = 0; i < standardCount; i++) {
    dataPoints.push(createDataPoint(
      generateVariation(sampleInput || { query: 'Sample query' }, i),
      { response: `Expected response for variation ${i + 1}` },
      nodeTypes.length > 0 ? generateExpectedTrajectory(nodeTypes) : undefined,
      undefined,
      'generated'
    ));
  }

  // Generate edge cases
  if (includeEdgeCases) {
    const edgeCaseCount = Math.ceil(count * 0.25);
    const edgeCases = [
      { input: { query: '' }, description: 'Empty input' },
      { input: { query: 'a'.repeat(10000) }, description: 'Very long input' },
      { input: { query: '!@#$%^&*()' }, description: 'Special characters' },
      { input: { query: '   \n\t   ' }, description: 'Whitespace only' },
      { input: { query: '{"nested": {"deep": {"value": true}}}' }, description: 'JSON-like string' },
    ];

    for (let i = 0; i < Math.min(edgeCaseCount, edgeCases.length); i++) {
      dataPoints.push(createDataPoint(
        edgeCases[i].input,
        { response: `Edge case response: ${edgeCases[i].description}`, isEdgeCase: true },
        undefined,
        undefined,
        'generated'
      ));
    }
  }

  // Generate negative cases
  if (includeNegativeCases) {
    const negativeCount = Math.ceil(count * 0.15);
    const negativeCases = [
      { input: { query: 'DROP TABLE users;' }, description: 'SQL injection attempt' },
      { input: { query: '<script>alert("xss")</script>' }, description: 'XSS attempt' },
      { input: { invalidField: 'wrong schema' }, description: 'Invalid schema' },
    ];

    for (let i = 0; i < Math.min(negativeCount, negativeCases.length); i++) {
      dataPoints.push(createDataPoint(
        negativeCases[i].input,
        { error: `Should handle: ${negativeCases[i].description}`, isNegativeCase: true },
        undefined,
        undefined,
        'generated'
      ));
    }
  }

  return dataPoints;
}

function generateVariation(baseInput: Record<string, unknown>, index: number): Record<string, unknown> {
  const variations = [
    (input: Record<string, unknown>) => ({ ...input, variation: 'standard' }),
    (input: Record<string, unknown>) => ({ ...input, query: `Modified: ${input.query || ''}` }),
    (input: Record<string, unknown>) => ({ ...input, priority: 'high' }),
    (input: Record<string, unknown>) => ({ ...input, context: 'additional context' }),
    (input: Record<string, unknown>) => ({ ...input, format: 'json' }),
  ];

  return variations[index % variations.length](baseInput);
}

function generateExpectedTrajectory(nodeTypes: string[]): string[] {
  // Generate a plausible trajectory based on node types
  const trajectory: string[] = [];

  // Start with trigger if present
  if (nodeTypes.includes('trigger')) {
    trajectory.push('trigger-1');
  }

  // Add retrieval if present
  if (nodeTypes.includes('retrieval')) {
    trajectory.push('retrieval-1');
  }

  // Add LLM processing
  if (nodeTypes.includes('llm')) {
    trajectory.push('llm-1');
  }

  // Add output
  if (nodeTypes.includes('output')) {
    trajectory.push('output-1');
  }

  return trajectory;
}

// ============================================
// Dataset Validation
// ============================================

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateDataset(dataset: Dataset): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!dataset.name || dataset.name.trim().length === 0) {
    errors.push('Dataset name is required');
  }

  if (dataset.dataPoints.length === 0) {
    errors.push('Dataset must have at least one data point');
  }

  for (let i = 0; i < dataset.dataPoints.length; i++) {
    const dp = dataset.dataPoints[i];

    if (!dp.input || Object.keys(dp.input).length === 0) {
      errors.push(`Data point ${i + 1}: Input is required`);
    }

    if (!dp.expectedOutput && !dp.expectedTrajectory) {
      warnings.push(`Data point ${i + 1}: No expected output or trajectory defined`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================
// Capture from Test Run
// ============================================

export interface TestRunCapture {
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  trajectory: string[];
  timestamp: string;
}

export function captureFromTestRun(
  dataset: Dataset,
  capture: TestRunCapture
): Dataset {
  const newDataPoint = createDataPoint(
    capture.input,
    capture.output,
    capture.trajectory,
    undefined,
    'test_run'
  );

  return {
    ...dataset,
    dataPoints: [...dataset.dataPoints, newDataPoint],
    updatedAt: new Date().toISOString(),
  };
}
