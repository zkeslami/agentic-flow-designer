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
  type LucideProps,
} from 'lucide-react';
import type { AgentPatternType } from '../types';
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
};

type SidebarTab = 'nodes' | 'arguments';

interface SidebarProps {
  onDragStart: (event: React.DragEvent, nodeType: AgentPatternType) => void;
  flowArguments: FlowArgumentsConfig;
  onUpdateArguments: (args: FlowArgumentsConfig) => void;
  selectedNodeId?: string | null;
  nodeArguments?: Record<string, FlowArgumentsConfig>;
  onUpdateNodeArguments?: (nodeId: string, args: FlowArgumentsConfig) => void;
}

export default function Sidebar({
  onDragStart,
  flowArguments,
  onUpdateArguments,
  selectedNodeId,
  nodeArguments,
  onUpdateNodeArguments,
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<SidebarTab>('nodes');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    triggers: true,
    agentic: true,
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

          {/* Footer */}
          <div className="p-4 border-t border-[#313244]">
            <div className="text-xs text-[#6c7086] space-y-1">
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Visual ↔ Code in sync
              </p>
              <p className="text-[#45475a]">
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
