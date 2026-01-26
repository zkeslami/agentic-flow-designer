import { useState, useCallback, useEffect } from 'react';
import {
  FlaskConical,
  Database,
  Settings,
  BarChart3,
  Zap,
  Play,
  Plus,
  Upload,
  Sparkles,
  Check,
  X,
  Trash2,
  FileJson,
  FileSpreadsheet,
  Clock,
  Target,
  AlertTriangle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import type { AgentNode } from '../types';
import type { Edge } from '@xyflow/react';
import type {
  Dataset,
  EvaluatorType,
  EvaluationRun,
  EvaluationScope,
  TriggerType,
} from '../types/evaluation';
import {
  createDataset,
  createDataPoint,
  saveDataset,
  loadDatasets,
  deleteDataset,
  parseCSV,
  parseJSON,
  exportToCSV,
  exportToJSON,
  generateTestCases,
  loadEvaluationRuns,
  saveEvaluationRun,
  generateId,
} from '../utils/datasetManager';
import { runEvaluation, calculateSummary } from '../utils/evaluators';

interface EvaluationPanelProps {
  nodes: AgentNode[];
  edges: Edge[];
  selectedNodeIds: string[];
  onSelectNodes: (nodeIds: string[]) => void;
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'datasets' | 'configure' | 'results' | 'online';

const EVALUATOR_OPTIONS: { type: EvaluatorType; name: string; description: string }[] = [
  { type: 'exact_match', name: 'Exact Match', description: 'Output exactly matches expected' },
  { type: 'contains', name: 'Contains', description: 'Output contains keywords' },
  { type: 'json_similarity', name: 'JSON Similarity', description: 'JSON structure comparison' },
  { type: 'context_precision', name: 'Context Precision', description: 'Context usage quality' },
  { type: 'llm_judge_output', name: 'LLM Judge (Output)', description: 'AI evaluates output quality' },
  { type: 'llm_judge_trajectory', name: 'LLM Judge (Trajectory)', description: 'AI evaluates execution path' },
  { type: 'trajectory_match', name: 'Trajectory Match', description: 'Execution path comparison' },
];

export default function EvaluationPanel({
  nodes,
  edges: _edges,
  selectedNodeIds,
  onSelectNodes: _onSelectNodes,
  isOpen,
  onClose,
}: EvaluationPanelProps) {
  // Note: edges and onSelectNodes are available for future subgraph selection features
  void _edges;
  void _onSelectNodes;
  const [activeTab, setActiveTab] = useState<TabType>('datasets');
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(null);
  const [evaluationRuns, setEvaluationRuns] = useState<EvaluationRun[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  // Configuration state
  const [evalScope, setEvalScope] = useState<EvaluationScope>('flow');
  const [selectedEvaluators, setSelectedEvaluators] = useState<EvaluatorType[]>(['exact_match', 'json_similarity']);

  // Online evaluation state
  const [onlineTrigger, setOnlineTrigger] = useState<TriggerType>('on_run_complete');
  const [onlineEnabled, setOnlineEnabled] = useState(false);

  // Load data on mount
  useEffect(() => {
    setDatasets(loadDatasets());
    setEvaluationRuns(loadEvaluationRuns());
  }, []);

  // Dataset management
  const handleCreateDataset = useCallback(() => {
    const name = prompt('Enter dataset name:');
    if (name) {
      const newDataset = createDataset(name, '', 'manual');
      saveDataset(newDataset);
      setDatasets(loadDatasets());
      setSelectedDatasetId(newDataset.id);
    }
  }, []);

  const handleDeleteDataset = useCallback((id: string) => {
    if (confirm('Delete this dataset?')) {
      deleteDataset(id);
      setDatasets(loadDatasets());
      if (selectedDatasetId === id) {
        setSelectedDatasetId(null);
      }
    }
  }, [selectedDatasetId]);

  const handleImportFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const content = await file.text();
    const isCSV = file.name.endsWith('.csv');
    const result = isCSV ? parseCSV(content) : parseJSON(content);

    if (result.success) {
      const name = prompt('Enter dataset name:', file.name.replace(/\.(csv|json)$/, ''));
      if (name) {
        const newDataset = createDataset(name, `Imported from ${file.name}`, 'import');
        newDataset.dataPoints = result.dataPoints;
        saveDataset(newDataset);
        setDatasets(loadDatasets());
        setSelectedDatasetId(newDataset.id);
        alert(`Imported ${result.dataPoints.length} data points`);
      }
    } else {
      alert(`Import failed:\n${result.errors.join('\n')}`);
    }

    e.target.value = '';
  }, []);

  const handleGenerateTestCases = useCallback(() => {
    const count = parseInt(prompt('How many test cases?', '10') || '0', 10);
    if (count <= 0) return;

    const nodeTypes = nodes.map(n => n.data.type);
    const generated = generateTestCases({
      flowDescription: 'Agentic workflow',
      nodeTypes,
      count,
      includeEdgeCases: true,
      includeNegativeCases: true,
    });

    const name = prompt('Enter dataset name:', 'AI Generated Tests');
    if (name) {
      const newDataset = createDataset(name, 'AI-generated test cases', 'generated');
      newDataset.dataPoints = generated;
      saveDataset(newDataset);
      setDatasets(loadDatasets());
      setSelectedDatasetId(newDataset.id);
      alert(`Generated ${generated.length} test cases`);
    }
  }, [nodes]);

  const handleAddDataPoint = useCallback(() => {
    const dataset = datasets.find(d => d.id === selectedDatasetId);
    if (!dataset) return;

    const inputStr = prompt('Enter input (JSON):', '{"query": "test"}');
    if (!inputStr) return;

    try {
      const input = JSON.parse(inputStr);
      const expectedStr = prompt('Enter expected output (JSON, optional):', '');
      const expectedOutput = expectedStr ? JSON.parse(expectedStr) : undefined;

      const newDataPoint = createDataPoint(input, expectedOutput, undefined, undefined, 'manual');
      dataset.dataPoints.push(newDataPoint);
      saveDataset(dataset);
      setDatasets(loadDatasets());
    } catch (e) {
      alert('Invalid JSON format');
    }
  }, [datasets, selectedDatasetId]);

  const handleExportDataset = useCallback((format: 'csv' | 'json') => {
    const dataset = datasets.find(d => d.id === selectedDatasetId);
    if (!dataset) return;

    const content = format === 'csv' ? exportToCSV(dataset) : exportToJSON(dataset);
    const blob = new Blob([content], { type: format === 'csv' ? 'text/csv' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${dataset.name}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [datasets, selectedDatasetId]);

  // Run evaluation
  const handleRunEvaluation = useCallback(async () => {
    const dataset = datasets.find(d => d.id === selectedDatasetId);
    if (!dataset || dataset.dataPoints.length === 0) {
      alert('Please select a dataset with data points');
      return;
    }

    if (selectedEvaluators.length === 0) {
      alert('Please select at least one evaluator');
      return;
    }

    setIsRunning(true);

    const run: EvaluationRun = {
      id: generateId(),
      name: `${dataset.name} - ${new Date().toLocaleString()}`,
      mode: 'offline',
      status: 'running',
      config: {
        mode: 'offline',
        datasetId: dataset.id,
        evaluators: selectedEvaluators.map(type => ({
          type,
          name: EVALUATOR_OPTIONS.find(e => e.type === type)?.name || type,
          description: '',
          weight: 1,
          config: {},
        })),
        target: {
          scope: evalScope,
          nodeIds: evalScope === 'node' ? selectedNodeIds : undefined,
        },
      },
      startedAt: new Date().toISOString(),
      results: [],
      summary: {
        totalTests: 0,
        passed: 0,
        failed: 0,
        passRate: 0,
        averageScore: 0,
        scoreByEvaluator: {},
        averageLatencyMs: 0,
      },
    };

    try {
      // Simulate running evaluation on each data point
      for (const dataPoint of dataset.dataPoints) {
        // Simulate execution
        await new Promise(r => setTimeout(r, 100 + Math.random() * 200));

        // Simulate actual output
        const simulatedOutput = {
          response: `Simulated response for: ${JSON.stringify(dataPoint.input).substring(0, 50)}`,
          timestamp: new Date().toISOString(),
        };

        // Simulate trajectory
        const simulatedTrajectory = nodes.map(n => n.id);

        const result = await runEvaluation(
          dataPoint,
          simulatedOutput,
          simulatedTrajectory,
          run.config.evaluators
        );

        run.results.push(result);
      }

      run.summary = calculateSummary(run.results);
      run.status = 'completed';
      run.completedAt = new Date().toISOString();
    } catch (error) {
      run.status = 'failed';
      run.completedAt = new Date().toISOString();
    }

    saveEvaluationRun(run);
    setEvaluationRuns(loadEvaluationRuns());
    setSelectedRunId(run.id);
    setActiveTab('results');
    setIsRunning(false);
  }, [datasets, selectedDatasetId, selectedEvaluators, evalScope, selectedNodeIds, nodes]);

  const selectedDataset = datasets.find(d => d.id === selectedDatasetId);
  const selectedRun = evaluationRuns.find(r => r.id === selectedRunId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-[900px] max-h-[80vh] bg-[#1e1e2e] rounded-xl shadow-2xl border border-[#313244] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#313244]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20">
              <FlaskConical className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#cdd6f4]">Evaluation Studio</h2>
              <p className="text-xs text-[#6c7086]">Test nodes, subgraphs, and flows with multiple evaluators</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[#313244] transition-colors"
          >
            <X className="w-5 h-5 text-[#6c7086]" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#313244]">
          {[
            { id: 'datasets', label: 'Datasets', icon: Database },
            { id: 'configure', label: 'Configure', icon: Settings },
            { id: 'results', label: 'Results', icon: BarChart3 },
            { id: 'online', label: 'Online Evals', icon: Zap },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-500/5'
                  : 'text-[#6c7086] hover:text-[#a6adc8]'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Datasets Tab */}
          {activeTab === 'datasets' && (
            <div className="space-y-4">
              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCreateDataset}
                  className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  New Dataset
                </button>
                <label className="flex items-center gap-2 px-3 py-2 bg-[#313244] text-[#cdd6f4] rounded-lg text-sm hover:bg-[#45475a] transition-colors cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Import CSV/JSON
                  <input
                    type="file"
                    accept=".csv,.json"
                    className="hidden"
                    onChange={handleImportFile}
                  />
                </label>
                <button
                  onClick={handleGenerateTestCases}
                  className="flex items-center gap-2 px-3 py-2 bg-[#313244] text-[#cdd6f4] rounded-lg text-sm hover:bg-[#45475a] transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  Generate with AI
                </button>
              </div>

              {/* Dataset List */}
              <div className="grid grid-cols-2 gap-3">
                {datasets.map(dataset => (
                  <div
                    key={dataset.id}
                    onClick={() => setSelectedDatasetId(dataset.id)}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedDatasetId === dataset.id
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-[#313244] hover:border-[#45475a]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-[#cdd6f4]">{dataset.name}</h3>
                        <p className="text-xs text-[#6c7086] mt-1">
                          {dataset.dataPoints.length} data points
                        </p>
                        <p className="text-xs text-[#45475a] mt-1">
                          {dataset.source === 'import' && <FileJson className="w-3 h-3 inline mr-1" />}
                          {dataset.source === 'generated' && <Sparkles className="w-3 h-3 inline mr-1" />}
                          {dataset.source}
                        </p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteDataset(dataset.id); }}
                        className="p-1 rounded hover:bg-red-500/20 text-[#6c7086] hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {datasets.length === 0 && (
                  <div className="col-span-2 text-center py-8 text-[#6c7086]">
                    No datasets yet. Create or import one to get started.
                  </div>
                )}
              </div>

              {/* Selected Dataset Details */}
              {selectedDataset && (
                <div className="mt-4 p-4 bg-[#181825] rounded-lg border border-[#313244]">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-[#cdd6f4]">Data Points</h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleAddDataPoint}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-[#313244] rounded hover:bg-[#45475a]"
                      >
                        <Plus className="w-3 h-3" />
                        Add
                      </button>
                      <button
                        onClick={() => handleExportDataset('csv')}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-[#313244] rounded hover:bg-[#45475a]"
                      >
                        <FileSpreadsheet className="w-3 h-3" />
                        CSV
                      </button>
                      <button
                        onClick={() => handleExportDataset('json')}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-[#313244] rounded hover:bg-[#45475a]"
                      >
                        <FileJson className="w-3 h-3" />
                        JSON
                      </button>
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {selectedDataset.dataPoints.slice(0, 10).map((dp, i) => (
                      <div key={dp.id} className="text-xs p-2 bg-[#1e1e2e] rounded border border-[#313244]">
                        <span className="text-[#6c7086]">#{i + 1}</span>
                        <span className="text-[#a6adc8] ml-2">
                          {JSON.stringify(dp.input).substring(0, 100)}...
                        </span>
                      </div>
                    ))}
                    {selectedDataset.dataPoints.length > 10 && (
                      <p className="text-xs text-[#6c7086] text-center">
                        +{selectedDataset.dataPoints.length - 10} more
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Configure Tab */}
          {activeTab === 'configure' && (
            <div className="space-y-6">
              {/* Evaluation Scope */}
              <div>
                <label className="block text-sm font-medium text-[#cdd6f4] mb-2">
                  Evaluation Scope
                </label>
                <div className="flex gap-2">
                  {[
                    { id: 'flow', label: 'Full Flow', icon: Target },
                    { id: 'subgraph', label: 'Subgraph', icon: Target },
                    { id: 'node', label: 'Single Node', icon: Target },
                  ].map(scope => (
                    <button
                      key={scope.id}
                      onClick={() => setEvalScope(scope.id as EvaluationScope)}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                        evalScope === scope.id
                          ? 'border-purple-500 bg-purple-500/10 text-purple-400'
                          : 'border-[#313244] text-[#6c7086] hover:border-[#45475a]'
                      }`}
                    >
                      <scope.icon className="w-4 h-4" />
                      {scope.label}
                    </button>
                  ))}
                </div>
                {evalScope === 'node' && (
                  <p className="text-xs text-[#6c7086] mt-2">
                    Select nodes on the canvas to evaluate: {selectedNodeIds.length > 0 ? selectedNodeIds.join(', ') : 'None selected'}
                  </p>
                )}
              </div>

              {/* Dataset Selection */}
              <div>
                <label className="block text-sm font-medium text-[#cdd6f4] mb-2">
                  Dataset
                </label>
                <select
                  value={selectedDatasetId || ''}
                  onChange={(e) => setSelectedDatasetId(e.target.value || null)}
                  className="w-full px-3 py-2 bg-[#181825] border border-[#313244] rounded-lg text-[#cdd6f4] text-sm"
                >
                  <option value="">Select a dataset...</option>
                  {datasets.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.dataPoints.length} data points)
                    </option>
                  ))}
                </select>
              </div>

              {/* Evaluators */}
              <div>
                <label className="block text-sm font-medium text-[#cdd6f4] mb-2">
                  Evaluators
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {EVALUATOR_OPTIONS.map(evaluator => (
                    <button
                      key={evaluator.type}
                      onClick={() => {
                        setSelectedEvaluators(prev =>
                          prev.includes(evaluator.type)
                            ? prev.filter(e => e !== evaluator.type)
                            : [...prev, evaluator.type]
                        );
                      }}
                      className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-colors ${
                        selectedEvaluators.includes(evaluator.type)
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-[#313244] hover:border-[#45475a]'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center mt-0.5 ${
                        selectedEvaluators.includes(evaluator.type)
                          ? 'border-purple-500 bg-purple-500'
                          : 'border-[#45475a]'
                      }`}>
                        {selectedEvaluators.includes(evaluator.type) && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#cdd6f4]">{evaluator.name}</p>
                        <p className="text-xs text-[#6c7086]">{evaluator.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Run Button */}
              <button
                onClick={handleRunEvaluation}
                disabled={isRunning || !selectedDatasetId || selectedEvaluators.length === 0}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Running Evaluation...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Run Evaluation
                  </>
                )}
              </button>
            </div>
          )}

          {/* Results Tab */}
          {activeTab === 'results' && (
            <div className="space-y-4">
              {/* Run Selector */}
              <div className="flex items-center gap-4">
                <select
                  value={selectedRunId || ''}
                  onChange={(e) => setSelectedRunId(e.target.value || null)}
                  className="flex-1 px-3 py-2 bg-[#181825] border border-[#313244] rounded-lg text-[#cdd6f4] text-sm"
                >
                  <option value="">Select an evaluation run...</option>
                  {evaluationRuns.map(run => (
                    <option key={run.id} value={run.id}>
                      {run.name} - {run.status}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setEvaluationRuns(loadEvaluationRuns())}
                  className="p-2 rounded-lg bg-[#313244] hover:bg-[#45475a]"
                >
                  <RefreshCw className="w-4 h-4 text-[#6c7086]" />
                </button>
              </div>

              {/* Results Display */}
              {selectedRun && (
                <div className="space-y-4">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-4 gap-3">
                    <div className="p-4 bg-[#181825] rounded-lg border border-[#313244]">
                      <p className="text-xs text-[#6c7086]">Total Tests</p>
                      <p className="text-2xl font-bold text-[#cdd6f4]">{selectedRun.summary.totalTests}</p>
                    </div>
                    <div className="p-4 bg-[#181825] rounded-lg border border-[#313244]">
                      <p className="text-xs text-[#6c7086]">Pass Rate</p>
                      <p className={`text-2xl font-bold ${
                        selectedRun.summary.passRate >= 0.8 ? 'text-green-400' :
                        selectedRun.summary.passRate >= 0.5 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {(selectedRun.summary.passRate * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="p-4 bg-[#181825] rounded-lg border border-[#313244]">
                      <p className="text-xs text-[#6c7086]">Avg Score</p>
                      <p className="text-2xl font-bold text-[#cdd6f4]">
                        {(selectedRun.summary.averageScore * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="p-4 bg-[#181825] rounded-lg border border-[#313244]">
                      <p className="text-xs text-[#6c7086]">Avg Latency</p>
                      <p className="text-2xl font-bold text-[#cdd6f4]">
                        {selectedRun.summary.averageLatencyMs.toFixed(0)}ms
                      </p>
                    </div>
                  </div>

                  {/* Score by Evaluator */}
                  <div className="p-4 bg-[#181825] rounded-lg border border-[#313244]">
                    <h3 className="text-sm font-medium text-[#cdd6f4] mb-3">Score by Evaluator</h3>
                    <div className="space-y-2">
                      {Object.entries(selectedRun.summary.scoreByEvaluator).map(([evaluator, score]) => (
                        <div key={evaluator} className="flex items-center gap-3">
                          <span className="text-xs text-[#6c7086] w-32">{evaluator}</span>
                          <div className="flex-1 h-2 bg-[#313244] rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                score >= 0.8 ? 'bg-green-500' :
                                score >= 0.5 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${score * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-[#a6adc8] w-12 text-right">
                            {(score * 100).toFixed(0)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Individual Results */}
                  <div className="p-4 bg-[#181825] rounded-lg border border-[#313244]">
                    <h3 className="text-sm font-medium text-[#cdd6f4] mb-3">Test Results</h3>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {selectedRun.results.map((result, i) => (
                        <div
                          key={result.dataPointId}
                          className={`p-3 rounded-lg border ${
                            result.passed
                              ? 'border-green-500/30 bg-green-500/5'
                              : 'border-red-500/30 bg-red-500/5'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {result.passed ? (
                                <Check className="w-4 h-4 text-green-400" />
                              ) : (
                                <X className="w-4 h-4 text-red-400" />
                              )}
                              <span className="text-sm text-[#cdd6f4]">Test #{i + 1}</span>
                            </div>
                            <span className="text-xs text-[#6c7086]">
                              Score: {(result.aggregateScore * 100).toFixed(1)}%
                            </span>
                          </div>
                          <p className="text-xs text-[#6c7086] mt-1 truncate">
                            Input: {JSON.stringify(result.input).substring(0, 80)}...
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {!selectedRun && evaluationRuns.length === 0 && (
                <div className="text-center py-12 text-[#6c7086]">
                  No evaluation runs yet. Configure and run an evaluation to see results.
                </div>
              )}
            </div>
          )}

          {/* Online Evals Tab */}
          {activeTab === 'online' && (
            <div className="space-y-6">
              {/* Enable Toggle */}
              <div className="flex items-center justify-between p-4 bg-[#181825] rounded-lg border border-[#313244]">
                <div>
                  <h3 className="font-medium text-[#cdd6f4]">Online Evaluations</h3>
                  <p className="text-xs text-[#6c7086]">
                    Automatically evaluate during runtime based on triggers
                  </p>
                </div>
                <button
                  onClick={() => setOnlineEnabled(!onlineEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    onlineEnabled ? 'bg-purple-600' : 'bg-[#313244]'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    onlineEnabled ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              {onlineEnabled && (
                <>
                  {/* Trigger Selection */}
                  <div>
                    <label className="block text-sm font-medium text-[#cdd6f4] mb-2">
                      Trigger Type
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'on_run_complete', label: 'After Every Run', description: 'Evaluate after each execution completes', icon: Play },
                        { id: 'on_node_execute', label: 'On Node Execute', description: 'Evaluate when specific nodes run', icon: Target },
                        { id: 'scheduled', label: 'Scheduled', description: 'Run at specified intervals', icon: Clock },
                        { id: 'on_error', label: 'On Error', description: 'Evaluate when errors occur', icon: AlertTriangle },
                      ].map(trigger => (
                        <button
                          key={trigger.id}
                          onClick={() => setOnlineTrigger(trigger.id as TriggerType)}
                          className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-colors ${
                            onlineTrigger === trigger.id
                              ? 'border-purple-500 bg-purple-500/10'
                              : 'border-[#313244] hover:border-[#45475a]'
                          }`}
                        >
                          <trigger.icon className={`w-5 h-5 mt-0.5 ${
                            onlineTrigger === trigger.id ? 'text-purple-400' : 'text-[#6c7086]'
                          }`} />
                          <div>
                            <p className="text-sm font-medium text-[#cdd6f4]">{trigger.label}</p>
                            <p className="text-xs text-[#6c7086]">{trigger.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Baseline Dataset */}
                  <div>
                    <label className="block text-sm font-medium text-[#cdd6f4] mb-2">
                      Baseline Dataset (for drift detection)
                    </label>
                    <select
                      value={selectedDatasetId || ''}
                      onChange={(e) => setSelectedDatasetId(e.target.value || null)}
                      className="w-full px-3 py-2 bg-[#181825] border border-[#313244] rounded-lg text-[#cdd6f4] text-sm"
                    >
                      <option value="">No baseline (informational only)</option>
                      {datasets.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-[#6c7086] mt-1">
                      Without a baseline, drift detection is not available
                    </p>
                  </div>

                  {/* Alert Thresholds */}
                  <div>
                    <label className="block text-sm font-medium text-[#cdd6f4] mb-2">
                      Alert Thresholds
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs text-[#6c7086]">Min Score</label>
                        <input
                          type="number"
                          min="0"
                          max="1"
                          step="0.1"
                          defaultValue="0.7"
                          className="w-full mt-1 px-3 py-2 bg-[#181825] border border-[#313244] rounded-lg text-[#cdd6f4] text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-[#6c7086]">Max Latency (ms)</label>
                        <input
                          type="number"
                          min="0"
                          step="100"
                          defaultValue="5000"
                          className="w-full mt-1 px-3 py-2 bg-[#181825] border border-[#313244] rounded-lg text-[#cdd6f4] text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-[#6c7086]">Max Error Rate</label>
                        <input
                          type="number"
                          min="0"
                          max="1"
                          step="0.05"
                          defaultValue="0.1"
                          className="w-full mt-1 px-3 py-2 bg-[#181825] border border-[#313244] rounded-lg text-[#cdd6f4] text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Evaluators for Online */}
                  <div>
                    <label className="block text-sm font-medium text-[#cdd6f4] mb-2">
                      Online Evaluators
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {EVALUATOR_OPTIONS.map(evaluator => (
                        <button
                          key={evaluator.type}
                          onClick={() => {
                            setSelectedEvaluators(prev =>
                              prev.includes(evaluator.type)
                                ? prev.filter(e => e !== evaluator.type)
                                : [...prev, evaluator.type]
                            );
                          }}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                            selectedEvaluators.includes(evaluator.type)
                              ? 'bg-purple-600 text-white'
                              : 'bg-[#313244] text-[#6c7086] hover:bg-[#45475a]'
                          }`}
                        >
                          {evaluator.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Save Configuration */}
                  <button
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                  >
                    <Zap className="w-5 h-5" />
                    Save Online Configuration
                  </button>
                </>
              )}

              {!onlineEnabled && (
                <div className="text-center py-8 text-[#6c7086]">
                  Enable online evaluations to configure automatic runtime evaluation triggers.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
