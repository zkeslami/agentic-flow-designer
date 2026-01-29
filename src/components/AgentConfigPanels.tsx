import { useState } from 'react';
import {
  X,
  Database,
  User,
  FileText,
  Wrench,
  Plus,
  Trash2,
  Search,
  Globe,
  Calculator,
  Code,
  FileCode,
  MessageSquare,
  type LucideIcon,
} from 'lucide-react';

// Types for agent sub-configurations
export interface MemoryConfig {
  id: string;
  name: string;
  type: 'conversation' | 'episodic' | 'semantic' | 'procedural';
  maxHistory: number;
  ttl?: number;
  autoWrite: boolean;
}

export interface EscalationConfig {
  id: string;
  name: string;
  trigger: 'low_confidence' | 'destructive_action' | 'manual' | 'timeout' | 'always';
  threshold?: number;
  timeout: number;
  notificationChannel: 'slack' | 'email' | 'action_center' | 'teams';
  approvers: string[];
}

export interface ContextSourceConfig {
  id: string;
  name: string;
  type: 'document' | 'index' | 'database' | 'api' | 'file';
  source: string;
  refreshInterval?: number;
  priority: number;
}

export interface ToolConfig {
  id: string;
  name: string;
  type: 'search' | 'calculator' | 'code_interpreter' | 'web_browser' | 'file_system' | 'api' | 'custom';
  description: string;
  requiresApproval: boolean;
  parameters: Record<string, unknown>;
}

// Panel Props
interface ConfigPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon: LucideIcon;
  iconColor: string;
  children: React.ReactNode;
}

function ConfigPanel({ isOpen, onClose, title, icon: Icon, iconColor, children }: ConfigPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-[500px] max-h-[80vh] bg-[#1e1e2e] rounded-xl shadow-2xl border border-[#313244] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#313244]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${iconColor}20` }}>
              <Icon className="w-5 h-5" style={{ color: iconColor }} />
            </div>
            <h2 className="text-lg font-semibold text-[#cdd6f4]">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#313244] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#6c7086]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-4 py-3 border-t border-[#313244]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[#a6adc8] hover:bg-[#313244] rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// Memory Configuration Panel
interface MemoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  memories: MemoryConfig[];
  onChange: (memories: MemoryConfig[]) => void;
}

export function MemoryPanel({ isOpen, onClose, memories, onChange }: MemoryPanelProps) {
  const [localMemories, setLocalMemories] = useState<MemoryConfig[]>(memories);

  const addMemory = () => {
    const newMemory: MemoryConfig = {
      id: `memory-${Date.now()}`,
      name: `MemorySpace ${localMemories.length + 1}`,
      type: 'conversation',
      maxHistory: 10,
      autoWrite: true,
    };
    setLocalMemories([...localMemories, newMemory]);
  };

  const removeMemory = (id: string) => {
    setLocalMemories(localMemories.filter(m => m.id !== id));
  };

  const updateMemory = (id: string, updates: Partial<MemoryConfig>) => {
    setLocalMemories(localMemories.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const handleSave = () => {
    onChange(localMemories);
    onClose();
  };

  return (
    <ConfigPanel
      isOpen={isOpen}
      onClose={handleSave}
      title="Memory Configuration"
      icon={Database}
      iconColor="#a78bfa"
    >
      <div className="space-y-4">
        <p className="text-sm text-[#6c7086]">
          Configure memory spaces for the agent to store and retrieve context.
        </p>

        {localMemories.map((memory) => (
          <div
            key={memory.id}
            className="p-4 bg-[#11111b] rounded-lg border border-[#313244] space-y-3"
          >
            <div className="flex items-center justify-between">
              <input
                type="text"
                value={memory.name}
                onChange={(e) => updateMemory(memory.id, { name: e.target.value })}
                className="text-sm font-medium text-[#cdd6f4] bg-transparent border-none focus:outline-none"
              />
              <button
                onClick={() => removeMemory(memory.id)}
                className="p-1 hover:bg-[#313244] rounded transition-colors"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[#6c7086] mb-1">Type</label>
                <select
                  value={memory.type}
                  onChange={(e) => updateMemory(memory.id, { type: e.target.value as MemoryConfig['type'] })}
                  className="w-full px-2 py-1.5 text-sm bg-[#1e1e2e] border border-[#313244] rounded text-[#cdd6f4] focus:outline-none focus:border-purple-500"
                >
                  <option value="conversation">Conversation</option>
                  <option value="episodic">Episodic</option>
                  <option value="semantic">Semantic</option>
                  <option value="procedural">Procedural</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-[#6c7086] mb-1">Max History</label>
                <input
                  type="number"
                  value={memory.maxHistory}
                  onChange={(e) => updateMemory(memory.id, { maxHistory: parseInt(e.target.value) })}
                  className="w-full px-2 py-1.5 text-sm bg-[#1e1e2e] border border-[#313244] rounded text-[#cdd6f4] focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`autowrite-${memory.id}`}
                checked={memory.autoWrite}
                onChange={(e) => updateMemory(memory.id, { autoWrite: e.target.checked })}
                className="rounded border-[#313244]"
              />
              <label htmlFor={`autowrite-${memory.id}`} className="text-xs text-[#a6adc8]">
                Auto-write to memory
              </label>
            </div>
          </div>
        ))}

        <button
          onClick={addMemory}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-[#313244] rounded-lg text-sm text-[#6c7086] hover:border-purple-500 hover:text-purple-400 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Memory Space
        </button>
      </div>
    </ConfigPanel>
  );
}

// Escalation Configuration Panel
interface EscalationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  escalations: EscalationConfig[];
  onChange: (escalations: EscalationConfig[]) => void;
}

export function EscalationPanel({ isOpen, onClose, escalations, onChange }: EscalationPanelProps) {
  const [localEscalations, setLocalEscalations] = useState<EscalationConfig[]>(escalations);

  const addEscalation = () => {
    const newEscalation: EscalationConfig = {
      id: `escalation-${Date.now()}`,
      name: `Escalation ${localEscalations.length + 1}`,
      trigger: 'low_confidence',
      threshold: 0.7,
      timeout: 300,
      notificationChannel: 'slack',
      approvers: [],
    };
    setLocalEscalations([...localEscalations, newEscalation]);
  };

  const removeEscalation = (id: string) => {
    setLocalEscalations(localEscalations.filter(e => e.id !== id));
  };

  const updateEscalation = (id: string, updates: Partial<EscalationConfig>) => {
    setLocalEscalations(localEscalations.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const handleSave = () => {
    onChange(localEscalations);
    onClose();
  };

  return (
    <ConfigPanel
      isOpen={isOpen}
      onClose={handleSave}
      title="Escalation & Human-in-the-Loop"
      icon={User}
      iconColor="#f472b6"
    >
      <div className="space-y-4">
        <p className="text-sm text-[#6c7086]">
          Configure when and how the agent should escalate to human review.
        </p>

        {localEscalations.map((escalation) => (
          <div
            key={escalation.id}
            className="p-4 bg-[#11111b] rounded-lg border border-[#313244] space-y-3"
          >
            <div className="flex items-center justify-between">
              <input
                type="text"
                value={escalation.name}
                onChange={(e) => updateEscalation(escalation.id, { name: e.target.value })}
                className="text-sm font-medium text-[#cdd6f4] bg-transparent border-none focus:outline-none"
              />
              <button
                onClick={() => removeEscalation(escalation.id)}
                className="p-1 hover:bg-[#313244] rounded transition-colors"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[#6c7086] mb-1">Trigger</label>
                <select
                  value={escalation.trigger}
                  onChange={(e) => updateEscalation(escalation.id, { trigger: e.target.value as EscalationConfig['trigger'] })}
                  className="w-full px-2 py-1.5 text-sm bg-[#1e1e2e] border border-[#313244] rounded text-[#cdd6f4] focus:outline-none focus:border-pink-500"
                >
                  <option value="low_confidence">Low Confidence</option>
                  <option value="destructive_action">Destructive Action</option>
                  <option value="manual">Manual Request</option>
                  <option value="timeout">Timeout</option>
                  <option value="always">Always</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-[#6c7086] mb-1">Threshold</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={escalation.threshold || 0.7}
                  onChange={(e) => updateEscalation(escalation.id, { threshold: parseFloat(e.target.value) })}
                  className="w-full px-2 py-1.5 text-sm bg-[#1e1e2e] border border-[#313244] rounded text-[#cdd6f4] focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[#6c7086] mb-1">Notification</label>
                <select
                  value={escalation.notificationChannel}
                  onChange={(e) => updateEscalation(escalation.id, { notificationChannel: e.target.value as EscalationConfig['notificationChannel'] })}
                  className="w-full px-2 py-1.5 text-sm bg-[#1e1e2e] border border-[#313244] rounded text-[#cdd6f4] focus:outline-none focus:border-pink-500"
                >
                  <option value="slack">Slack</option>
                  <option value="email">Email</option>
                  <option value="action_center">Action Center</option>
                  <option value="teams">Teams</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-[#6c7086] mb-1">Timeout (sec)</label>
                <input
                  type="number"
                  value={escalation.timeout}
                  onChange={(e) => updateEscalation(escalation.id, { timeout: parseInt(e.target.value) })}
                  className="w-full px-2 py-1.5 text-sm bg-[#1e1e2e] border border-[#313244] rounded text-[#cdd6f4] focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={addEscalation}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-[#313244] rounded-lg text-sm text-[#6c7086] hover:border-pink-500 hover:text-pink-400 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Escalation Rule
        </button>
      </div>
    </ConfigPanel>
  );
}

// Context Sources Configuration Panel
interface ContextPanelProps {
  isOpen: boolean;
  onClose: () => void;
  sources: ContextSourceConfig[];
  onChange: (sources: ContextSourceConfig[]) => void;
}

export function ContextPanel({ isOpen, onClose, sources, onChange }: ContextPanelProps) {
  const [localSources, setLocalSources] = useState<ContextSourceConfig[]>(sources);

  const addSource = () => {
    const newSource: ContextSourceConfig = {
      id: `context-${Date.now()}`,
      name: `Context Source ${localSources.length + 1}`,
      type: 'document',
      source: '',
      priority: localSources.length + 1,
    };
    setLocalSources([...localSources, newSource]);
  };

  const removeSource = (id: string) => {
    setLocalSources(localSources.filter(s => s.id !== id));
  };

  const updateSource = (id: string, updates: Partial<ContextSourceConfig>) => {
    setLocalSources(localSources.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const handleSave = () => {
    onChange(localSources);
    onClose();
  };

  const getTypeIcon = (type: ContextSourceConfig['type']) => {
    switch (type) {
      case 'document': return FileText;
      case 'index': return Search;
      case 'database': return Database;
      case 'api': return Globe;
      case 'file': return FileCode;
      default: return FileText;
    }
  };

  return (
    <ConfigPanel
      isOpen={isOpen}
      onClose={handleSave}
      title="Context & Data Sources"
      icon={FileText}
      iconColor="#60a5fa"
    >
      <div className="space-y-4">
        <p className="text-sm text-[#6c7086]">
          Configure data sources and context that the agent can access.
        </p>

        {localSources.map((source) => {
          const TypeIcon = getTypeIcon(source.type);
          return (
            <div
              key={source.id}
              className="p-4 bg-[#11111b] rounded-lg border border-[#313244] space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TypeIcon className="w-4 h-4 text-blue-400" />
                  <input
                    type="text"
                    value={source.name}
                    onChange={(e) => updateSource(source.id, { name: e.target.value })}
                    className="text-sm font-medium text-[#cdd6f4] bg-transparent border-none focus:outline-none"
                  />
                </div>
                <button
                  onClick={() => removeSource(source.id)}
                  className="p-1 hover:bg-[#313244] rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#6c7086] mb-1">Type</label>
                  <select
                    value={source.type}
                    onChange={(e) => updateSource(source.id, { type: e.target.value as ContextSourceConfig['type'] })}
                    className="w-full px-2 py-1.5 text-sm bg-[#1e1e2e] border border-[#313244] rounded text-[#cdd6f4] focus:outline-none focus:border-blue-500"
                  >
                    <option value="document">Document</option>
                    <option value="index">Search Index</option>
                    <option value="database">Database</option>
                    <option value="api">API</option>
                    <option value="file">File</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#6c7086] mb-1">Priority</label>
                  <input
                    type="number"
                    min="1"
                    value={source.priority}
                    onChange={(e) => updateSource(source.id, { priority: parseInt(e.target.value) })}
                    className="w-full px-2 py-1.5 text-sm bg-[#1e1e2e] border border-[#313244] rounded text-[#cdd6f4] focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#6c7086] mb-1">Source Path / URL</label>
                <input
                  type="text"
                  value={source.source}
                  onChange={(e) => updateSource(source.id, { source: e.target.value })}
                  placeholder="e.g., /documents/research.pdf or https://api.example.com"
                  className="w-full px-2 py-1.5 text-sm bg-[#1e1e2e] border border-[#313244] rounded text-[#cdd6f4] placeholder-[#45475a] focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          );
        })}

        <button
          onClick={addSource}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-[#313244] rounded-lg text-sm text-[#6c7086] hover:border-blue-500 hover:text-blue-400 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Context Source
        </button>
      </div>
    </ConfigPanel>
  );
}

// Tools Configuration Panel
interface ToolsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  tools: ToolConfig[];
  onChange: (tools: ToolConfig[]) => void;
}

const TOOL_TEMPLATES: { type: ToolConfig['type']; name: string; icon: LucideIcon; description: string }[] = [
  { type: 'search', name: 'Web Search', icon: Search, description: 'Search the web for information' },
  { type: 'calculator', name: 'Calculator', icon: Calculator, description: 'Perform mathematical calculations' },
  { type: 'code_interpreter', name: 'Code Interpreter', icon: Code, description: 'Execute Python code' },
  { type: 'web_browser', name: 'Web Browser', icon: Globe, description: 'Browse and interact with websites' },
  { type: 'file_system', name: 'File System', icon: FileCode, description: 'Read and write files' },
  { type: 'api', name: 'API Call', icon: MessageSquare, description: 'Make HTTP API requests' },
];

export function ToolsPanel({ isOpen, onClose, tools, onChange }: ToolsPanelProps) {
  const [localTools, setLocalTools] = useState<ToolConfig[]>(tools);
  const [showTemplates, setShowTemplates] = useState(false);

  const addTool = (template: typeof TOOL_TEMPLATES[0]) => {
    const newTool: ToolConfig = {
      id: `tool-${Date.now()}`,
      name: template.name,
      type: template.type,
      description: template.description,
      requiresApproval: false,
      parameters: {},
    };
    setLocalTools([...localTools, newTool]);
    setShowTemplates(false);
  };

  const removeTool = (id: string) => {
    setLocalTools(localTools.filter(t => t.id !== id));
  };

  const updateTool = (id: string, updates: Partial<ToolConfig>) => {
    setLocalTools(localTools.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const handleSave = () => {
    onChange(localTools);
    onClose();
  };

  const getToolIcon = (type: ToolConfig['type']) => {
    const template = TOOL_TEMPLATES.find(t => t.type === type);
    return template?.icon || Wrench;
  };

  return (
    <ConfigPanel
      isOpen={isOpen}
      onClose={handleSave}
      title="Tools Configuration"
      icon={Wrench}
      iconColor="#34d399"
    >
      <div className="space-y-4">
        <p className="text-sm text-[#6c7086]">
          Configure tools that the agent can use to accomplish tasks.
        </p>

        {localTools.map((tool) => {
          const ToolIcon = getToolIcon(tool.type);
          return (
            <div
              key={tool.id}
              className="p-4 bg-[#11111b] rounded-lg border border-[#313244] space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ToolIcon className="w-4 h-4 text-emerald-400" />
                  <input
                    type="text"
                    value={tool.name}
                    onChange={(e) => updateTool(tool.id, { name: e.target.value })}
                    className="text-sm font-medium text-[#cdd6f4] bg-transparent border-none focus:outline-none"
                  />
                </div>
                <button
                  onClick={() => removeTool(tool.id)}
                  className="p-1 hover:bg-[#313244] rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>

              <div>
                <label className="block text-xs text-[#6c7086] mb-1">Description</label>
                <input
                  type="text"
                  value={tool.description}
                  onChange={(e) => updateTool(tool.id, { description: e.target.value })}
                  className="w-full px-2 py-1.5 text-sm bg-[#1e1e2e] border border-[#313244] rounded text-[#cdd6f4] focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`approval-${tool.id}`}
                  checked={tool.requiresApproval}
                  onChange={(e) => updateTool(tool.id, { requiresApproval: e.target.checked })}
                  className="rounded border-[#313244]"
                />
                <label htmlFor={`approval-${tool.id}`} className="text-xs text-[#a6adc8]">
                  Requires human approval before execution
                </label>
              </div>
            </div>
          );
        })}

        {/* Add Tool Button / Templates */}
        {showTemplates ? (
          <div className="p-3 bg-[#11111b] rounded-lg border border-[#313244]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-[#cdd6f4]">Select a Tool</span>
              <button
                onClick={() => setShowTemplates(false)}
                className="p-1 hover:bg-[#313244] rounded"
              >
                <X className="w-4 h-4 text-[#6c7086]" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {TOOL_TEMPLATES.map((template) => {
                const Icon = template.icon;
                return (
                  <button
                    key={template.type}
                    onClick={() => addTool(template)}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#313244] transition-colors text-left"
                  >
                    <Icon className="w-4 h-4 text-emerald-400" />
                    <div>
                      <p className="text-xs font-medium text-[#cdd6f4]">{template.name}</p>
                      <p className="text-[10px] text-[#6c7086]">{template.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowTemplates(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-[#313244] rounded-lg text-sm text-[#6c7086] hover:border-emerald-500 hover:text-emerald-400 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Tool
          </button>
        )}
      </div>
    </ConfigPanel>
  );
}
