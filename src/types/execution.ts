// Execution Types for Flow Testing and Tracing
// Supports input/output arguments, test execution, and trace visualization

// ============================================
// Flow Arguments
// ============================================

export type ArgumentType = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'any';

export interface FlowArgument {
  id: string;
  name: string;
  type: ArgumentType;
  description?: string;
  required: boolean;
  defaultValue?: unknown;
  schema?: Record<string, unknown>; // JSON Schema for object/array types
  examples?: unknown[];
}

export interface FlowArgumentsConfig {
  inputs: FlowArgument[];
  outputs: FlowArgument[];
}

export interface NodeArgumentsConfig {
  nodeId: string;
  inputs: FlowArgument[];
  outputs: FlowArgument[];
}

// ============================================
// Test Input
// ============================================

export interface TestInput {
  id: string;
  name: string;
  values: Record<string, unknown>;
  createdAt: string;
  source: 'manual' | 'generated' | 'captured';
}

export interface GenerateTestInputConfig {
  flowDescription: string;
  arguments: FlowArgument[];
  count: number;
  includeEdgeCases: boolean;
}

// ============================================
// Execution Types
// ============================================

export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface ExecutionRun {
  id: string;
  name: string;
  status: ExecutionStatus;
  startedAt: string;
  completedAt?: string;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
  traces: ExecutionTrace[];
  summary: ExecutionSummary;
}

export interface ExecutionSummary {
  totalNodes: number;
  completedNodes: number;
  failedNodes: number;
  totalDurationMs: number;
  tokensUsed?: number;
  cost?: number;
}

// ============================================
// Execution Trace (per node/step)
// ============================================

export interface ExecutionTrace {
  id: string;
  nodeId: string;
  nodeName: string;
  nodeType: string;
  status: ExecutionStatus;
  startedAt: string;
  completedAt?: string;
  durationMs: number;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;

  // LLM-specific fields
  llmExplanation?: string; // What the node is doing
  reasoning?: string; // LLM reasoning/thinking
  toolCalls?: ToolCallTrace[];

  // Metadata
  metadata: TraceMetadata;

  // Child traces (for nested calls)
  children?: ExecutionTrace[];
}

export interface ToolCallTrace {
  id: string;
  toolName: string;
  toolInput: Record<string, unknown>;
  toolOutput?: unknown;
  status: ExecutionStatus;
  durationMs: number;
  error?: string;
}

export interface TraceMetadata {
  model?: string;
  temperature?: number;
  tokensInput?: number;
  tokensOutput?: number;
  tokensTotal?: number;
  cost?: number;
  latencyMs?: number;
  retryCount?: number;
  cacheHit?: boolean;
}

// ============================================
// Trace View Configuration
// ============================================

export type TraceViewMode = 'waterfall' | 'span';

export interface TraceViewConfig {
  mode: TraceViewMode;
  showMetadata: boolean;
  showInput: boolean;
  showOutput: boolean;
  showExplanation: boolean;
  expandedTraceIds: string[];
  timeScale: 'auto' | 'fixed';
}

// ============================================
// Execution Panel State
// ============================================

export interface ExecutionPanelState {
  isOpen: boolean;
  height: number; // Panel height in pixels
  activeRunId: string | null;
  viewConfig: TraceViewConfig;
}

// ============================================
// Default Values
// ============================================

export const DEFAULT_FLOW_ARGUMENTS: FlowArgumentsConfig = {
  inputs: [
    {
      id: 'query',
      name: 'query',
      type: 'string',
      description: 'The input query or message',
      required: true,
      examples: ['Hello, how can you help me?'],
    },
  ],
  outputs: [
    {
      id: 'response',
      name: 'response',
      type: 'string',
      description: 'The output response',
      required: true,
    },
  ],
};

export const DEFAULT_TRACE_VIEW_CONFIG: TraceViewConfig = {
  mode: 'waterfall',
  showMetadata: true,
  showInput: true,
  showOutput: true,
  showExplanation: true,
  expandedTraceIds: [],
  timeScale: 'auto',
};

// ============================================
// Helper Functions
// ============================================

export function generateTestInputFromSchema(args: FlowArgument[]): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const arg of args) {
    if (arg.defaultValue !== undefined) {
      result[arg.name] = arg.defaultValue;
    } else if (arg.examples && arg.examples.length > 0) {
      result[arg.name] = arg.examples[0];
    } else {
      // Generate based on type
      switch (arg.type) {
        case 'string':
          result[arg.name] = `Sample ${arg.name}`;
          break;
        case 'number':
          result[arg.name] = 0;
          break;
        case 'boolean':
          result[arg.name] = false;
          break;
        case 'object':
          result[arg.name] = {};
          break;
        case 'array':
          result[arg.name] = [];
          break;
        default:
          result[arg.name] = null;
      }
    }
  }

  return result;
}

export function createExecutionTrace(
  nodeId: string,
  nodeName: string,
  nodeType: string,
  input: Record<string, unknown>
): ExecutionTrace {
  return {
    id: `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    nodeId,
    nodeName,
    nodeType,
    status: 'pending',
    startedAt: new Date().toISOString(),
    durationMs: 0,
    input,
    metadata: {},
  };
}
