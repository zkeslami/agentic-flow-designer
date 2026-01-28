import type { Node, Edge } from '@xyflow/react';

// Agentic Pattern Types based on the document
export type AgentPatternType =
  // Core nodes
  | 'trigger'
  | 'retrieval'
  | 'toolUse'
  | 'planner'
  | 'extraction'
  | 'triage'
  | 'memory'
  | 'evaluation'
  | 'humanInLoop'
  | 'llm'
  | 'output'
  // Generic Agent node
  | 'agent'
  // Specialized Patterns (from Agentic Patterns doc)
  | 'deepRAG'
  | 'batchTransform'
  | 'textSummarization'
  | 'tabularReasoning'
  | 'documentProcessing'
  // Context Engineering nodes (from Future of Agent Building)
  | 'contextWrite'
  | 'contextSelect'
  | 'contextCompress'
  | 'contextIsolate'
  // Data Pipeline stages
  | 'dataIngestion'
  | 'dataAggregation'
  | 'rulesRouting'
  | 'synthesis'
  | 'contentCreation'
  | 'diagnosis'
  | 'feedback';

// Node categories - extended to support patterns
export type NodeCategory =
  | 'triggers'
  | 'agentic'
  | 'actions'
  | 'control'
  | 'patterns'      // Specialized patterns like DeepRAG, BatchTransform
  | 'context'       // Context engineering nodes
  | 'dataPipeline'; // Data transformation pipeline stages

export interface NodeConfig {
  label: string;
  description: string;
  icon: string;
  color: string;
  category: NodeCategory;
  defaultData: Record<string, unknown>;
  configSchema: ConfigField[];
  // Pattern-specific fields
  isPattern?: boolean;           // Whether this is a specialized pattern with custom UI
  patternCategory?: PatternCategory;
  hasSpecializedEditor?: boolean; // Opens dedicated editor when clicked
}

export interface ConfigField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'number' | 'boolean' | 'code' | 'json';
  options?: { label: string; value: string }[];
  placeholder?: string;
  defaultValue?: unknown;
  description?: string;
  advanced?: boolean;
}

export interface AgentNodeData extends Record<string, unknown> {
  type: AgentPatternType;
  label: string;
  config: Record<string, unknown>;
  hasCodeOverride?: boolean;
  codeOverride?: string;
  isValid?: boolean;
  validationErrors?: string[];
}

export type AgentNode = Node<AgentNodeData, 'agentNode'>;

export interface FlowState {
  nodes: AgentNode[];
  edges: Edge[];
  selectedNode: string | null;
  viewMode: 'visual' | 'code' | 'split';
}

// Code generation types
export interface GeneratedCode {
  python: string;
  json: string;
  canRoundTrip: boolean;
  warnings: string[];
}

// ============================================
// Bidirectional Sync Types (CGIS Architecture)
// ============================================

/**
 * Sync status between visual and code representations
 * Based on "Constrained Graph-Isomorphic Subset" architecture
 */
export type SyncStatus =
  | 'synced'           // Visual and code are in perfect sync
  | 'visual_ahead'     // Visual has changes not yet reflected in code
  | 'code_ahead'       // Code has changes not yet reflected in visual
  | 'conflict'         // Both have changes that conflict
  | 'code_only'        // Code too complex for visual representation (escape hatch)
  | 'parsing';         // Currently parsing/syncing

export interface SyncMetadata {
  status: SyncStatus;
  lastSyncedAt: string;
  lastVisualEdit: string | null;
  lastCodeEdit: string | null;
  pendingChanges: number;
  conflicts: SyncConflict[];
}

export interface SyncConflict {
  nodeId: string;
  type: 'identity_lost' | 'structure_invalid' | 'topology_dynamic';
  message: string;
  canAutoResolve: boolean;
}

/**
 * Visual metadata stored separately from logic (sidecar pattern)
 * Prevents layout changes from polluting code diffs
 */
export interface VisualMetadata {
  nodeId: string;
  position: { x: number; y: number };
  dimensions?: { width: number; height: number };
  collapsed?: boolean;
  color?: string;
  group?: string;
  zIndex?: number;
}

/**
 * Node identity persistence for refactoring resilience
 * The UUID survives renaming and remains the source of truth
 */
export interface NodeIdentity {
  uuid: string;           // Persistent identifier (survives refactoring)
  label: string;          // Human-readable name (can change)
  createdAt: string;
  lastModifiedAt: string;
  sourceOrigin: 'visual' | 'code' | 'import';
}

/**
 * Code constraint validation result
 * Used for guardrails in the "Visual-Safe" Python subset
 */
export interface CodeConstraint {
  rule: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  line?: number;
  canAutofix: boolean;
  autofixDescription?: string;
}

export type ConstraintRule =
  | 'top_level_only'      // Nodes must be top-level functions
  | 'static_topology'     // No dynamic edge creation
  | 'identity_required'   // @agent_node decorator required
  | 'valid_connections'   // Edges reference valid node IDs
  | 'no_circular_deps';   // Prevent circular dependencies

/**
 * Enhanced flow state with sync tracking
 */
export interface EnhancedFlowState extends FlowState {
  syncMetadata: SyncMetadata;
  visualMetadata: Record<string, VisualMetadata>;
  nodeIdentities: Record<string, NodeIdentity>;
  constraints: CodeConstraint[];
}

// ============================================
// Pattern Types (from Agentic Patterns doc)
// ============================================

/**
 * Pattern categories for specialized nodes
 */
export type PatternCategory =
  | 'research'        // DeepRAG, document processing
  | 'transformation'  // BatchTransform, tabular reasoning
  | 'summarization'   // Text summarization
  | 'orchestration';  // Multi-agent coordination

/**
 * DeepRAG Pattern Configuration
 * Research queries with citations, grounding sources, and evidence tracking
 */
export interface DeepRAGConfig {
  // Input
  queryType: 'single' | 'multi';
  queries: string[];
  groundingSources: GroundingSource[];
  scopeFilters: ScopeFilter[];
  // Citation settings
  citationMode: 'strict' | 'relaxed';
  evidenceThreshold: number;
  maxSources: number;
  // Synthesis
  synthesisInstructions: string;
  followUpEnabled: boolean;
}

export interface GroundingSource {
  id: string;
  type: 'index' | 'connector' | 'web';
  name: string;
  priority: number;
  trustLevel: 'high' | 'medium' | 'low';
}

export interface ScopeFilter {
  field: string;
  operator: 'equals' | 'contains' | 'range' | 'before' | 'after';
  value: string | number | [number, number];
}

/**
 * BatchTransform Pattern Configuration
 * Tabular data transformation with schema mapping and validation
 */
export interface BatchTransformConfig {
  // Input
  inputType: 'csv' | 'json' | 'api';
  inputSchema: SchemaColumn[];
  outputSchema: SchemaColumn[];
  // Processing
  batchSize: number;
  parallelism: number;
  groundingMode: 'web' | 'index' | 'none';
  // Validation
  validationRules: ValidationRule[];
  confidenceThreshold: number;
  routingRules: RoutingRule[];
}

export interface SchemaColumn {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
  required: boolean;
  description?: string;
  semanticLabel?: string;
  isKey?: boolean;
}

export interface ValidationRule {
  column: string;
  rule: 'required' | 'format' | 'range' | 'enum' | 'custom';
  params: Record<string, unknown>;
  errorMessage: string;
}

export interface RoutingRule {
  condition: 'confidence_below' | 'validation_failed' | 'custom';
  threshold?: number;
  action: 'auto_approve' | 'hitl_review' | 'reject';
  justificationRequired: boolean;
}

/**
 * Agent Node Configuration
 * Generic autonomous agent with tools and memory
 */
export interface AgentConfig {
  // Identity
  name: string;
  role: string;
  goal: string;
  // Capabilities
  model: string;
  temperature: number;
  tools: AgentTool[];
  // Memory & Context
  memoryType: 'none' | 'conversation' | 'episodic' | 'semantic';
  contextWindow: number;
  // Behavior
  reasoningMode: 'react' | 'cot' | 'reflexion';
  maxIterations: number;
  confidenceThreshold: number;
  // Human-in-the-loop
  hitlMode: 'never' | 'on_low_confidence' | 'on_destructive' | 'always';
  approvalTimeout: number;
}

export interface AgentTool {
  id: string;
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  requiresApproval: boolean;
}

/**
 * Context Engineering Node Types (from Future of Agent Building)
 */
export interface ContextWriteConfig {
  targetStore: 'scratchpad' | 'episodic' | 'procedural' | 'semantic';
  key: string;
  ttl?: number;
  overwritePolicy: 'always' | 'if_empty' | 'append';
}

export interface ContextSelectConfig {
  sourceType: 'rag' | 'memory' | 'rules_file' | 'tool_results';
  query: string;
  maxResults: number;
  relevanceThreshold: number;
  includeMetadata: boolean;
}

export interface ContextCompressConfig {
  strategy: 'summarize' | 'trim' | 'selective';
  targetTokens: number;
  preservePriority: string[]; // Keys/sections to preserve
  triggerThreshold: number;  // % of context window
}

export interface ContextIsolateConfig {
  isolationMode: 'full' | 'shared_read' | 'shared_write';
  sharedKeys: string[];
  propagateResults: boolean;
}

/**
 * Human-in-the-Loop patterns (from Future of Agent Building)
 */
export type HITLPattern =
  | 'approval_gate'      // Pause for approve/reject
  | 'editing_workflow'   // Human modifies parameters
  | 'confidence_routing' // Route to human below threshold
  | 'return_of_control'; // Full parameter editing

export interface HITLConfig {
  pattern: HITLPattern;
  trigger: 'always' | 'on_condition' | 'on_error';
  condition?: string;
  timeout: number;
  escalationPath?: string;
  notificationChannel?: 'slack' | 'email' | 'action_center';
}
