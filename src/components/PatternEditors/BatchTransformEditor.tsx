import { useState } from 'react';
import {
  Plus,
  Trash2,
  Table,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  GripVertical,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import type {
  BatchTransformConfig,
  SchemaColumn,
  ValidationRule,
  RoutingRule,
} from '../../types';

interface BatchTransformEditorProps {
  config: Partial<BatchTransformConfig>;
  onChange: (config: Partial<BatchTransformConfig>) => void;
}

export default function BatchTransformEditor({
  config,
  onChange,
}: BatchTransformEditorProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    inputSchema: true,
    outputSchema: true,
    validation: false,
    routing: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const inputSchema = config.inputSchema || [];
  const outputSchema = config.outputSchema || [];
  const validationRules = config.validationRules || [];
  const routingRules = config.routingRules || [];

  // Schema helpers
  const handleAddColumn = (schemaType: 'input' | 'output') => {
    const newColumn: SchemaColumn = {
      name: '',
      type: 'string',
      required: false,
      description: '',
    };
    if (schemaType === 'input') {
      onChange({ ...config, inputSchema: [...inputSchema, newColumn] });
    } else {
      onChange({ ...config, outputSchema: [...outputSchema, newColumn] });
    }
  };

  const handleUpdateColumn = (
    schemaType: 'input' | 'output',
    index: number,
    updates: Partial<SchemaColumn>
  ) => {
    const schema = schemaType === 'input' ? inputSchema : outputSchema;
    const newSchema = [...schema];
    newSchema[index] = { ...newSchema[index], ...updates };
    if (schemaType === 'input') {
      onChange({ ...config, inputSchema: newSchema });
    } else {
      onChange({ ...config, outputSchema: newSchema });
    }
  };

  const handleRemoveColumn = (schemaType: 'input' | 'output', index: number) => {
    const schema = schemaType === 'input' ? inputSchema : outputSchema;
    if (schemaType === 'input') {
      onChange({ ...config, inputSchema: schema.filter((_, i) => i !== index) });
    } else {
      onChange({ ...config, outputSchema: schema.filter((_, i) => i !== index) });
    }
  };

  // Validation helpers
  const handleAddValidation = () => {
    const newRule: ValidationRule = {
      column: '',
      rule: 'required',
      params: {},
      errorMessage: '',
    };
    onChange({ ...config, validationRules: [...validationRules, newRule] });
  };

  const handleUpdateValidation = (index: number, updates: Partial<ValidationRule>) => {
    const newRules = [...validationRules];
    newRules[index] = { ...newRules[index], ...updates };
    onChange({ ...config, validationRules: newRules });
  };

  const handleRemoveValidation = (index: number) => {
    onChange({
      ...config,
      validationRules: validationRules.filter((_, i) => i !== index),
    });
  };

  // Routing helpers
  const handleAddRouting = () => {
    const newRule: RoutingRule = {
      condition: 'confidence_below',
      threshold: 0.8,
      action: 'hitl_review',
      justificationRequired: false,
    };
    onChange({ ...config, routingRules: [...routingRules, newRule] });
  };

  const handleUpdateRouting = (index: number, updates: Partial<RoutingRule>) => {
    const newRules = [...routingRules];
    newRules[index] = { ...newRules[index], ...updates };
    onChange({ ...config, routingRules: newRules });
  };

  const handleRemoveRouting = (index: number) => {
    onChange({ ...config, routingRules: routingRules.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
        <div className="flex items-center gap-2 text-emerald-400 mb-1">
          <Table className="w-4 h-4" />
          <span className="text-sm font-medium">Batch Transform Pattern</span>
        </div>
        <p className="text-xs text-emerald-300/70">
          Tabular data transformation with schema mapping and validation
        </p>
      </div>

      {/* Input Type Selection */}
      <div>
        <label className="block text-xs font-medium text-[#a6adc8] mb-2">Input Type</label>
        <div className="flex gap-2">
          {(['csv', 'json', 'api'] as const).map((type) => (
            <button
              key={type}
              onClick={() => onChange({ ...config, inputType: type })}
              className={`flex-1 px-3 py-2 text-sm rounded-md border uppercase transition-colors ${
                config.inputType === type
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                  : 'bg-[#1e1e2e] border-[#313244] text-[#6c7086] hover:border-[#45475a]'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Processing Settings */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-[10px] text-[#6c7086] mb-1">Batch Size</label>
          <input
            type="number"
            min={1}
            max={1000}
            value={config.batchSize ?? 100}
            onChange={(e) => onChange({ ...config, batchSize: Number(e.target.value) })}
            className="w-full px-2 py-1.5 bg-[#1e1e2e] border border-[#313244] rounded text-xs text-[#cdd6f4]"
          />
        </div>
        <div>
          <label className="block text-[10px] text-[#6c7086] mb-1">Parallelism</label>
          <input
            type="number"
            min={1}
            max={16}
            value={config.parallelism ?? 4}
            onChange={(e) => onChange({ ...config, parallelism: Number(e.target.value) })}
            className="w-full px-2 py-1.5 bg-[#1e1e2e] border border-[#313244] rounded text-xs text-[#cdd6f4]"
          />
        </div>
        <div>
          <label className="block text-[10px] text-[#6c7086] mb-1">Grounding</label>
          <select
            value={config.groundingMode ?? 'none'}
            onChange={(e) =>
              onChange({
                ...config,
                groundingMode: e.target.value as BatchTransformConfig['groundingMode'],
              })
            }
            className="w-full px-2 py-1.5 bg-[#1e1e2e] border border-[#313244] rounded text-xs text-[#cdd6f4]"
          >
            <option value="none">None</option>
            <option value="web">Web</option>
            <option value="index">Index</option>
          </select>
        </div>
      </div>

      {/* Schema Mapping Visual */}
      <div className="p-3 bg-[#1e1e2e] border border-[#313244] rounded-lg">
        <div className="flex items-center justify-center gap-4 mb-3">
          <div className="text-xs font-medium text-[#a6adc8]">
            {inputSchema.length} input columns
          </div>
          <ArrowRight className="w-4 h-4 text-emerald-400" />
          <div className="text-xs font-medium text-[#a6adc8]">
            {outputSchema.length} output columns
          </div>
        </div>
        <div className="h-1 bg-[#313244] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-sky-500 transition-all"
            style={{
              width: `${Math.min(100, (inputSchema.length + outputSchema.length) * 10)}%`,
            }}
          />
        </div>
      </div>

      {/* Input Schema */}
      <CollapsibleSection
        title="Input Schema"
        count={inputSchema.length}
        expanded={expandedSections.inputSchema}
        onToggle={() => toggleSection('inputSchema')}
        color="emerald"
      >
        <SchemaEditor
          columns={inputSchema}
          onAdd={() => handleAddColumn('input')}
          onUpdate={(idx, updates) => handleUpdateColumn('input', idx, updates)}
          onRemove={(idx) => handleRemoveColumn('input', idx)}
          color="emerald"
        />
      </CollapsibleSection>

      {/* Output Schema */}
      <CollapsibleSection
        title="Output Schema"
        count={outputSchema.length}
        expanded={expandedSections.outputSchema}
        onToggle={() => toggleSection('outputSchema')}
        color="sky"
      >
        <SchemaEditor
          columns={outputSchema}
          onAdd={() => handleAddColumn('output')}
          onUpdate={(idx, updates) => handleUpdateColumn('output', idx, updates)}
          onRemove={(idx) => handleRemoveColumn('output', idx)}
          color="sky"
        />
      </CollapsibleSection>

      {/* Validation Rules */}
      <CollapsibleSection
        title="Validation Rules"
        count={validationRules.length}
        expanded={expandedSections.validation}
        onToggle={() => toggleSection('validation')}
        color="amber"
      >
        <div className="space-y-2">
          {validationRules.map((rule, index) => (
            <div
              key={index}
              className="p-2 bg-[#1e1e2e] border border-[#313244] rounded-md space-y-2"
            >
              <div className="flex items-center gap-2">
                <select
                  value={rule.column}
                  onChange={(e) => handleUpdateValidation(index, { column: e.target.value })}
                  className="flex-1 px-2 py-1 bg-[#11111b] border border-[#313244] rounded text-xs text-[#cdd6f4]"
                >
                  <option value="">Select column...</option>
                  {[...inputSchema, ...outputSchema].map((col) => (
                    <option key={col.name} value={col.name}>
                      {col.name || '(unnamed)'}
                    </option>
                  ))}
                </select>
                <select
                  value={rule.rule}
                  onChange={(e) =>
                    handleUpdateValidation(index, {
                      rule: e.target.value as ValidationRule['rule'],
                    })
                  }
                  className="w-28 px-2 py-1 bg-[#11111b] border border-[#313244] rounded text-xs text-[#cdd6f4]"
                >
                  <option value="required">Required</option>
                  <option value="format">Format</option>
                  <option value="range">Range</option>
                  <option value="enum">Enum</option>
                  <option value="custom">Custom</option>
                </select>
                <button
                  onClick={() => handleRemoveValidation(index)}
                  className="p-1 text-[#6c7086] hover:text-red-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <input
                type="text"
                value={rule.errorMessage}
                onChange={(e) =>
                  handleUpdateValidation(index, { errorMessage: e.target.value })
                }
                placeholder="Error message..."
                className="w-full px-2 py-1 bg-[#11111b] border border-[#313244] rounded text-xs text-[#cdd6f4] placeholder-[#45475a]"
              />
            </div>
          ))}
          <button
            onClick={handleAddValidation}
            className="w-full px-3 py-2 text-sm text-amber-400 border border-dashed border-amber-500/30 rounded-md hover:bg-amber-500/10 transition-colors flex items-center justify-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Validation Rule
          </button>
        </div>
      </CollapsibleSection>

      {/* Routing Rules */}
      <CollapsibleSection
        title="Routing Rules"
        count={routingRules.length}
        expanded={expandedSections.routing}
        onToggle={() => toggleSection('routing')}
        color="purple"
      >
        <div className="space-y-2">
          {routingRules.map((rule, index) => (
            <div
              key={index}
              className="p-2 bg-[#1e1e2e] border border-[#313244] rounded-md space-y-2"
            >
              <div className="flex items-center gap-2">
                <select
                  value={rule.condition}
                  onChange={(e) =>
                    handleUpdateRouting(index, {
                      condition: e.target.value as RoutingRule['condition'],
                    })
                  }
                  className="flex-1 px-2 py-1 bg-[#11111b] border border-[#313244] rounded text-xs text-[#cdd6f4]"
                >
                  <option value="confidence_below">Confidence Below</option>
                  <option value="validation_failed">Validation Failed</option>
                  <option value="custom">Custom Condition</option>
                </select>
                {rule.condition === 'confidence_below' && (
                  <input
                    type="number"
                    min={0}
                    max={1}
                    step={0.1}
                    value={rule.threshold ?? 0.8}
                    onChange={(e) =>
                      handleUpdateRouting(index, { threshold: Number(e.target.value) })
                    }
                    className="w-16 px-2 py-1 bg-[#11111b] border border-[#313244] rounded text-xs text-[#cdd6f4]"
                  />
                )}
                <button
                  onClick={() => handleRemoveRouting(index)}
                  className="p-1 text-[#6c7086] hover:text-red-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={rule.action}
                  onChange={(e) =>
                    handleUpdateRouting(index, {
                      action: e.target.value as RoutingRule['action'],
                    })
                  }
                  className="flex-1 px-2 py-1 bg-[#11111b] border border-[#313244] rounded text-xs text-[#cdd6f4]"
                >
                  <option value="auto_approve">Auto Approve</option>
                  <option value="hitl_review">HITL Review</option>
                  <option value="reject">Reject</option>
                </select>
                <label className="flex items-center gap-1 text-xs text-[#6c7086]">
                  <input
                    type="checkbox"
                    checked={rule.justificationRequired}
                    onChange={(e) =>
                      handleUpdateRouting(index, { justificationRequired: e.target.checked })
                    }
                    className="w-3 h-3 rounded border-[#313244]"
                  />
                  Justification
                </label>
              </div>
              {/* Route visualization */}
              <div className="flex items-center gap-1 text-[10px] text-[#45475a]">
                {rule.action === 'auto_approve' && (
                  <CheckCircle2 className="w-3 h-3 text-green-400" />
                )}
                {rule.action === 'hitl_review' && (
                  <AlertCircle className="w-3 h-3 text-amber-400" />
                )}
                {rule.action === 'reject' && (
                  <XCircle className="w-3 h-3 text-red-400" />
                )}
                <span>
                  {rule.action === 'auto_approve' && 'Automatically pass through'}
                  {rule.action === 'hitl_review' && 'Route to human review'}
                  {rule.action === 'reject' && 'Automatically reject'}
                </span>
              </div>
            </div>
          ))}
          <button
            onClick={handleAddRouting}
            className="w-full px-3 py-2 text-sm text-purple-400 border border-dashed border-purple-500/30 rounded-md hover:bg-purple-500/10 transition-colors flex items-center justify-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Routing Rule
          </button>
        </div>
      </CollapsibleSection>

      {/* Confidence Threshold */}
      <div>
        <label className="block text-xs font-medium text-[#a6adc8] mb-1">
          Confidence Threshold
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={config.confidenceThreshold ?? 0.85}
            onChange={(e) =>
              onChange({ ...config, confidenceThreshold: Number(e.target.value) })
            }
            className="flex-1 h-2 bg-[#313244] rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-sm text-[#cdd6f4] w-12 text-right">
            {((config.confidenceThreshold ?? 0.85) * 100).toFixed(0)}%
          </span>
        </div>
        <p className="text-[10px] text-[#45475a] mt-1">
          Rows below this threshold will be routed according to your rules
        </p>
      </div>

      {/* Schema Validation */}
      {inputSchema.length === 0 && outputSchema.length === 0 && (
        <div className="p-3 rounded-md bg-amber-500/10 border border-amber-500/30 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-300">
            Define input and output schemas to enable this transformation
          </p>
        </div>
      )}
    </div>
  );
}

interface SchemaEditorProps {
  columns: SchemaColumn[];
  onAdd: () => void;
  onUpdate: (index: number, updates: Partial<SchemaColumn>) => void;
  onRemove: (index: number) => void;
  color: 'emerald' | 'sky';
}

function SchemaEditor({ columns, onAdd, onUpdate, onRemove, color }: SchemaEditorProps) {
  return (
    <div className="space-y-2">
      {columns.map((column, index) => (
        <div
          key={index}
          className="flex items-center gap-2 p-2 bg-[#1e1e2e] border border-[#313244] rounded-md"
        >
          <GripVertical className="w-3 h-3 text-[#45475a] cursor-grab" />
          <input
            type="text"
            value={column.name}
            onChange={(e) => onUpdate(index, { name: e.target.value })}
            placeholder="Column name"
            className="flex-1 px-2 py-1 bg-[#11111b] border border-[#313244] rounded text-xs text-[#cdd6f4] placeholder-[#45475a]"
          />
          <select
            value={column.type}
            onChange={(e) =>
              onUpdate(index, { type: e.target.value as SchemaColumn['type'] })
            }
            className="w-20 px-2 py-1 bg-[#11111b] border border-[#313244] rounded text-xs text-[#cdd6f4]"
          >
            <option value="string">String</option>
            <option value="number">Number</option>
            <option value="boolean">Boolean</option>
            <option value="date">Date</option>
            <option value="object">Object</option>
            <option value="array">Array</option>
          </select>
          <button
            onClick={() => onUpdate(index, { required: !column.required })}
            className={`px-2 py-1 text-[10px] rounded border transition-colors ${
              column.required
                ? 'bg-red-500/20 border-red-500/50 text-red-300'
                : 'bg-[#11111b] border-[#313244] text-[#6c7086]'
            }`}
          >
            {column.required ? 'Required' : 'Optional'}
          </button>
          <button onClick={() => onRemove(index)} className="p-1 text-[#6c7086] hover:text-red-400">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <button
        onClick={onAdd}
        className={`w-full px-3 py-2 text-sm text-${color}-400 border border-dashed border-${color}-500/30 rounded-md hover:bg-${color}-500/10 transition-colors flex items-center justify-center gap-1`}
      >
        <Plus className="w-4 h-4" />
        Add Column
      </button>
    </div>
  );
}

interface CollapsibleSectionProps {
  title: string;
  count?: number;
  expanded: boolean;
  onToggle: () => void;
  color: 'emerald' | 'sky' | 'amber' | 'purple';
  children: React.ReactNode;
}

function CollapsibleSection({
  title,
  count,
  expanded,
  onToggle,
  children,
}: CollapsibleSectionProps) {
  return (
    <div className="border border-[#313244] rounded-md overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2 bg-[#1e1e2e] hover:bg-[#262637] transition-colors"
      >
        <div className="flex items-center gap-2">
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-[#6c7086]" />
          ) : (
            <ChevronRight className="w-4 h-4 text-[#6c7086]" />
          )}
          <span className="text-xs font-medium text-[#a6adc8]">{title}</span>
        </div>
        {count !== undefined && <span className="text-xs text-[#45475a]">{count}</span>}
      </button>
      {expanded && <div className="p-3 bg-[#11111b]">{children}</div>}
    </div>
  );
}
