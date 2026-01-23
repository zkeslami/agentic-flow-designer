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
