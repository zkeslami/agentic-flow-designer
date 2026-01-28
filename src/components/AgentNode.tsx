import { memo } from 'react';
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
  // Pattern and specialized node icons
  Bot,
  BookOpen,
  Table,
  Grid3X3,
  Files,
  // Context engineering node icons
  PenLine,
  MousePointer2,
  Minimize2,
  Split,
  // Data pipeline node icons
  Download,
  Layers,
  FileEdit,
  Stethoscope,
  MessageCircle,
  // Pattern indicator
  Puzzle,
  type LucideProps,
} from 'lucide-react';
import type { AgentNodeData, AgentPatternType, AgentNode } from '../types';
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
  // Pattern and specialized nodes
  Bot,
  BookOpen,
  Table,
  Grid3x3: Grid3X3,
  Files,
  // Context engineering nodes
  PenLine,
  MousePointer2,
  Minimize2,
  Split,
  // Data pipeline nodes
  Download,
  Layers,
  FileEdit,
  Stethoscope,
  MessageCircle,
};

function AgentNodeComponent({ data, selected }: NodeProps<AgentNode>) {
  const nodeData = data as AgentNodeData;
  const config = nodeConfigs[nodeData.type as AgentPatternType];
  const IconComponent = iconMap[config?.icon] || Zap;
  const isPatternNode = config?.isPattern;
  const isContextNode = config?.category === 'context';
  const isDataPipelineNode = config?.category === 'dataPipeline';

  // Get category-specific styling
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
    >
      {/* Category Badge */}
      {getCategoryBadge()}

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
        <div
          className="p-1.5 rounded-md"
          style={{ backgroundColor: `${config?.color}30` }}
        >
          <IconComponent
            className="w-4 h-4"
            color={config?.color}
          />
        </div>
        <span className="font-medium text-sm text-[#cdd6f4] truncate">
          {nodeData.label}
        </span>
        {nodeData.hasCodeOverride && (
          <Code className="w-3.5 h-3.5 text-amber-500 ml-auto flex-shrink-0" />
        )}
      </div>

      {/* Body */}
      <div className="px-3 py-2">
        <p className="text-xs text-[#6c7086] line-clamp-2">
          {config?.description}
        </p>

        {/* Config preview */}
        {nodeData.config && Object.keys(nodeData.config).length > 0 && (
          <div className="mt-2 pt-2 border-t border-[#313244]">
            {Object.entries(nodeData.config)
              .slice(0, 2)
              .map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between text-xs mb-1"
                >
                  <span className="text-[#6c7086]">{formatKey(key)}:</span>
                  <span className="text-[#a6adc8] truncate max-w-[100px]">
                    {formatValue(value)}
                  </span>
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
