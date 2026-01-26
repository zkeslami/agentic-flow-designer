import type { Node, Edge } from '@xyflow/react';

// Agentic Pattern Types based on the document
export type AgentPatternType =
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
  | 'output';

export interface NodeConfig {
  label: string;
  description: string;
  icon: string;
  color: string;
  category: 'triggers' | 'agentic' | 'actions' | 'control';
  defaultData: Record<string, unknown>;
  configSchema: ConfigField[];
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
