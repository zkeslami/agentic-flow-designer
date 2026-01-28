import { useState } from 'react';
import {
  X,
  Table,
  FileText,
  Play,
  FlaskConical,
  BarChart3,
  History,
  Trash2,
  Upload,
  Download,
  Check,
  AlertCircle,
  Clock,
  RefreshCw,
  Eye,
  Edit3,
  Key,
  Tag,
  Filter,
  SlidersHorizontal,
  Users,
  CheckCircle2,
  XCircle,
  Columns,
  Rows,
  FileSpreadsheet,
  Globe,
  Database,
  Sparkles,
} from 'lucide-react';
import type { BatchTransformConfig, SchemaColumn } from '../../types';

type EditorTab =
  | 'input'
  | 'labeling'
  | 'prompt'
  | 'test'
  | 'evaluate'
  | 'scoring'
  | 'runs';

interface BatchTransformFullEditorProps {
  isOpen: boolean;
  onClose: () => void;
  config: Partial<BatchTransformConfig>;
  onChange: (config: Partial<BatchTransformConfig>) => void;
  nodeLabel: string;
}

// Mock data for demonstration
const mockInputData = [
  { id: 1, company: 'Acme Corp', website: 'acme.com', industry: '', employees: '500', revenue: '' },
  { id: 2, company: 'TechStart Inc', website: 'techstart.io', industry: '', employees: '50', revenue: '' },
  { id: 3, company: 'Global Systems', website: 'globalsys.net', industry: '', employees: '2000', revenue: '' },
  { id: 4, company: 'DataFlow Labs', website: 'dataflow.ai', industry: '', employees: '150', revenue: '' },
  { id: 5, company: 'CloudNine Solutions', website: 'cloudnine.co', industry: '', employees: '300', revenue: '' },
];

const mockOutputData = [
  { id: 1, company: 'Acme Corp', industry: 'Manufacturing', employees: 500, revenue: '$50M', confidence: 0.95 },
  { id: 2, company: 'TechStart Inc', industry: 'Software', employees: 50, revenue: '$5M', confidence: 0.88 },
  { id: 3, company: 'Global Systems', industry: 'Consulting', employees: 2000, revenue: '$200M', confidence: 0.72 },
  { id: 4, company: 'DataFlow Labs', industry: 'AI/ML', employees: 150, revenue: '$15M', confidence: 0.91 },
  { id: 5, company: 'CloudNine Solutions', industry: 'Cloud Services', employees: 300, revenue: '$30M', confidence: 0.65 },
];

const mockEvalResults = [
  { row: 1, schemaPass: true, parseErrors: 0, nullRate: 0, confidence: 0.95, status: 'pass' },
  { row: 2, schemaPass: true, parseErrors: 0, nullRate: 0, confidence: 0.88, status: 'pass' },
  { row: 3, schemaPass: true, parseErrors: 1, nullRate: 0.1, confidence: 0.72, status: 'warn' },
  { row: 4, schemaPass: true, parseErrors: 0, nullRate: 0, confidence: 0.91, status: 'pass' },
  { row: 5, schemaPass: false, parseErrors: 2, nullRate: 0.2, confidence: 0.65, status: 'fail' },
];

const mockRuns = [
  { id: 'r1', timestamp: '5 min ago', rows: 100, processed: 100, failed: 2, avgConfidence: 0.89, status: 'completed' },
  { id: 'r2', timestamp: '1 hour ago', rows: 250, processed: 248, failed: 5, avgConfidence: 0.85, status: 'completed' },
  { id: 'r3', timestamp: '3 hours ago', rows: 50, processed: 50, failed: 0, avgConfidence: 0.92, status: 'completed' },
];

export default function BatchTransformFullEditor({
  isOpen,
  onClose,
  config,
  onChange,
  nodeLabel,
}: BatchTransformFullEditorProps) {
  const [activeTab, setActiveTab] = useState<EditorTab>('input');
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedRows, setProcessedRows] = useState(0);
  const [showOutputPreview, setShowOutputPreview] = useState(false);

  if (!isOpen) return null;

  const inputSchema = config.inputSchema || [];
  const outputSchema = config.outputSchema || [];

  const handleAddOutputColumn = () => {
    const newColumn: SchemaColumn = {
      name: '',
      type: 'string',
      required: false,
    };
    onChange({ ...config, outputSchema: [...outputSchema, newColumn] });
  };

  const handleUpdateOutputColumn = (index: number, updates: Partial<SchemaColumn>) => {
    const newSchema = [...outputSchema];
    newSchema[index] = { ...newSchema[index], ...updates };
    onChange({ ...config, outputSchema: newSchema });
  };

  const handleRemoveOutputColumn = (index: number) => {
    onChange({ ...config, outputSchema: outputSchema.filter((_, i) => i !== index) });
  };

  const runSampleBatch = () => {
    setIsProcessing(true);
    setProcessedRows(0);
    const totalRows = 5;
    let processed = 0;
    const interval = setInterval(() => {
      processed++;
      setProcessedRows(processed);
      if (processed >= totalRows) {
        clearInterval(interval);
        setIsProcessing(false);
        setShowOutputPreview(true);
      }
    }, 800);
  };

  const tabs: { id: EditorTab; label: string; icon: React.ReactNode }[] = [
    { id: 'input', label: 'Input & Schema', icon: <FileSpreadsheet className="w-4 h-4" /> },
    { id: 'labeling', label: 'Labeling', icon: <Tag className="w-4 h-4" /> },
    { id: 'prompt', label: 'Prompt', icon: <FileText className="w-4 h-4" /> },
    { id: 'test', label: 'Test & Simulate', icon: <Play className="w-4 h-4" /> },
    { id: 'evaluate', label: 'Evaluations', icon: <FlaskConical className="w-4 h-4" /> },
    { id: 'scoring', label: 'Scoring & Routing', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'runs', label: 'Run History', icon: <History className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
      <div className="w-[95vw] h-[90vh] bg-[#11111b] rounded-xl border border-[#313244] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#313244] bg-[#181825]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <Table className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#cdd6f4]">{nodeLabel}</h2>
              <p className="text-xs text-[#6c7086]">Batch Transform Pattern Editor</p>
            </div>
            <span className="ml-4 px-2 py-0.5 text-[10px] font-medium bg-purple-500/20 text-purple-300 rounded">
              PATTERN
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[#313244] transition-colors"
          >
            <X className="w-5 h-5 text-[#6c7086]" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-4 py-2 border-b border-[#313244] bg-[#181825] overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'text-[#6c7086] hover:text-[#a6adc8] hover:bg-[#1e1e2e]'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {/* Input & Schema Tab */}
          {activeTab === 'input' && (
            <div className="h-full flex">
              {/* Left Panel - Input Configuration */}
              <div className="w-1/2 p-6 border-r border-[#313244] overflow-y-auto">
                <div className="space-y-6">
                  {/* Input Type */}
                  <div>
                    <h3 className="text-sm font-medium text-[#cdd6f4] mb-3">Input Source</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'csv', label: 'CSV Upload', icon: <FileSpreadsheet className="w-5 h-5" /> },
                        { id: 'json', label: 'JSON', icon: <FileText className="w-5 h-5" /> },
                        { id: 'api', label: 'API Endpoint', icon: <Globe className="w-5 h-5" /> },
                      ].map((type) => (
                        <button
                          key={type.id}
                          onClick={() => onChange({ ...config, inputType: type.id as BatchTransformConfig['inputType'] })}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            config.inputType === type.id
                              ? 'border-emerald-500 bg-emerald-500/10'
                              : 'border-[#313244] hover:border-[#45475a]'
                          }`}
                        >
                          <div className="text-emerald-400 mb-2">{type.icon}</div>
                          <div className="text-sm font-medium text-[#cdd6f4]">{type.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* CSV Upload Area */}
                  <div>
                    <h3 className="text-sm font-medium text-[#cdd6f4] mb-3">Upload Data</h3>
                    <div className="border-2 border-dashed border-[#313244] rounded-lg p-8 text-center hover:border-emerald-500/50 transition-colors cursor-pointer">
                      <Upload className="w-8 h-8 text-[#45475a] mx-auto mb-3" />
                      <p className="text-sm text-[#a6adc8] mb-1">Drop your CSV file here</p>
                      <p className="text-xs text-[#45475a]">or click to browse</p>
                    </div>
                  </div>

                  {/* Data Preview */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-[#cdd6f4]">Data Preview</h3>
                      <span className="text-xs text-[#45475a]">Showing 5 of 100 rows</span>
                    </div>
                    <div className="border border-[#313244] rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-[#1e1e2e]">
                            <tr>
                              {Object.keys(mockInputData[0]).map((key) => (
                                <th key={key} className="px-3 py-2 text-left text-xs font-medium text-[#6c7086] whitespace-nowrap">
                                  {key}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {mockInputData.slice(0, 3).map((row, i) => (
                              <tr key={i} className="border-t border-[#313244]">
                                {Object.values(row).map((val, j) => (
                                  <td key={j} className="px-3 py-2 text-[#a6adc8] whitespace-nowrap">
                                    {val || <span className="text-[#45475a] italic">empty</span>}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Column Type Inference */}
                  <div>
                    <h3 className="text-sm font-medium text-[#cdd6f4] mb-3">Detected Column Types</h3>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { name: 'id', type: 'number', inferred: true },
                        { name: 'company', type: 'string', inferred: true },
                        { name: 'website', type: 'string', inferred: true },
                        { name: 'industry', type: 'string', inferred: false },
                        { name: 'employees', type: 'string', inferred: true },
                        { name: 'revenue', type: 'string', inferred: false },
                      ].map((col) => (
                        <div
                          key={col.name}
                          className={`px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5 ${
                            col.inferred
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          <span className="font-medium">{col.name}</span>
                          <span className="opacity-60">: {col.type}</span>
                          {!col.inferred && <AlertCircle className="w-3 h-3" />}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Panel - Output Schema */}
              <div className="w-1/2 p-6 overflow-y-auto">
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-[#cdd6f4]">Output Schema</h3>
                      <button
                        onClick={handleAddOutputColumn}
                        className="text-xs text-emerald-400 hover:text-emerald-300"
                      >
                        + Add Column
                      </button>
                    </div>
                    <p className="text-xs text-[#6c7086] mb-4">
                      Define the columns that will be enriched or created
                    </p>

                    <div className="space-y-2">
                      {outputSchema.length === 0 ? (
                        <div className="p-6 text-center border-2 border-dashed border-[#313244] rounded-lg">
                          <Columns className="w-8 h-8 text-[#45475a] mx-auto mb-2" />
                          <p className="text-sm text-[#6c7086]">No output columns defined</p>
                          <button
                            onClick={handleAddOutputColumn}
                            className="mt-2 text-xs text-emerald-400"
                          >
                            Add your first column
                          </button>
                        </div>
                      ) : (
                        outputSchema.map((col, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 p-3 bg-[#1e1e2e] border border-[#313244] rounded-lg"
                          >
                            <input
                              type="text"
                              value={col.name}
                              onChange={(e) => handleUpdateOutputColumn(index, { name: e.target.value })}
                              placeholder="Column name"
                              className="flex-1 px-2 py-1 bg-[#11111b] border border-[#313244] rounded text-sm text-[#cdd6f4]"
                            />
                            <select
                              value={col.type}
                              onChange={(e) => handleUpdateOutputColumn(index, { type: e.target.value as SchemaColumn['type'] })}
                              className="w-24 px-2 py-1 bg-[#11111b] border border-[#313244] rounded text-xs text-[#cdd6f4]"
                            >
                              <option value="string">String</option>
                              <option value="number">Number</option>
                              <option value="boolean">Boolean</option>
                              <option value="date">Date</option>
                            </select>
                            <button
                              onClick={() => handleUpdateOutputColumn(index, { required: !col.required })}
                              className={`px-2 py-1 text-[10px] rounded border ${
                                col.required
                                  ? 'bg-red-500/20 border-red-500/50 text-red-300'
                                  : 'bg-[#11111b] border-[#313244] text-[#6c7086]'
                              }`}
                            >
                              {col.required ? 'Required' : 'Optional'}
                            </button>
                            <button
                              onClick={() => handleRemoveOutputColumn(index)}
                              className="p-1 text-[#6c7086] hover:text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Grounding Mode */}
                  <div>
                    <h3 className="text-sm font-medium text-[#cdd6f4] mb-3">Grounding Mode</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'none', label: 'None', desc: 'LLM only' },
                        { id: 'web', label: 'Web Search', desc: 'Enrich with web' },
                        { id: 'index', label: 'Knowledge Index', desc: 'Use internal KB' },
                      ].map((mode) => (
                        <button
                          key={mode.id}
                          onClick={() => onChange({ ...config, groundingMode: mode.id as BatchTransformConfig['groundingMode'] })}
                          className={`p-3 rounded-lg border transition-all text-left ${
                            config.groundingMode === mode.id
                              ? 'border-emerald-500 bg-emerald-500/10'
                              : 'border-[#313244] hover:border-[#45475a]'
                          }`}
                        >
                          <div className="text-sm font-medium text-[#cdd6f4]">{mode.label}</div>
                          <div className="text-xs text-[#6c7086]">{mode.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Processing Settings */}
                  <div>
                    <h3 className="text-sm font-medium text-[#cdd6f4] mb-3">Processing Settings</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-[#6c7086] mb-1">Batch Size</label>
                        <input
                          type="number"
                          value={config.batchSize ?? 100}
                          onChange={(e) => onChange({ ...config, batchSize: Number(e.target.value) })}
                          className="w-full px-3 py-2 bg-[#1e1e2e] border border-[#313244] rounded-lg text-sm text-[#cdd6f4]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#6c7086] mb-1">Parallelism</label>
                        <input
                          type="number"
                          value={config.parallelism ?? 4}
                          onChange={(e) => onChange({ ...config, parallelism: Number(e.target.value) })}
                          className="w-full px-3 py-2 bg-[#1e1e2e] border border-[#313244] rounded-lg text-sm text-[#cdd6f4]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Labeling Tab */}
          {activeTab === 'labeling' && (
            <div className="h-full flex">
              <div className="w-1/3 p-6 border-r border-[#313244] overflow-y-auto">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-[#cdd6f4] mb-3">Column Semantic Labels</h3>
                    <p className="text-xs text-[#6c7086] mb-4">
                      Add semantic meaning to help the model understand your data
                    </p>
                    <div className="space-y-2">
                      {['company', 'website', 'industry', 'employees', 'revenue'].map((col) => (
                        <div key={col} className="flex items-center gap-2">
                          <span className="w-24 text-sm text-[#a6adc8]">{col}</span>
                          <input
                            type="text"
                            placeholder="Semantic label..."
                            className="flex-1 px-2 py-1.5 bg-[#1e1e2e] border border-[#313244] rounded text-xs text-[#cdd6f4]"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-[#cdd6f4] mb-3">Identity/Key Fields</h3>
                    <div className="space-y-2">
                      {['id', 'company', 'website'].map((field) => (
                        <label key={field} className="flex items-center gap-2 p-2 bg-[#1e1e2e] rounded-lg cursor-pointer">
                          <input type="checkbox" className="w-4 h-4 rounded" defaultChecked={field === 'id'} />
                          <Key className="w-4 h-4 text-amber-400" />
                          <span className="text-sm text-[#cdd6f4]">{field}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 p-6 overflow-y-auto">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-[#cdd6f4]">Row-Level Editing Grid</h3>
                    <div className="flex items-center gap-2">
                      <button className="px-2 py-1 text-xs bg-[#1e1e2e] border border-[#313244] rounded text-[#6c7086]">
                        <Filter className="w-3 h-3 inline mr-1" />
                        Filter
                      </button>
                      <button className="px-2 py-1 text-xs bg-[#1e1e2e] border border-[#313244] rounded text-[#6c7086]">
                        <SlidersHorizontal className="w-3 h-3 inline mr-1" />
                        Columns
                      </button>
                    </div>
                  </div>

                  <div className="border border-[#313244] rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-[#1e1e2e]">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-[#6c7086] w-8"></th>
                            {Object.keys(mockInputData[0]).map((key) => (
                              <th key={key} className="px-3 py-2 text-left text-xs font-medium text-[#6c7086]">
                                {key}
                              </th>
                            ))}
                            <th className="px-3 py-2 text-left text-xs font-medium text-[#6c7086]">Override</th>
                          </tr>
                        </thead>
                        <tbody>
                          {mockInputData.map((row, i) => (
                            <tr
                              key={i}
                              onClick={() => setSelectedRow(i)}
                              className={`border-t border-[#313244] cursor-pointer ${
                                selectedRow === i ? 'bg-emerald-500/10' : 'hover:bg-[#1e1e2e]/50'
                              }`}
                            >
                              <td className="px-3 py-2">
                                <input type="checkbox" className="w-4 h-4 rounded" />
                              </td>
                              {Object.entries(row).map(([_key, val], j) => (
                                <td key={j} className="px-3 py-2">
                                  <input
                                    type="text"
                                    defaultValue={val?.toString() || ''}
                                    className="w-full px-1 py-0.5 bg-transparent border border-transparent hover:border-[#313244] focus:border-emerald-500 rounded text-[#a6adc8] text-sm focus:outline-none"
                                  />
                                </td>
                              ))}
                              <td className="px-3 py-2">
                                <button className="p-1 text-[#6c7086] hover:text-emerald-400">
                                  <Edit3 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {selectedRow !== null && (
                    <div className="p-4 bg-[#1e1e2e] border border-[#313244] rounded-lg">
                      <h4 className="text-xs font-medium text-[#6c7086] mb-2">MANUAL CORRECTION</h4>
                      <textarea
                        placeholder="Add reason for override..."
                        className="w-full px-3 py-2 bg-[#11111b] border border-[#313244] rounded-lg text-sm text-[#cdd6f4] resize-none"
                        rows={2}
                      />
                      <div className="flex justify-end mt-2">
                        <button className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-medium rounded-lg">
                          Save Override
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Prompt Tab */}
          {activeTab === 'prompt' && (
            <div className="h-full flex">
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="max-w-4xl mx-auto space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-[#cdd6f4] mb-3">Transformation Prompt</h3>
                    <p className="text-xs text-[#6c7086] mb-4">
                      Define how each row should be transformed. Use variables to reference row data.
                    </p>

                    <div className="border border-[#313244] rounded-lg overflow-hidden">
                      <div className="px-4 py-2 bg-[#1e1e2e] border-b border-[#313244] flex items-center justify-between">
                        <span className="text-xs font-medium text-[#a6adc8]">PROMPT TEMPLATE</span>
                        <div className="flex items-center gap-2">
                          <button className="text-xs text-emerald-400">Load Template</button>
                          <button className="text-xs text-emerald-400">Save</button>
                        </div>
                      </div>
                      <textarea
                        className="w-full p-4 bg-[#11111b] text-sm text-[#cdd6f4] font-mono resize-none focus:outline-none"
                        rows={12}
                        defaultValue={`Given the following company information:
- Company Name: {row.company}
- Website: {row.website}
- Known Employees: {row.employees}

Please determine:
1. Industry classification
2. Estimated annual revenue

Output as JSON:
{
  "industry": "...",
  "revenue": "..."
}`}
                      />
                    </div>
                  </div>

                  {/* Variables */}
                  <div>
                    <h4 className="text-xs font-medium text-[#6c7086] mb-2">AVAILABLE VARIABLES</h4>
                    <div className="flex flex-wrap gap-2">
                      {['{row}', '{row.company}', '{row.website}', '{row.employees}', '{column}', '{index}'].map((v) => (
                        <span key={v} className="px-2 py-1 bg-[#1e1e2e] border border-[#313244] rounded text-xs font-mono text-emerald-300 cursor-pointer hover:bg-emerald-500/10">
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Schema Enforcement */}
                  <div className="p-4 bg-[#1e1e2e] border border-[#313244] rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <h4 className="text-sm font-medium text-[#cdd6f4]">Schema Enforcement</h4>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-green-300">
                        <Check className="w-3 h-3" />
                        Output matches defined schema
                      </div>
                      <div className="flex items-center gap-2 text-green-300">
                        <Check className="w-3 h-3" />
                        All required fields present
                      </div>
                      <div className="flex items-center gap-2 text-amber-300">
                        <AlertCircle className="w-3 h-3" />
                        Optional: Add type validation
                      </div>
                    </div>
                  </div>

                  {/* Version History */}
                  <div>
                    <h4 className="text-xs font-medium text-[#6c7086] mb-2">VERSION HISTORY</h4>
                    <div className="space-y-2">
                      {[
                        { version: 'v2 (current)', date: '1 hour ago' },
                        { version: 'v1', date: 'Yesterday' },
                      ].map((v) => (
                        <div key={v.version} className="flex items-center justify-between p-2 bg-[#1e1e2e] border border-[#313244] rounded-lg">
                          <span className="text-sm text-[#cdd6f4]">{v.version}</span>
                          <span className="text-xs text-[#45475a]">{v.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Test & Simulate Tab */}
          {activeTab === 'test' && (
            <div className="h-full flex">
              <div className="w-1/2 p-6 border-r border-[#313244] overflow-y-auto">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-[#cdd6f4] mb-3">Sample Run Wizard</h3>
                    <p className="text-xs text-[#6c7086] mb-4">
                      Test your transformation on a sample of rows before running on the full dataset.
                    </p>

                    {/* Row Range Selector */}
                    <div className="p-4 bg-[#1e1e2e] border border-[#313244] rounded-lg mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-[#a6adc8]">Row Range</span>
                        <span className="text-xs text-[#6c7086]">5 rows selected</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          defaultValue={1}
                          className="w-20 px-2 py-1 bg-[#11111b] border border-[#313244] rounded text-sm text-[#cdd6f4]"
                        />
                        <span className="text-[#6c7086]">to</span>
                        <input
                          type="number"
                          defaultValue={5}
                          className="w-20 px-2 py-1 bg-[#11111b] border border-[#313244] rounded text-sm text-[#cdd6f4]"
                        />
                      </div>
                    </div>

                    {/* Batch Slicing Preview */}
                    <div className="p-4 bg-[#1e1e2e] border border-[#313244] rounded-lg mb-4">
                      <h4 className="text-xs font-medium text-[#6c7086] mb-2">BATCH CONFIGURATION</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-[#6c7086]">Chunk Size:</span>
                          <span className="text-[#cdd6f4]">{config.batchSize || 100}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#6c7086]">Parallelism:</span>
                          <span className="text-[#cdd6f4]">{config.parallelism || 4}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#6c7086]">Est. Batches:</span>
                          <span className="text-[#cdd6f4]">1</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#6c7086]">Est. Time:</span>
                          <span className="text-[#cdd6f4]">~5s</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={runSampleBatch}
                      disabled={isProcessing}
                      className="w-full px-4 py-3 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Processing {processedRows}/5 rows...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          Run Sample Batch
                        </>
                      )}
                    </button>

                    {/* Progress */}
                    {isProcessing && (
                      <div className="mt-4">
                        <div className="h-2 bg-[#313244] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 transition-all"
                            style={{ width: `${(processedRows / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="w-1/2 p-6 overflow-y-auto">
                {showOutputPreview ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-[#cdd6f4]">Output Preview</h3>
                      <span className="px-2 py-0.5 text-xs font-medium bg-green-500/20 text-green-300 rounded">
                        5 rows processed
                      </span>
                    </div>

                    <div className="border border-[#313244] rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-[#1e1e2e]">
                            <tr>
                              {Object.keys(mockOutputData[0]).map((key) => (
                                <th key={key} className="px-3 py-2 text-left text-xs font-medium text-[#6c7086]">
                                  {key}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {mockOutputData.map((row, i) => (
                              <tr key={i} className="border-t border-[#313244]">
                                {Object.entries(row).map(([key, val], j) => (
                                  <td key={j} className={`px-3 py-2 ${
                                    key === 'confidence'
                                      ? (val as number) >= 0.8 ? 'text-green-400' :
                                        (val as number) >= 0.7 ? 'text-amber-400' : 'text-red-400'
                                      : 'text-[#a6adc8]'
                                  }`}>
                                    {key === 'confidence' ? `${((val as number) * 100).toFixed(0)}%` : String(val)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Per-Row Grounding Viewer */}
                    <div>
                      <h4 className="text-xs font-medium text-[#6c7086] mb-2">GROUNDING DETAILS (Row 1)</h4>
                      <div className="p-3 bg-[#1e1e2e] border border-[#313244] rounded-lg space-y-2">
                        <div className="flex items-center gap-2 text-xs">
                          <Globe className="w-3 h-3 text-emerald-400" />
                          <span className="text-[#6c7086]">Web search:</span>
                          <span className="text-[#a6adc8]">"Acme Corp company info"</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <Database className="w-3 h-3 text-emerald-400" />
                          <span className="text-[#6c7086]">KB lookup:</span>
                          <span className="text-[#a6adc8]">Found 3 matching records</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <Rows className="w-12 h-12 text-[#313244] mx-auto mb-3" />
                      <p className="text-sm text-[#6c7086]">Run a sample batch to see results</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Evaluations Tab */}
          {activeTab === 'evaluate' && (
            <div className="h-full p-6 overflow-y-auto">
              <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-[#cdd6f4]">Row-Level Evaluation Dashboard</h3>
                    <p className="text-xs text-[#6c7086]">Schema validation, parse errors, and confidence metrics</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 bg-[#1e1e2e] border border-[#313244] text-sm text-[#a6adc8] rounded-lg flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      Filter
                    </button>
                    <button className="px-3 py-1.5 bg-emerald-500 text-white text-sm font-medium rounded-lg">
                      Run Evaluation
                    </button>
                  </div>
                </div>

                {/* Summary Metrics */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="p-4 bg-[#1e1e2e] border border-[#313244] rounded-lg">
                    <div className="text-xs text-[#6c7086] mb-1">Schema Pass Rate</div>
                    <div className="text-2xl font-bold text-green-400">80%</div>
                  </div>
                  <div className="p-4 bg-[#1e1e2e] border border-[#313244] rounded-lg">
                    <div className="text-xs text-[#6c7086] mb-1">Parse Errors</div>
                    <div className="text-2xl font-bold text-amber-400">3</div>
                  </div>
                  <div className="p-4 bg-[#1e1e2e] border border-[#313244] rounded-lg">
                    <div className="text-xs text-[#6c7086] mb-1">Avg Null Rate</div>
                    <div className="text-2xl font-bold text-[#cdd6f4]">6%</div>
                  </div>
                  <div className="p-4 bg-[#1e1e2e] border border-[#313244] rounded-lg">
                    <div className="text-xs text-[#6c7086] mb-1">HITL Queue</div>
                    <div className="text-2xl font-bold text-red-400">2</div>
                  </div>
                </div>

                {/* Results Table */}
                <div className="border border-[#313244] rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-[#1e1e2e]">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#6c7086]">Row</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-[#6c7086]">Schema</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-[#6c7086]">Parse Errors</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-[#6c7086]">Null Rate</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-[#6c7086]">Confidence</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-[#6c7086]">Status</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-[#6c7086]">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockEvalResults.map((result) => (
                        <tr key={result.row} className="border-t border-[#313244] hover:bg-[#1e1e2e]/50">
                          <td className="px-4 py-3 text-sm text-[#cdd6f4]">Row {result.row}</td>
                          <td className="px-4 py-3 text-center">
                            {result.schemaPass ? (
                              <CheckCircle2 className="w-4 h-4 text-green-400 mx-auto" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-400 mx-auto" />
                            )}
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-[#a6adc8]">{result.parseErrors}</td>
                          <td className="px-4 py-3 text-center text-sm text-[#a6adc8]">{(result.nullRate * 100).toFixed(0)}%</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-sm font-medium ${
                              result.confidence >= 0.85 ? 'text-green-400' :
                              result.confidence >= 0.7 ? 'text-amber-400' : 'text-red-400'
                            }`}>
                              {(result.confidence * 100).toFixed(0)}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                              result.status === 'pass' ? 'bg-green-500/20 text-green-300' :
                              result.status === 'warn' ? 'bg-amber-500/20 text-amber-300' :
                              'bg-red-500/20 text-red-300'
                            }`}>
                              {result.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button className="p-1 text-[#6c7086] hover:text-emerald-400">
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* HITL Queue Preview */}
                <div>
                  <h4 className="text-xs font-medium text-[#6c7086] mb-2">HITL QUEUE PREVIEW</h4>
                  <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-amber-400" />
                      <span className="text-sm text-amber-300">2 rows require human review</span>
                    </div>
                    <p className="text-xs text-amber-200/70">
                      Rows 3 and 5 have low confidence scores and need manual verification
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Scoring & Routing Tab */}
          {activeTab === 'scoring' && (
            <div className="h-full flex">
              <div className="w-1/2 p-6 border-r border-[#313244] overflow-y-auto">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-[#cdd6f4] mb-3">Confidence Threshold</h3>
                    <div className="p-4 bg-[#1e1e2e] border border-[#313244] rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-[#a6adc8]">Auto-approve threshold</span>
                        <span className="text-lg font-bold text-emerald-400">
                          {((config.confidenceThreshold ?? 0.85) * 100).toFixed(0)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={(config.confidenceThreshold ?? 0.85) * 100}
                        onChange={(e) => onChange({ ...config, confidenceThreshold: Number(e.target.value) / 100 })}
                        className="w-full h-2 bg-[#313244] rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-[#45475a] mt-1">
                        <span>0%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-[#cdd6f4] mb-3">Routing Rules</h3>
                    <div className="space-y-3">
                      {[
                        { condition: 'Confidence ≥ 85%', action: 'Auto-approve', color: 'green' },
                        { condition: 'Confidence 70-85%', action: 'HITL Review', color: 'amber' },
                        { condition: 'Confidence < 70%', action: 'Reject', color: 'red' },
                      ].map((rule, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-[#1e1e2e] border border-[#313244] rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full bg-${rule.color}-500`} />
                            <span className="text-sm text-[#a6adc8]">{rule.condition}</span>
                          </div>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded bg-${rule.color}-500/20 text-${rule.color}-300`}>
                            {rule.action}
                          </span>
                        </div>
                      ))}
                      <button className="w-full px-3 py-2 text-sm text-emerald-400 border border-dashed border-emerald-500/30 rounded-lg hover:bg-emerald-500/10">
                        + Add Custom Rule
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-1/2 p-6 overflow-y-auto">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-[#cdd6f4] mb-3">Confidence Distribution</h3>
                    <div className="p-4 bg-[#1e1e2e] border border-[#313244] rounded-lg">
                      <div className="space-y-3">
                        {[
                          { range: '90-100%', count: 45, percent: 45, color: 'emerald' },
                          { range: '80-90%', count: 30, percent: 30, color: 'green' },
                          { range: '70-80%', count: 15, percent: 15, color: 'amber' },
                          { range: '< 70%', count: 10, percent: 10, color: 'red' },
                        ].map((bucket) => (
                          <div key={bucket.range}>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-[#6c7086]">{bucket.range}</span>
                              <span className="text-[#a6adc8]">{bucket.count} rows</span>
                            </div>
                            <div className="h-2 bg-[#313244] rounded-full overflow-hidden">
                              <div
                                className={`h-full bg-${bucket.color}-500 rounded-full`}
                                style={{ width: `${bucket.percent}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-[#cdd6f4] mb-3">Justification Codes</h3>
                    <div className="space-y-2">
                      {[
                        { code: 'LOW_DATA', label: 'Insufficient source data', count: 5 },
                        { code: 'AMBIGUOUS', label: 'Multiple interpretations', count: 3 },
                        { code: 'NO_MATCH', label: 'No grounding match', count: 2 },
                      ].map((code) => (
                        <div key={code.code} className="flex items-center justify-between p-2 bg-[#1e1e2e] border border-[#313244] rounded-lg">
                          <div>
                            <div className="text-xs font-mono text-amber-300">{code.code}</div>
                            <div className="text-xs text-[#6c7086]">{code.label}</div>
                          </div>
                          <span className="text-sm text-[#a6adc8]">{code.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Run History Tab */}
          {activeTab === 'runs' && (
            <div className="h-full flex">
              <div className="w-1/3 p-6 border-r border-[#313244] overflow-y-auto">
                <h3 className="text-sm font-medium text-[#cdd6f4] mb-4">Recent Runs</h3>
                <div className="space-y-2">
                  {mockRuns.map((run) => (
                    <div
                      key={run.id}
                      className="p-3 bg-[#1e1e2e] border border-[#313244] rounded-lg hover:border-[#45475a] cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-[#cdd6f4]">{run.rows} rows</span>
                        <span className={`w-2 h-2 rounded-full ${
                          run.status === 'completed' ? 'bg-green-500' : 'bg-amber-500'
                        }`} />
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#6c7086]">
                        <span>{run.timestamp}</span>
                        <span>•</span>
                        <span>{run.failed} failed</span>
                        <span>•</span>
                        <span>{(run.avgConfidence * 100).toFixed(0)}% avg</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex-1 p-6 overflow-y-auto">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-[#cdd6f4] mb-4">Run Details</h3>

                    {/* Before/After Diff */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="p-4 bg-[#1e1e2e] border border-[#313244] rounded-lg">
                        <h4 className="text-xs font-medium text-[#6c7086] mb-2">BEFORE</h4>
                        <div className="text-sm text-[#a6adc8] font-mono">
                          <div>company: "Acme Corp"</div>
                          <div>industry: ""</div>
                          <div>revenue: ""</div>
                        </div>
                      </div>
                      <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                        <h4 className="text-xs font-medium text-emerald-400 mb-2">AFTER</h4>
                        <div className="text-sm text-[#a6adc8] font-mono">
                          <div>company: "Acme Corp"</div>
                          <div className="text-emerald-300">industry: "Manufacturing"</div>
                          <div className="text-emerald-300">revenue: "$50M"</div>
                        </div>
                      </div>
                    </div>

                    {/* Row Trace Viewer */}
                    <div>
                      <h4 className="text-xs font-medium text-[#6c7086] mb-2">ROW TRACE</h4>
                      <div className="p-4 bg-[#1e1e2e] border border-[#313244] rounded-lg space-y-2">
                        <div className="flex items-center gap-2 text-xs">
                          <Sparkles className="w-3 h-3 text-emerald-400" />
                          <span className="text-[#6c7086]">LLM call:</span>
                          <span className="text-[#a6adc8]">GPT-4 • 245 tokens</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <Globe className="w-3 h-3 text-emerald-400" />
                          <span className="text-[#6c7086]">Web search:</span>
                          <span className="text-[#a6adc8]">"Acme Corp revenue 2024"</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <Clock className="w-3 h-3 text-emerald-400" />
                          <span className="text-[#6c7086]">Total time:</span>
                          <span className="text-[#a6adc8]">1.2s</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Export Options */}
                  <div className="flex gap-2">
                    <button className="flex-1 px-4 py-2 bg-[#1e1e2e] border border-[#313244] rounded-lg text-sm text-[#a6adc8] hover:bg-[#262637] flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" />
                      Export CSV
                    </button>
                    <button className="px-4 py-2 bg-[#1e1e2e] border border-[#313244] rounded-lg text-sm text-[#a6adc8] hover:bg-[#262637] flex items-center justify-center gap-2">
                      <Users className="w-4 h-4" />
                      Send to HITL
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#313244] bg-[#181825]">
          <div className="flex items-center gap-4 text-xs text-[#6c7086]">
            <span>{inputSchema.length} input cols</span>
            <span>•</span>
            <span>{outputSchema.length} output cols</span>
            <span>•</span>
            <span>Batch: {config.batchSize || 100}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-[#a6adc8] hover:text-[#cdd6f4]"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
