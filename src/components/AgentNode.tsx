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
  Database,
  User,
  type LucideProps,
  type LucideIcon,
} from 'lucide-react';
import type { AgentNodeData, AgentPatternType, AgentNode } from '../types';
import { nodeConfigs } from '../utils/nodeConfig';
import {
  MemoryPanel,
  EscalationPanel,
  ContextPanel,
  ToolsPanel,
  type MemoryConfig,
  type EscalationConfig,
  type ContextSourceConfig,
  type ToolConfig,
} from './AgentConfigPanels';

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

// Connection point configuration for Agent nodes (removed Error)
interface ConnectionPoint {
  id: 'memory' | 'escalations' | 'context' | 'tools';
  label: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  color: string;
  icon: LucideIcon;
}

const AGENT_CONNECTION_POINTS: ConnectionPoint[] = [
  { id: 'memory', label: 'Memory', position: 'top-left', color: '#a78bfa', icon: Database },
  { id: 'escalations', label: 'Escalations', position: 'top-right', color: '#f472b6', icon: User },
  { id: 'context', label: 'Context', position: 'bottom-left', color: '#60a5fa', icon: FileText },
  { id: 'tools', label: 'Tools', position: 'bottom-right', color: '#34d399', icon: Wrench },
];

// Sub-node visual component that appears when connection is configured
interface SubNodeProps {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  count: number;
  onClick: () => void;
}

function SubNode({ label, icon: Icon, color, position, count, onClick }: SubNodeProps) {
  const positionStyles: Record<string, string> = {
    'top-left': '-top-20 -left-8',
    'top-right': '-top-20 -right-8',
    'bottom-left': '-bottom-20 -left-8',
    'bottom-right': '-bottom-20 -right-8',
  };

  return (
    <button
      onClick={onClick}
      className={`absolute ${positionStyles[position]} flex flex-col items-center gap-1 group`}
    >
      {/* Dashed line connecting to agent */}
      <div
        className={`absolute ${position.startsWith('top') ? 'bottom-0 mb-1' : 'top-0 mt-1'} left-1/2 -translate-x-1/2 w-px h-8 border-l-2 border-dashed`}
        style={{ borderColor: `${color}50` }}
      />

      {/* Sub-node circle */}
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center transition-all group-hover:scale-110 shadow-lg"
        style={{ backgroundColor: `${color}15`, border: `2px solid ${color}40` }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>

      {/* Label */}
      <span className="text-[10px] text-[#6c7086] font-medium whitespace-nowrap">
        {label} {count > 0 && `(${count})`}
      </span>
    </button>
  );
}

function AgentNodeComponent({ data, selected }: NodeProps<AgentNode>) {
  const [isHovered, setIsHovered] = useState(false);
  const [activePanel, setActivePanel] = useState<ConnectionPoint['id'] | null>(null);

  const nodeData = data as AgentNodeData;
  const config = nodeConfigs[nodeData.type as AgentPatternType];
  const IconComponent = iconMap[config?.icon] || Zap;
  const isPatternNode = config?.isPattern;
  const isContextNode = config?.category === 'context';
  const isDataPipelineNode = config?.category === 'dataPipeline';

  // Special rendering for Agent nodes (matching the reference image)
  const isAgentNode = nodeData.type === 'agent';

  // Get agent sub-configurations from node data
  const memories: MemoryConfig[] = (nodeData.config?.memories as MemoryConfig[]) || [];
  const escalations: EscalationConfig[] = (nodeData.config?.escalations as EscalationConfig[]) || [];
  const contextSources: ContextSourceConfig[] = (nodeData.config?.contextSources as ContextSourceConfig[]) || [];
  const tools: ToolConfig[] = (nodeData.config?.tools as ToolConfig[]) || [];

  const handleConnectionClick = useCallback((connectionId: ConnectionPoint['id']) => {
    setActivePanel(connectionId);
  }, []);

  // Note: In a real implementation, these handlers would update the node data through the parent
  // For now, they just close the panel
  const handleMemoriesChange = useCallback((_newMemories: MemoryConfig[]) => {
    // Would call onUpdate here with new memories
    setActivePanel(null);
  }, []);

  const handleEscalationsChange = useCallback((_newEscalations: EscalationConfig[]) => {
    setActivePanel(null);
  }, []);

  const handleContextChange = useCallback((_newSources: ContextSourceConfig[]) => {
    setActivePanel(null);
  }, []);

  const handleToolsChange = useCallback((_newTools: ToolConfig[]) => {
    setActivePanel(null);
  }, []);

  // Agent Node - Special Design
  if (isAgentNode) {
    return (
      <>
        <div
          className={`
            relative rounded-xl transition-all duration-200
            ${selected ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-[#11111b]' : ''}
          `}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{ padding: '24px' }} // Extra padding for sub-nodes
        >
          {/* Action buttons - shown on hover */}
          {isHovered && (
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-1 bg-[#1e1e2e] border border-[#313244] rounded-lg shadow-lg z-10">
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

          {/* Sub-nodes for configured connections */}
          {memories.length > 0 && (
            <SubNode
              id="memory-subnode"
              label="MemorySpace"
              icon={Database}
              color="#a78bfa"
              position="top-left"
              count={memories.length}
              onClick={() => handleConnectionClick('memory')}
            />
          )}
          {escalations.length > 0 && (
            <SubNode
              id="escalation-subnode"
              label="Escalation"
              icon={User}
              color="#f472b6"
              position="top-right"
              count={escalations.length}
              onClick={() => handleConnectionClick('escalations')}
            />
          )}
          {contextSources.length > 0 && (
            <SubNode
              id="context-subnode"
              label="Context"
              icon={FileText}
              color="#60a5fa"
              position="bottom-left"
              count={contextSources.length}
              onClick={() => handleConnectionClick('context')}
            />
          )}
          {tools.length > 0 && (
            <SubNode
              id="tools-subnode"
              label="Tools"
              icon={Wrench}
              color="#34d399"
              position="bottom-right"
              count={tools.length}
              onClick={() => handleConnectionClick('tools')}
            />
          )}

          {/* Connection points with labels - Top */}
          <div className="absolute -top-6 left-6 right-6 flex justify-between">
            {AGENT_CONNECTION_POINTS.filter(p => p.position.startsWith('top')).map((point) => {
              const hasItems = point.id === 'memory' ? memories.length > 0 :
                               point.id === 'escalations' ? escalations.length > 0 : false;
              return (
                <button
                  key={point.id}
                  className="flex flex-col items-center group"
                  onClick={() => handleConnectionClick(point.id)}
                >
                  {/* Plus button when no items */}
                  {!hasItems && (
                    <div className="mb-1 w-4 h-4 bg-[#313244] hover:bg-blue-500 rounded-full flex items-center justify-center opacity-60 group-hover:opacity-100 transition-all">
                      <Plus className="w-2.5 h-2.5 text-[#6c7086] group-hover:text-white" />
                    </div>
                  )}
                  <span className="text-[9px] text-[#6c7086] font-medium mb-1">
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
                      className="absolute inset-0 w-3 h-3 rotate-45 border-2 transition-all group-hover:scale-125"
                      style={{ backgroundColor: `${point.color}30`, borderColor: point.color }}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Main node container */}
          <div className="flex bg-[#1e1e2e] border-2 border-blue-500/50 rounded-xl overflow-hidden min-w-[240px] shadow-lg group">
            {/* Gradient left border / icon area */}
            <div className="w-14 bg-gradient-to-b from-purple-500/20 to-pink-500/20 flex items-center justify-center border-r border-[#313244]">
              <div className="w-9 h-9 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center shadow-md">
                <Bot className="w-5 h-5 text-white" />
              </div>
            </div>

            {/* Content area */}
            <div className="flex-1 py-3 px-4">
              <h3 className="text-[#cdd6f4] font-semibold text-sm">
                {nodeData.label || 'Agent'}
              </h3>
              <p className="text-[10px] text-[#6c7086] mt-0.5">Autonomous Agent</p>

              {/* Quick tool preview */}
              {tools.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {tools.slice(0, 3).map((tool) => (
                    <span
                      key={tool.id}
                      className="px-1.5 py-0.5 bg-[#11111b] rounded text-[9px] text-[#a6adc8]"
                    >
                      {tool.name}
                    </span>
                  ))}
                  {tools.length > 3 && (
                    <span className="px-1.5 py-0.5 text-[9px] text-[#6c7086]">
                      +{tools.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Connection points - Bottom */}
          <div className="absolute -bottom-6 left-6 right-6 flex justify-between">
            {AGENT_CONNECTION_POINTS.filter(p => p.position.startsWith('bottom')).map((point) => {
              const hasItems = point.id === 'context' ? contextSources.length > 0 :
                               point.id === 'tools' ? tools.length > 0 : false;
              return (
                <button
                  key={point.id}
                  className="flex flex-col items-center group"
                  onClick={() => handleConnectionClick(point.id)}
                >
                  <div className="relative">
                    <Handle
                      id={point.id}
                      type="target"
                      position={Position.Bottom}
                      className="!relative !transform-none !w-3 !h-3 !bg-transparent !border-0"
                    />
                    <div
                      className="absolute inset-0 w-3 h-3 rotate-45 border-2 transition-all group-hover:scale-125"
                      style={{ backgroundColor: `${point.color}30`, borderColor: point.color }}
                    />
                  </div>
                  <span className="text-[9px] text-[#6c7086] font-medium mt-1">
                    {point.label}
                  </span>
                  {/* Plus button when no items */}
                  {!hasItems && (
                    <div className="mt-1 w-4 h-4 bg-[#313244] hover:bg-blue-500 rounded-full flex items-center justify-center opacity-60 group-hover:opacity-100 transition-all">
                      <Plus className="w-2.5 h-2.5 text-[#6c7086] group-hover:text-white" />
                    </div>
                  )}
                </button>
              );
            })}
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
          />
        </div>

        {/* Configuration Panels */}
        <MemoryPanel
          isOpen={activePanel === 'memory'}
          onClose={() => setActivePanel(null)}
          memories={memories}
          onChange={handleMemoriesChange}
        />
        <EscalationPanel
          isOpen={activePanel === 'escalations'}
          onClose={() => setActivePanel(null)}
          escalations={escalations}
          onChange={handleEscalationsChange}
        />
        <ContextPanel
          isOpen={activePanel === 'context'}
          onClose={() => setActivePanel(null)}
          sources={contextSources}
          onChange={handleContextChange}
        />
        <ToolsPanel
          isOpen={activePanel === 'tools'}
          onClose={() => setActivePanel(null)}
          tools={tools}
          onChange={handleToolsChange}
        />
      </>
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
