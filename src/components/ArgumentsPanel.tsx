import { useState, useCallback } from 'react';
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Settings2,
  ArrowRightFromLine,
  ArrowLeftToLine,
  Copy,
  AlertCircle,
} from 'lucide-react';
import type { FlowArgument, ArgumentType, FlowArgumentsConfig } from '../types/execution';

interface ArgumentsPanelProps {
  flowArguments: FlowArgumentsConfig;
  onUpdateArguments: (args: FlowArgumentsConfig) => void;
  selectedNodeId?: string | null;
  nodeArguments?: Record<string, FlowArgumentsConfig>;
  onUpdateNodeArguments?: (nodeId: string, args: FlowArgumentsConfig) => void;
}

const ARGUMENT_TYPES: { value: ArgumentType; label: string }[] = [
  { value: 'string', label: 'String' },
  { value: 'number', label: 'Number' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'object', label: 'Object' },
  { value: 'array', label: 'Array' },
  { value: 'any', label: 'Any' },
];

interface ArgumentEditorProps {
  argument: FlowArgument;
  onUpdate: (arg: FlowArgument) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

function ArgumentEditor({ argument, onUpdate, onDelete, onDuplicate }: ArgumentEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-[#181825] border border-[#313244] rounded-lg overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#1e1e2e] transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <GripVertical className="w-3.5 h-3.5 text-[#45475a] cursor-grab" />
        {isExpanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-[#6c7086]" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-[#6c7086]" />
        )}
        <span className="text-sm text-[#cdd6f4] font-medium flex-1 truncate">
          {argument.name || 'Unnamed'}
        </span>
        <span className="text-xs text-[#45475a] bg-[#313244] px-1.5 py-0.5 rounded">
          {argument.type}
        </span>
        {argument.required && (
          <span className="text-xs text-red-400">*</span>
        )}
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-3 py-3 border-t border-[#313244] space-y-3">
          {/* Name */}
          <div>
            <label className="block text-xs text-[#6c7086] mb-1">Name</label>
            <input
              type="text"
              value={argument.name}
              onChange={(e) => onUpdate({ ...argument, name: e.target.value })}
              className="w-full px-2 py-1.5 bg-[#1e1e2e] border border-[#313244] rounded text-sm text-[#cdd6f4] focus:outline-none focus:border-purple-500"
              placeholder="argument_name"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-xs text-[#6c7086] mb-1">Type</label>
            <select
              value={argument.type}
              onChange={(e) => onUpdate({ ...argument, type: e.target.value as ArgumentType })}
              className="w-full px-2 py-1.5 bg-[#1e1e2e] border border-[#313244] rounded text-sm text-[#cdd6f4] focus:outline-none focus:border-purple-500"
            >
              {ARGUMENT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs text-[#6c7086] mb-1">Description</label>
            <textarea
              value={argument.description || ''}
              onChange={(e) => onUpdate({ ...argument, description: e.target.value })}
              className="w-full px-2 py-1.5 bg-[#1e1e2e] border border-[#313244] rounded text-sm text-[#cdd6f4] resize-none focus:outline-none focus:border-purple-500"
              rows={2}
              placeholder="Describe this argument..."
            />
          </div>

          {/* Required Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-xs text-[#6c7086]">Required</label>
            <button
              onClick={() => onUpdate({ ...argument, required: !argument.required })}
              className={`w-10 h-5 rounded-full transition-colors ${
                argument.required ? 'bg-purple-600' : 'bg-[#313244]'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  argument.required ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Default Value */}
          <div>
            <label className="block text-xs text-[#6c7086] mb-1">Default Value</label>
            {argument.type === 'boolean' ? (
              <select
                value={String(argument.defaultValue ?? '')}
                onChange={(e) =>
                  onUpdate({
                    ...argument,
                    defaultValue: e.target.value === '' ? undefined : e.target.value === 'true',
                  })
                }
                className="w-full px-2 py-1.5 bg-[#1e1e2e] border border-[#313244] rounded text-sm text-[#cdd6f4] focus:outline-none focus:border-purple-500"
              >
                <option value="">No default</option>
                <option value="true">true</option>
                <option value="false">false</option>
              </select>
            ) : argument.type === 'number' ? (
              <input
                type="number"
                value={argument.defaultValue !== undefined ? String(argument.defaultValue) : ''}
                onChange={(e) =>
                  onUpdate({
                    ...argument,
                    defaultValue: e.target.value === '' ? undefined : parseFloat(e.target.value),
                  })
                }
                className="w-full px-2 py-1.5 bg-[#1e1e2e] border border-[#313244] rounded text-sm text-[#cdd6f4] focus:outline-none focus:border-purple-500"
                placeholder="Enter default number..."
              />
            ) : argument.type === 'object' || argument.type === 'array' ? (
              <textarea
                value={
                  argument.defaultValue !== undefined
                    ? JSON.stringify(argument.defaultValue, null, 2)
                    : ''
                }
                onChange={(e) => {
                  try {
                    const parsed = e.target.value ? JSON.parse(e.target.value) : undefined;
                    onUpdate({ ...argument, defaultValue: parsed });
                  } catch {
                    // Allow invalid JSON during editing
                  }
                }}
                className="w-full px-2 py-1.5 bg-[#1e1e2e] border border-[#313244] rounded text-sm font-mono text-[#cdd6f4] resize-none focus:outline-none focus:border-purple-500"
                rows={3}
                placeholder={argument.type === 'array' ? '[]' : '{}'}
              />
            ) : (
              <input
                type="text"
                value={String(argument.defaultValue ?? '')}
                onChange={(e) =>
                  onUpdate({
                    ...argument,
                    defaultValue: e.target.value || undefined,
                  })
                }
                className="w-full px-2 py-1.5 bg-[#1e1e2e] border border-[#313244] rounded text-sm text-[#cdd6f4] focus:outline-none focus:border-purple-500"
                placeholder="Enter default value..."
              />
            )}
          </div>

          {/* Examples */}
          <div>
            <label className="block text-xs text-[#6c7086] mb-1">Example Values (comma-separated)</label>
            <input
              type="text"
              value={argument.examples?.join(', ') || ''}
              onChange={(e) => {
                const examples = e.target.value
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean);
                onUpdate({ ...argument, examples: examples.length > 0 ? examples : undefined });
              }}
              className="w-full px-2 py-1.5 bg-[#1e1e2e] border border-[#313244] rounded text-sm text-[#cdd6f4] focus:outline-none focus:border-purple-500"
              placeholder="example1, example2, ..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#313244]">
            <button
              onClick={onDuplicate}
              className="flex items-center gap-1 px-2 py-1 text-xs text-[#6c7086] hover:text-[#a6adc8] transition-colors"
            >
              <Copy className="w-3 h-3" />
              Duplicate
            </button>
            <button
              onClick={onDelete}
              className="flex items-center gap-1 px-2 py-1 text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface ArgumentsSectionProps {
  title: string;
  icon: React.ReactNode;
  arguments: FlowArgument[];
  onUpdate: (args: FlowArgument[]) => void;
  emptyMessage: string;
}

function ArgumentsSection({ title, icon, arguments: args, onUpdate, emptyMessage }: ArgumentsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleAddArgument = useCallback(() => {
    const newArg: FlowArgument = {
      id: `arg-${Date.now()}`,
      name: `argument_${args.length + 1}`,
      type: 'string',
      required: false,
    };
    onUpdate([...args, newArg]);
  }, [args, onUpdate]);

  const handleUpdateArgument = useCallback(
    (index: number, arg: FlowArgument) => {
      const updated = [...args];
      updated[index] = arg;
      onUpdate(updated);
    },
    [args, onUpdate]
  );

  const handleDeleteArgument = useCallback(
    (index: number) => {
      const updated = args.filter((_, i) => i !== index);
      onUpdate(updated);
    },
    [args, onUpdate]
  );

  const handleDuplicateArgument = useCallback(
    (index: number) => {
      const original = args[index];
      const duplicate: FlowArgument = {
        ...original,
        id: `arg-${Date.now()}`,
        name: `${original.name}_copy`,
      };
      const updated = [...args];
      updated.splice(index + 1, 0, duplicate);
      onUpdate(updated);
    },
    [args, onUpdate]
  );

  return (
    <div className="border border-[#313244] rounded-lg overflow-hidden">
      {/* Section Header */}
      <div
        className="flex items-center gap-2 px-3 py-2 bg-[#1e1e2e] cursor-pointer hover:bg-[#252536] transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-[#6c7086]" />
        ) : (
          <ChevronRight className="w-4 h-4 text-[#6c7086]" />
        )}
        {icon}
        <span className="text-sm font-medium text-[#cdd6f4] flex-1">{title}</span>
        <span className="text-xs text-[#45475a] bg-[#313244] px-2 py-0.5 rounded-full">
          {args.length}
        </span>
      </div>

      {/* Section Content */}
      {isExpanded && (
        <div className="p-3 space-y-2 bg-[#11111b]">
          {args.length === 0 ? (
            <div className="text-center py-4">
              <AlertCircle className="w-8 h-8 text-[#45475a] mx-auto mb-2" />
              <p className="text-xs text-[#6c7086]">{emptyMessage}</p>
            </div>
          ) : (
            args.map((arg, index) => (
              <ArgumentEditor
                key={arg.id}
                argument={arg}
                onUpdate={(updated) => handleUpdateArgument(index, updated)}
                onDelete={() => handleDeleteArgument(index)}
                onDuplicate={() => handleDuplicateArgument(index)}
              />
            ))
          )}

          <button
            onClick={handleAddArgument}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-[#6c7086] border border-dashed border-[#313244] rounded-lg hover:border-purple-500 hover:text-purple-400 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Argument
          </button>
        </div>
      )}
    </div>
  );
}

export default function ArgumentsPanel({
  flowArguments,
  onUpdateArguments,
  selectedNodeId,
  nodeArguments,
  onUpdateNodeArguments,
}: ArgumentsPanelProps) {
  const [showNodeArgs, setShowNodeArgs] = useState(false);

  const selectedNodeArgs = selectedNodeId && nodeArguments ? nodeArguments[selectedNodeId] : null;

  const handleUpdateFlowInputs = useCallback(
    (inputs: FlowArgument[]) => {
      onUpdateArguments({ ...flowArguments, inputs });
    },
    [flowArguments, onUpdateArguments]
  );

  const handleUpdateFlowOutputs = useCallback(
    (outputs: FlowArgument[]) => {
      onUpdateArguments({ ...flowArguments, outputs });
    },
    [flowArguments, onUpdateArguments]
  );

  const handleUpdateNodeInputs = useCallback(
    (inputs: FlowArgument[]) => {
      if (selectedNodeId && selectedNodeArgs && onUpdateNodeArguments) {
        onUpdateNodeArguments(selectedNodeId, { ...selectedNodeArgs, inputs });
      }
    },
    [selectedNodeId, selectedNodeArgs, onUpdateNodeArguments]
  );

  const handleUpdateNodeOutputs = useCallback(
    (outputs: FlowArgument[]) => {
      if (selectedNodeId && selectedNodeArgs && onUpdateNodeArguments) {
        onUpdateNodeArguments(selectedNodeId, { ...selectedNodeArgs, outputs });
      }
    },
    [selectedNodeId, selectedNodeArgs, onUpdateNodeArguments]
  );

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Settings2 className="w-5 h-5 text-purple-400" />
        <h3 className="text-sm font-semibold text-[#cdd6f4]">Flow Arguments</h3>
      </div>

      {/* Tab Toggle for Node vs Flow */}
      {selectedNodeId && nodeArguments && (
        <div className="flex items-center gap-1 p-1 bg-[#181825] rounded-lg">
          <button
            onClick={() => setShowNodeArgs(false)}
            className={`flex-1 px-3 py-1.5 text-xs rounded-md transition-colors ${
              !showNodeArgs
                ? 'bg-[#313244] text-[#cdd6f4]'
                : 'text-[#6c7086] hover:text-[#a6adc8]'
            }`}
          >
            Flow
          </button>
          <button
            onClick={() => setShowNodeArgs(true)}
            className={`flex-1 px-3 py-1.5 text-xs rounded-md transition-colors ${
              showNodeArgs
                ? 'bg-[#313244] text-[#cdd6f4]'
                : 'text-[#6c7086] hover:text-[#a6adc8]'
            }`}
          >
            Selected Node
          </button>
        </div>
      )}

      {/* Flow Arguments */}
      {!showNodeArgs && (
        <div className="space-y-3">
          <ArgumentsSection
            title="Inputs"
            icon={<ArrowRightFromLine className="w-4 h-4 text-green-400" />}
            arguments={flowArguments.inputs}
            onUpdate={handleUpdateFlowInputs}
            emptyMessage="No input arguments defined. Add arguments to accept input when running the flow."
          />

          <ArgumentsSection
            title="Outputs"
            icon={<ArrowLeftToLine className="w-4 h-4 text-blue-400" />}
            arguments={flowArguments.outputs}
            onUpdate={handleUpdateFlowOutputs}
            emptyMessage="No output arguments defined. Add arguments to specify the flow's return values."
          />
        </div>
      )}

      {/* Node Arguments */}
      {showNodeArgs && selectedNodeArgs && (
        <div className="space-y-3">
          <div className="text-xs text-[#6c7086] px-1">
            Configuring arguments for selected node
          </div>

          <ArgumentsSection
            title="Node Inputs"
            icon={<ArrowRightFromLine className="w-4 h-4 text-green-400" />}
            arguments={selectedNodeArgs.inputs}
            onUpdate={handleUpdateNodeInputs}
            emptyMessage="No input arguments defined for this node."
          />

          <ArgumentsSection
            title="Node Outputs"
            icon={<ArrowLeftToLine className="w-4 h-4 text-blue-400" />}
            arguments={selectedNodeArgs.outputs}
            onUpdate={handleUpdateNodeOutputs}
            emptyMessage="No output arguments defined for this node."
          />
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-[#45475a] leading-relaxed px-1">
        <p className="mb-1">
          <strong className="text-[#6c7086]">Inputs:</strong> Arguments passed to the flow when executed
        </p>
        <p>
          <strong className="text-[#6c7086]">Outputs:</strong> Values returned by the flow after completion
        </p>
      </div>
    </div>
  );
}
