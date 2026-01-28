import { useState } from 'react';
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
  ChevronDown,
  ChevronRight,
  GripVertical,
  Settings2,
  Boxes,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  ArrowLeftRight,
  // New icons for pattern and context nodes
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
  type LucideProps,
} from 'lucide-react';
import type { AgentPatternType, SyncStatus } from '../types';
import { nodeConfigs, nodeCategories } from '../utils/nodeConfig';
import type { FlowArgumentsConfig } from '../types/execution';
import ArgumentsPanel from './ArgumentsPanel';

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

type SidebarTab = 'nodes' | 'arguments';

interface SidebarProps {
  onDragStart: (event: React.DragEvent, nodeType: AgentPatternType) => void;
  flowArguments: FlowArgumentsConfig;
  onUpdateArguments: (args: FlowArgumentsConfig) => void;
  selectedNodeId?: string | null;
  nodeArguments?: Record<string, FlowArgumentsConfig>;
  onUpdateNodeArguments?: (nodeId: string, args: FlowArgumentsConfig) => void;
  syncStatus?: SyncStatus;
  nodeCount?: number;
  edgeCount?: number;
}

// Sync status display for footer
function getSyncIndicator(status: SyncStatus): {
  icon: React.ReactNode;
  text: string;
  color: string;
  dotColor: string;
} {
  switch (status) {
    case 'synced':
      return {
        icon: <CheckCircle2 className="w-3 h-3" />,
        text: 'Visual ↔ Code in sync',
        color: 'text-green-400',
        dotColor: 'bg-green-500',
      };
    case 'visual_ahead':
      return {
        icon: <ArrowLeftRight className="w-3 h-3" />,
        text: 'Visual changes pending',
        color: 'text-blue-400',
        dotColor: 'bg-blue-500',
      };
    case 'code_ahead':
      return {
        icon: <ArrowLeftRight className="w-3 h-3" />,
        text: 'Code changes pending',
        color: 'text-amber-400',
        dotColor: 'bg-amber-500',
      };
    case 'conflict':
      return {
        icon: <AlertCircle className="w-3 h-3" />,
        text: 'Sync conflict detected',
        color: 'text-red-400',
        dotColor: 'bg-red-500',
      };
    case 'code_only':
      return {
        icon: <AlertTriangle className="w-3 h-3" />,
        text: 'Code-only regions exist',
        color: 'text-purple-400',
        dotColor: 'bg-purple-500',
      };
    case 'parsing':
      return {
        icon: <RefreshCw className="w-3 h-3 animate-spin" />,
        text: 'Synchronizing...',
        color: 'text-[#6c7086]',
        dotColor: 'bg-[#6c7086]',
      };
    default:
      return {
        icon: <CheckCircle2 className="w-3 h-3" />,
        text: 'Visual ↔ Code in sync',
        color: 'text-green-400',
        dotColor: 'bg-green-500',
      };
  }
}

export default function Sidebar({
  onDragStart,
  flowArguments,
  onUpdateArguments,
  selectedNodeId,
  nodeArguments,
  onUpdateNodeArguments,
  syncStatus = 'synced',
  nodeCount = 0,
  edgeCount = 0,
}: SidebarProps) {
  const syncIndicator = getSyncIndicator(syncStatus);
  const [activeTab, setActiveTab] = useState<SidebarTab>('nodes');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    triggers: true,
    agentic: true,
    patterns: true,
    context: false,
    dataPipeline: false,
    control: true,
    actions: true,
  });

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  return (
    <div className="w-64 bg-[#181825] border-r border-[#313244] flex flex-col h-full">
      {/* Tab Header */}
      <div className="p-2 border-b border-[#313244]">
        <div className="flex items-center gap-1 p-1 bg-[#11111b] rounded-lg">
          <button
            onClick={() => setActiveTab('nodes')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'nodes'
                ? 'bg-[#313244] text-[#cdd6f4]'
                : 'text-[#6c7086] hover:text-[#a6adc8]'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            Nodes
          </button>
          <button
            onClick={() => setActiveTab('arguments')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'arguments'
                ? 'bg-[#313244] text-[#cdd6f4]'
                : 'text-[#6c7086] hover:text-[#a6adc8]'
            }`}
          >
            <Settings2 className="w-3.5 h-3.5" />
            Arguments
          </button>
        </div>
      </div>

      {/* Nodes Tab Content */}
      {activeTab === 'nodes' && (
        <>
          {/* Header */}
          <div className="p-4 border-b border-[#313244]">
            <h2 className="text-lg font-semibold text-[#cdd6f4] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Agent Nodes
            </h2>
            <p className="text-xs text-[#6c7086] mt-1">
              Drag nodes to the canvas to build your workflow
            </p>
          </div>

          {/* Node Categories */}
          <div className="flex-1 overflow-y-auto p-2">
            {Object.entries(nodeCategories).map(([categoryKey, category]) => (
              <div key={categoryKey} className="mb-2">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(categoryKey)}
                  className="w-full flex items-center gap-2 px-2 py-2 text-left rounded-md hover:bg-[#1e1e2e] transition-colors"
                >
                  {expandedCategories[categoryKey] ? (
                    <ChevronDown className="w-4 h-4 text-[#6c7086]" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-[#6c7086]" />
                  )}
                  <span className="text-sm font-medium text-[#a6adc8]">
                    {category.label}
                  </span>
                  <span className="ml-auto text-xs text-[#45475a]">
                    {category.types.length}
                  </span>
                </button>

                {/* Category Nodes */}
                {expandedCategories[categoryKey] && (
                  <div className="ml-2 mt-1 space-y-1">
                    {category.types.map((nodeType) => {
                      const config = nodeConfigs[nodeType];
                      const IconComponent = iconMap[config.icon] || Zap;

                      return (
                        <div
                          key={nodeType}
                          draggable
                          onDragStart={(e) => onDragStart(e, nodeType)}
                          className="flex items-center gap-2 px-2 py-2 rounded-md bg-[#1e1e2e] border border-[#313244] cursor-grab hover:border-[#45475a] hover:bg-[#262637] transition-all group"
                        >
                          <GripVertical className="w-3 h-3 text-[#45475a] opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div
                            className="p-1.5 rounded-md"
                            style={{ backgroundColor: `${config.color}20` }}
                          >
                            <IconComponent
                              className="w-3.5 h-3.5"
                              color={config.color}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-[#cdd6f4] truncate">
                              {config.label}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer with Sync Status */}
          <div className="p-4 border-t border-[#313244]">
            <div className="text-xs space-y-2">
              {/* Sync Status */}
              <div className={`flex items-center gap-2 ${syncIndicator.color}`}>
                <span className={`w-2 h-2 rounded-full ${syncIndicator.dotColor}`}></span>
                <span className="flex items-center gap-1.5">
                  {syncIndicator.icon}
                  {syncIndicator.text}
                </span>
              </div>

              {/* Node/Edge Count */}
              <div className="flex items-center justify-between text-[#45475a]">
                <span>{nodeCount} nodes • {edgeCount} edges</span>
              </div>

              {/* Help Text */}
              <p className="text-[#45475a] pt-1 border-t border-[#313244]/50">
                Drag to add • Click to configure
              </p>
            </div>
          </div>
        </>
      )}

      {/* Arguments Tab Content */}
      {activeTab === 'arguments' && (
        <div className="flex-1 overflow-y-auto">
          <ArgumentsPanel
            flowArguments={flowArguments}
            onUpdateArguments={onUpdateArguments}
            selectedNodeId={selectedNodeId}
            nodeArguments={nodeArguments}
            onUpdateNodeArguments={onUpdateNodeArguments}
          />
        </div>
      )}
    </div>
  );
}
