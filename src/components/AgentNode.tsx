import { memo, useState, useCallback } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import {
  Zap,
  Search,
  Wrench,
  GitBranch,
  FileText,
  Mail,
  Brain,
  FlaskConical,
  UserCheck,
  Sparkles,
  ArrowRightCircle,
  AlertTriangle,
  Code,
  Bot,
  BookOpen,
  Table,
  Grid3X3,
  Files,
  PenLine,
  MousePointer2,
  Minimize2,
  Split,
  Download,
  Layers,
  FileEdit,
  Stethoscope,
  MessageCircle,
  Puzzle,
  Trash2,
  Copy,
  MoreHorizontal,
  Plus,
  ChevronDown,
  type LucideProps,
} from 'lucide-react';
import type { AgentNodeData, AgentPatternType, AgentNode, AgentTool } from '../types';
import { nodeConfigs } from '../utils/nodeConfig';

const iconMap: Record<string, React.FC<LucideProps>> = {
  Zap,
  Search,
  Wrench,
  GitBranch,
  FileText,
  Mail,
  Brain,
  FlaskConical,
  UserCheck,
  Sparkles,
  ArrowRightCircle,
  Bot,
  BookOpen,
  Table,
  Grid3x3: Grid3X3,
  Files,
  PenLine,
  MousePointer2,
  Minimize2,
  Split,
  Download,
  Layers,
  FileEdit,
  Stethoscope,
  MessageCircle,
};

// Connection point configuration for Agent nodes
interface ConnectionPoint {
  id: string;
  label: string;
  position: 'top-left' | 'top-center' | 'bottom-left' | 'bottom-center' | 'right';
  color: string;
}

const AGENT_CONNECTION_POINTS: ConnectionPoint[] = [
  { id: 'memory', label: 'Memory', position: 'top-left', color: '#a78bfa' },
  { id: 'escalation', label: 'Escalation', position: 'top-center', color: '#f472b6' },
  { id: 'context', label: 'Context', position: 'bottom-left', color: '#60a5fa' },
  { id: 'tools', label: 'Tools', position: 'bottom-center', color: '#34d399' },
  { id: 'error', label: 'Error', position: 'right', color: '#f87171' },
];

function AgentNodeComponent({ data, selected }: NodeProps<AgentNode>) {
  const [isHovered, setIsHovered] = useState(false);
  const [showToolDropdown, setShowToolDropdown] = useState(false);
  const nodeData = data as AgentNodeData;
  const config = nodeConfigs[nodeData.type as AgentPatternType];
  const IconComponent = iconMap[config?.icon] || Zap;
  const isPatternNode = config?.isPattern;
  const isContextNode = config?.category === 'context';
  const isDataPipelineNode = config?.category === 'dataPipeline';

  // Special rendering for Agent nodes (matching the reference image)
  const isAgentNode = nodeData.type === 'agent';

  const handleAddTool = useCallback(() => {
    setShowToolDropdown(!showToolDropdown);
  }, [showToolDropdown]);

  // Agent Node - Special Design
  if (isAgentNode) {
    const tools: AgentTool[] = (nodeData.config?.tools as AgentTool[]) || [];

    return (
      <div
        className={`
          relative rounded-xl transition-all duration-200
          ${selected ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-[#11111b]' : ''}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setShowToolDropdown(false);
        }}
      >
        {/* Action buttons - shown on hover */}
        {isHovered && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-1 bg-[#1e1e2e] border border-[#313244] rounded-lg shadow-lg z-10">
            <button className="p-1.5 hover:bg-[#313244] rounded transition-colors" title="Delete">
              <Trash2 className="w-4 h-4 text-[#6c7086] hover:text-red-400" />
            </button>
            <button className="p-1.5 hover:bg-[#313244] rounded transition-colors" title="Duplicate">
              <Copy className="w-4 h-4 text-[#6c7086] hover:text-[#cdd6f4]" />
            </button>
            <button className="p-1.5 hover:bg-[#313244] rounded transition-colors" title="More">
              <MoreHorizontal className="w-4 h-4 text-[#6c7086]" />
            </button>
          </div>
        )}

        {/* Connection points with labels - Top */}
        <div className="absolute -top-7 left-0 right-0 flex justify-around px-8">
          {AGENT_CONNECTION_POINTS.filter(p => p.position.startsWith('top')).map((point) => (
            <div key={point.id} className="flex flex-col items-center">
              <span className="text-[9px] text-[#6c7086] font-medium mb-1 flex items-center gap-1">
                {point.label}
              </span>
              <div className="relative">
                <Handle
                  id={point.id}
                  type="target"
                  position={Position.Top}
                  className="!relative !transform-none !w-3 !h-3 !bg-transparent !border-0"
                />
                <div
                  className="absolute inset-0 w-3 h-3 rotate-45 border-2"
                  style={{ backgroundColor: `${point.color}30`, borderColor: point.color }}
                />
              </div>
              {/* Plus button */}
              <button className="mt-1 w-3 h-3 bg-[#313244] hover:bg-blue-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Plus className="w-2 h-2 text-[#6c7086]" />
              </button>
            </div>
          ))}
        </div>

        {/* Main node container */}
        <div className="flex bg-[#1e1e2e] border-2 border-blue-500/50 rounded-xl overflow-hidden min-w-[220px] shadow-lg group">
          {/* Gradient left border / icon area */}
          <div className="w-14 bg-gradient-to-b from-purple-500/20 to-pink-500/20 flex items-center justify-center border-r border-[#313244]">
            <div className="w-9 h-9 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center shadow-md">
              <Bot className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* Content area */}
          <div className="flex-1 py-2 px-3">
            <h3 className="text-[#cdd6f4] font-semibold text-sm">
              {nodeData.label || 'Agent'}
            </h3>

            {/* Tool list */}
            {tools.length > 0 && (
              <div className="mt-1.5 space-y-1">
                {tools.slice(0, 2).map((tool) => (
                  <div
                    key={tool.id}
                    className="flex items-center gap-1.5 px-1.5 py-0.5 bg-[#11111b] rounded text-[10px]"
                  >
                    <Wrench className="w-2.5 h-2.5 text-emerald-400" />
                    <span className="text-[#a6adc8] truncate">{tool.name}</span>
                  </div>
                ))}
                {tools.length > 2 && (
                  <span className="text-[10px] text-[#6c7086]">+{tools.length - 2} more</span>
                )}
              </div>
            )}

            {/* Add tool button */}
            <button
              onClick={handleAddTool}
              className="mt-1.5 flex items-center gap-1 px-1.5 py-0.5 text-[10px] text-[#6c7086] hover:text-[#cdd6f4] hover:bg-[#313244] rounded transition-colors w-full"
            >
              <Plus className="w-2.5 h-2.5" />
              <span>Add Tool</span>
              <ChevronDown className="w-2.5 h-2.5 ml-auto" />
            </button>

            {/* Tool dropdown */}
            {showToolDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#1e1e2e] border border-[#313244] rounded-lg shadow-xl z-20 py-1">
                {['Search API', 'Calculator', 'Code Interpreter', 'Web Browser'].map((tool) => (
                  <button
                    key={tool}
                    className="w-full px-2 py-1.5 text-left text-xs text-[#a6adc8] hover:bg-[#313244] flex items-center gap-2"
                    onClick={() => setShowToolDropdown(false)}
                  >
                    <Wrench className="w-3 h-3 text-emerald-400" />
                    {tool}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Connection points - Bottom */}
        <div className="absolute -bottom-7 left-0 right-0 flex justify-around px-8">
          {AGENT_CONNECTION_POINTS.filter(p => p.position.startsWith('bottom')).map((point) => (
            <div key={point.id} className="flex flex-col items-center">
              <div className="relative">
                <Handle
                  id={point.id}
                  type="target"
                  position={Position.Bottom}
                  className="!relative !transform-none !w-3 !h-3 !bg-transparent !border-0"
                />
                <div
                  className="absolute inset-0 w-3 h-3 rotate-45 border-2"
                  style={{ backgroundColor: `${point.color}30`, borderColor: point.color }}
                />
              </div>
              <span className="text-[9px] text-[#6c7086] font-medium mt-1">
                {point.label}
              </span>
              <button className="w-3 h-3 bg-[#313244] hover:bg-blue-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100">
                <Plus className="w-2 h-2 text-[#6c7086]" />
              </button>
            </div>
          ))}
        </div>

        {/* Error connection point - Right */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 flex items-center">
          <div className="relative mr-1">
            <Handle
              id="error"
              type="source"
              position={Position.Right}
              className="!relative !transform-none !w-3 !h-3 !bg-transparent !border-0"
            />
            <div
              className="absolute inset-0 w-3 h-3 rotate-45 border-2"
              style={{ backgroundColor: '#f8717130', borderColor: '#f87171' }}
            />
          </div>
          <span className="text-[9px] text-[#6c7086] font-medium">- Error</span>
        </div>

        {/* Main input handle */}
        <Handle
          type="target"
          position={Position.Left}
          className="!w-3 !h-3 !bg-blue-500 !border-2 !border-[#1e1e2e]"
        />

        {/* Main output handle */}
        <Handle
          type="source"
          position={Position.Right}
          className="!w-3 !h-3 !bg-blue-500 !border-2 !border-[#1e1e2e]"
          style={{ top: '75%' }}
        />
      </div>
    );
  }

  // Standard Node Design (for all other node types)
  const getCategoryBadge = () => {
    if (isPatternNode) {
      return (
        <div className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-purple-500/90 rounded text-[9px] font-medium text-white flex items-center gap-0.5">
          <Puzzle className="w-2.5 h-2.5" />
          Pattern
        </div>
      );
    }
    if (isContextNode) {
      return (
        <div className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-cyan-500/90 rounded text-[9px] font-medium text-white">
          Context
        </div>
      );
    }
    if (isDataPipelineNode) {
      return (
        <div className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-emerald-500/90 rounded text-[9px] font-medium text-white">
          Pipeline
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className={`
        relative min-w-[180px] rounded-lg border-2 bg-[#1e1e2e] shadow-lg transition-all
        ${selected ? 'border-blue-500 shadow-blue-500/20' : 'border-[#313244] hover:border-[#45475a]'}
        ${nodeData.hasCodeOverride ? 'ring-2 ring-amber-500/50 ring-offset-2 ring-offset-[#1e1e2e]' : ''}
        ${isPatternNode ? 'border-dashed' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Category Badge */}
      {getCategoryBadge()}

      {/* Hover action buttons for standard nodes */}
      {isHovered && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-1 px-1.5 py-1 bg-[#1e1e2e] border border-[#313244] rounded-md shadow-lg z-10">
          <button className="p-1 hover:bg-[#313244] rounded transition-colors">
            <Trash2 className="w-3.5 h-3.5 text-[#6c7086] hover:text-red-400" />
          </button>
          <button className="p-1 hover:bg-[#313244] rounded transition-colors">
            <Copy className="w-3.5 h-3.5 text-[#6c7086]" />
          </button>
        </div>
      )}

      {/* Input Handle */}
      {nodeData.type !== 'trigger' && (
        <Handle
          type="target"
          position={Position.Left}
          className="!w-3 !h-3 !bg-[#45475a] !border-2 !border-[#1e1e2e] hover:!bg-blue-500 transition-colors"
        />
      )}

      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-t-lg border-b border-[#313244]"
        style={{ backgroundColor: `${config?.color}15` }}
      >
        <div className="p-1.5 rounded-md" style={{ backgroundColor: `${config?.color}30` }}>
          <IconComponent className="w-4 h-4" color={config?.color} />
        </div>
        <span className="font-medium text-sm text-[#cdd6f4] truncate">{nodeData.label}</span>
        {nodeData.hasCodeOverride && (
          <Code className="w-3.5 h-3.5 text-amber-500 ml-auto flex-shrink-0" />
        )}
      </div>

      {/* Body */}
      <div className="px-3 py-2">
        <p className="text-xs text-[#6c7086] line-clamp-2">{config?.description}</p>

        {/* Config preview */}
        {nodeData.config && Object.keys(nodeData.config).length > 0 && (
          <div className="mt-2 pt-2 border-t border-[#313244]">
            {Object.entries(nodeData.config)
              .slice(0, 2)
              .map(([key, value]) => (
                <div key={key} className="flex items-center justify-between text-xs mb-1">
                  <span className="text-[#6c7086]">{formatKey(key)}:</span>
                  <span className="text-[#a6adc8] truncate max-w-[100px]">{formatValue(value)}</span>
                </div>
              ))}
          </div>
        )}

        {/* Validation errors */}
        {nodeData.validationErrors && nodeData.validationErrors.length > 0 && (
          <div className="mt-2 flex items-center gap-1 text-xs text-red-400">
            <AlertTriangle className="w-3 h-3" />
            <span>{nodeData.validationErrors.length} issue(s)</span>
          </div>
        )}
      </div>

      {/* Output Handle */}
      {nodeData.type !== 'output' && (
        <Handle
          type="source"
          position={Position.Right}
          className="!w-3 !h-3 !bg-[#45475a] !border-2 !border-[#1e1e2e] hover:!bg-blue-500 transition-colors"
        />
      )}
    </div>
  );
}

function formatKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

function formatValue(value: unknown): string {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') return JSON.stringify(value).slice(0, 20) + '...';
  if (typeof value === 'string' && value.length > 20) return value.slice(0, 20) + '...';
  return String(value);
}

export default memo(AgentNodeComponent);
