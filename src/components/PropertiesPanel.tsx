import { useState } from 'react';
import {
  X,
  Settings,
  Code,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Check,
} from 'lucide-react';
import type { AgentNode, AgentPatternType, ConfigField } from '../types';
import { nodeConfigs } from '../utils/nodeConfig';
import Editor from '@monaco-editor/react';

interface PropertiesPanelProps {
  node: AgentNode | null;
  onUpdate: (nodeId: string, data: Partial<AgentNode['data']>) => void;
  onClose: () => void;
}

export default function PropertiesPanel({
  node,
  onUpdate,
  onClose,
}: PropertiesPanelProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'code'>('config');

  if (!node) return null;

  const config = nodeConfigs[node.data.type as AgentPatternType];
  const basicFields = config.configSchema.filter((f) => !f.advanced);
  const advancedFields = config.configSchema.filter((f) => f.advanced);

  const handleConfigChange = (key: string, value: unknown) => {
    onUpdate(node.id, {
      config: {
        ...node.data.config,
        [key]: value,
      },
    });
  };

  const handleLabelChange = (label: string) => {
    onUpdate(node.id, { label });
  };

  const handleCodeOverrideChange = (code: string | undefined) => {
    onUpdate(node.id, {
      codeOverride: code,
      hasCodeOverride: Boolean(code && code.trim()),
    });
  };

  return (
    <div className="w-80 bg-[#181825] border-l border-[#313244] flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#313244]">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-[#6c7086]" />
          <h3 className="font-medium text-[#cdd6f4]">Properties</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-[#313244] transition-colors"
        >
          <X className="w-4 h-4 text-[#6c7086]" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#313244]">
        <button
          onClick={() => setActiveTab('config')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'config'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-[#6c7086] hover:text-[#a6adc8]'
          }`}
        >
          Configuration
        </button>
        <button
          onClick={() => setActiveTab('code')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
            activeTab === 'code'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-[#6c7086] hover:text-[#a6adc8]'
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          Code
          {node.data.hasCodeOverride && (
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'config' ? (
          <div className="p-4 space-y-4">
            {/* Node Label */}
            <div>
              <label className="block text-xs font-medium text-[#a6adc8] mb-1">
                Node Name
              </label>
              <input
                type="text"
                value={node.data.label}
                onChange={(e) => handleLabelChange(e.target.value)}
                className="w-full px-3 py-2 bg-[#1e1e2e] border border-[#313244] rounded-md text-sm text-[#cdd6f4] focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Node Type Info */}
            <div className="p-3 rounded-md bg-[#1e1e2e] border border-[#313244]">
              <p className="text-xs font-medium text-[#a6adc8]">{config.label}</p>
              <p className="text-xs text-[#6c7086] mt-1">{config.description}</p>
            </div>

            {/* Basic Fields */}
            {basicFields.map((field) => (
              <FieldEditor
                key={field.key}
                field={field}
                value={node.data.config[field.key]}
                onChange={(value) => handleConfigChange(field.key, value)}
              />
            ))}

            {/* Advanced Fields Toggle */}
            {advancedFields.length > 0 && (
              <>
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#6c7086] hover:text-[#a6adc8] transition-colors"
                >
                  {showAdvanced ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                  Advanced Settings ({advancedFields.length})
                </button>

                {showAdvanced &&
                  advancedFields.map((field) => (
                    <FieldEditor
                      key={field.key}
                      field={field}
                      value={node.data.config[field.key]}
                      onChange={(value) => handleConfigChange(field.key, value)}
                    />
                  ))}
              </>
            )}

            {/* Validation Errors */}
            {node.data.validationErrors && node.data.validationErrors.length > 0 && (
              <div className="p-3 rounded-md bg-red-500/10 border border-red-500/30">
                <div className="flex items-center gap-2 text-red-400 mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">Validation Issues</span>
                </div>
                <ul className="space-y-1">
                  {node.data.validationErrors.map((error, i) => (
                    <li key={i} className="text-xs text-red-300">
                      • {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col">
            {/* Code Override Warning */}
            {node.data.hasCodeOverride && (
              <div className="p-3 bg-amber-500/10 border-b border-amber-500/30 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-amber-200">
                  <p className="font-medium">Code Override Active</p>
                  <p className="text-amber-300/70 mt-0.5">
                    This node has custom code that may not round-trip back to visual mode.
                  </p>
                </div>
              </div>
            )}

            {/* Code Editor */}
            <div className="flex-1 min-h-[300px]">
              <Editor
                height="100%"
                defaultLanguage="python"
                theme="vs-dark"
                value={node.data.codeOverride || getDefaultCode(node)}
                onChange={(value) => handleCodeOverrideChange(value)}
                options={{
                  minimap: { enabled: false },
                  fontSize: 12,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  padding: { top: 12 },
                }}
              />
            </div>

            {/* Code Actions */}
            <div className="p-3 border-t border-[#313244] flex gap-2">
              <button
                onClick={() => handleCodeOverrideChange(undefined)}
                disabled={!node.data.hasCodeOverride}
                className="flex-1 px-3 py-2 text-xs font-medium rounded bg-[#313244] text-[#a6adc8] hover:bg-[#45475a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Reset to Default
              </button>
              <button
                className="px-3 py-2 text-xs font-medium rounded bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                Apply
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface FieldEditorProps {
  field: ConfigField;
  value: unknown;
  onChange: (value: unknown) => void;
}

function FieldEditor({ field, value, onChange }: FieldEditorProps) {
  const effectiveValue = value ?? field.defaultValue ?? '';

  return (
    <div>
      <label className="block text-xs font-medium text-[#a6adc8] mb-1">
        {field.label}
      </label>

      {field.type === 'text' && (
        <input
          type="text"
          value={String(effectiveValue)}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className="w-full px-3 py-2 bg-[#1e1e2e] border border-[#313244] rounded-md text-sm text-[#cdd6f4] placeholder-[#45475a] focus:outline-none focus:border-blue-500"
        />
      )}

      {field.type === 'textarea' && (
        <textarea
          value={String(effectiveValue)}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={3}
          className="w-full px-3 py-2 bg-[#1e1e2e] border border-[#313244] rounded-md text-sm text-[#cdd6f4] placeholder-[#45475a] focus:outline-none focus:border-blue-500 resize-none"
        />
      )}

      {field.type === 'select' && (
        <select
          value={String(effectiveValue)}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 bg-[#1e1e2e] border border-[#313244] rounded-md text-sm text-[#cdd6f4] focus:outline-none focus:border-blue-500"
        >
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}

      {field.type === 'number' && (
        <input
          type="number"
          value={Number(effectiveValue)}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full px-3 py-2 bg-[#1e1e2e] border border-[#313244] rounded-md text-sm text-[#cdd6f4] focus:outline-none focus:border-blue-500"
        />
      )}

      {field.type === 'boolean' && (
        <button
          onClick={() => onChange(!effectiveValue)}
          className={`w-full px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            effectiveValue
              ? 'bg-blue-600 text-white'
              : 'bg-[#1e1e2e] border border-[#313244] text-[#6c7086]'
          }`}
        >
          {effectiveValue ? 'Enabled' : 'Disabled'}
        </button>
      )}

      {field.type === 'json' && (
        <textarea
          value={
            typeof effectiveValue === 'object'
              ? JSON.stringify(effectiveValue, null, 2)
              : String(effectiveValue)
          }
          onChange={(e) => {
            try {
              onChange(JSON.parse(e.target.value));
            } catch {
              // Keep as string if not valid JSON
              onChange(e.target.value);
            }
          }}
          placeholder={field.placeholder}
          rows={4}
          className="w-full px-3 py-2 bg-[#1e1e2e] border border-[#313244] rounded-md text-sm text-[#cdd6f4] placeholder-[#45475a] focus:outline-none focus:border-blue-500 resize-none font-mono"
        />
      )}

      {field.type === 'code' && (
        <div className="h-32 border border-[#313244] rounded-md overflow-hidden">
          <Editor
            height="100%"
            defaultLanguage="python"
            theme="vs-dark"
            value={String(effectiveValue)}
            onChange={(value) => onChange(value)}
            options={{
              minimap: { enabled: false },
              fontSize: 11,
              lineNumbers: 'off',
              scrollBeyondLastLine: false,
              wordWrap: 'on',
            }}
          />
        </div>
      )}

      {field.description && (
        <p className="text-xs text-[#45475a] mt-1">{field.description}</p>
      )}
    </div>
  );
}

function getDefaultCode(node: AgentNode): string {
  const nodeType = node.data.type;
  const label = node.data.label;

  return `# ${label} Node
# Type: ${nodeType}
# Edit this code to customize behavior

async def execute(self, context: dict) -> dict:
    """
    Custom implementation for ${label}

    Args:
        context: Contains 'input' and 'results' from previous nodes

    Returns:
        dict: Output data to pass to next nodes
    """
    # Your custom logic here
    input_data = context.get("input", {})

    result = {
        "status": "success",
        "data": input_data
    }

    return result
`;
}
