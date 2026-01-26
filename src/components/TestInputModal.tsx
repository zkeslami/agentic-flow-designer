import { useState, useCallback, useEffect } from 'react';
import {
  Play,
  X,
  Sparkles,
  Plus,
  Copy,
  Check,
  History,
  FileJson,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import type { FlowArgumentsConfig, TestInput } from '../types/execution';
import { generateTestInputFromSchema } from '../types/execution';

interface TestInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRun: (input: Record<string, unknown>) => void;
  flowArguments: FlowArgumentsConfig;
  recentInputs: TestInput[];
  onSaveInput: (input: TestInput) => void;
}

export default function TestInputModal({
  isOpen,
  onClose,
  onRun,
  flowArguments,
  recentInputs,
  onSaveInput,
}: TestInputModalProps) {
  const [inputValues, setInputValues] = useState<Record<string, unknown>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [jsonMode, setJsonMode] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [copied, setCopied] = useState(false);

  // Initialize input values from flow arguments
  useEffect(() => {
    if (isOpen) {
      const initial = generateTestInputFromSchema(flowArguments.inputs);
      setInputValues(initial);
      setJsonInput(JSON.stringify(initial, null, 2));
    }
  }, [isOpen, flowArguments.inputs]);

  const handleInputChange = useCallback((name: string, value: unknown) => {
    setInputValues(prev => {
      const updated = { ...prev, [name]: value };
      setJsonInput(JSON.stringify(updated, null, 2));
      return updated;
    });
  }, []);

  const handleJsonChange = useCallback((json: string) => {
    setJsonInput(json);
    try {
      const parsed = JSON.parse(json);
      setInputValues(parsed);
      setJsonError(null);
    } catch (e) {
      setJsonError((e as Error).message);
    }
  }, []);

  const handleGenerateInput = useCallback(async () => {
    setIsGenerating(true);

    // Simulate AI generation with delay
    await new Promise(r => setTimeout(r, 1000 + Math.random() * 500));

    // Generate diverse test inputs
    const generated: Record<string, unknown> = {};

    for (const arg of flowArguments.inputs) {
      switch (arg.type) {
        case 'string':
          const stringOptions = [
            `Can you help me with ${arg.name}?`,
            `I need assistance understanding ${arg.name}`,
            `What are the best practices for ${arg.name}?`,
            `Explain ${arg.name} to me like I'm a beginner`,
            `How do I implement ${arg.name} in my project?`,
          ];
          generated[arg.name] = stringOptions[Math.floor(Math.random() * stringOptions.length)];
          break;
        case 'number':
          generated[arg.name] = Math.floor(Math.random() * 100);
          break;
        case 'boolean':
          generated[arg.name] = Math.random() > 0.5;
          break;
        case 'object':
          generated[arg.name] = {
            key: 'value',
            nested: { data: Math.random() > 0.5 },
          };
          break;
        case 'array':
          generated[arg.name] = ['item1', 'item2', 'item3'].slice(0, Math.floor(Math.random() * 3) + 1);
          break;
        default:
          generated[arg.name] = `Generated ${arg.name}`;
      }
    }

    setInputValues(generated);
    setJsonInput(JSON.stringify(generated, null, 2));
    setIsGenerating(false);
  }, [flowArguments.inputs]);

  const handleLoadHistoricalInput = useCallback((input: TestInput) => {
    setInputValues(input.values);
    setJsonInput(JSON.stringify(input.values, null, 2));
    setShowHistory(false);
  }, []);

  const handleSaveAsTestCase = useCallback(() => {
    const name = prompt('Enter a name for this test case:', `Test ${new Date().toLocaleDateString()}`);
    if (name) {
      const testInput: TestInput = {
        id: `test-${Date.now()}`,
        name,
        values: inputValues,
        createdAt: new Date().toISOString(),
        source: 'manual',
      };
      onSaveInput(testInput);
    }
  }, [inputValues, onSaveInput]);

  const handleCopyJson = useCallback(async () => {
    await navigator.clipboard.writeText(jsonInput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [jsonInput]);

  const handleRun = useCallback(() => {
    if (jsonError && jsonMode) {
      return;
    }
    onRun(inputValues);
  }, [inputValues, jsonError, jsonMode, onRun]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-[600px] max-h-[80vh] bg-[#1e1e2e] rounded-xl shadow-2xl border border-[#313244] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#313244]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20">
              <Play className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#cdd6f4]">Run Flow</h2>
              <p className="text-xs text-[#6c7086]">Provide test input to execute the workflow</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[#313244] transition-colors"
          >
            <X className="w-5 h-5 text-[#6c7086]" />
          </button>
        </div>

        {/* Mode Toggle & Actions */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-[#313244] bg-[#181825]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setJsonMode(false)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                !jsonMode
                  ? 'bg-[#313244] text-[#cdd6f4]'
                  : 'text-[#6c7086] hover:text-[#a6adc8]'
              }`}
            >
              Form
            </button>
            <button
              onClick={() => setJsonMode(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${
                jsonMode
                  ? 'bg-[#313244] text-[#cdd6f4]'
                  : 'text-[#6c7086] hover:text-[#a6adc8]'
              }`}
            >
              <FileJson className="w-3.5 h-3.5" />
              JSON
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerateInput}
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-purple-600/20 text-purple-400 border border-purple-500/50 rounded-md hover:bg-purple-600/30 disabled:opacity-50 transition-colors"
            >
              {isGenerating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              Generate
            </button>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${
                showHistory
                  ? 'bg-[#313244] text-[#cdd6f4]'
                  : 'text-[#6c7086] hover:bg-[#313244]'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              History
            </button>
          </div>
        </div>

        {/* History Dropdown */}
        {showHistory && (
          <div className="px-6 py-3 border-b border-[#313244] bg-[#181825] max-h-40 overflow-y-auto">
            {recentInputs.length === 0 ? (
              <p className="text-xs text-[#6c7086] text-center py-2">No recent test inputs</p>
            ) : (
              <div className="space-y-2">
                {recentInputs.map(input => (
                  <button
                    key={input.id}
                    onClick={() => handleLoadHistoricalInput(input)}
                    className="w-full text-left p-2 rounded-lg bg-[#1e1e2e] border border-[#313244] hover:border-[#45475a] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#cdd6f4]">{input.name}</span>
                      <span className="text-xs text-[#6c7086]">
                        {new Date(input.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-[#6c7086] truncate mt-1">
                      {JSON.stringify(input.values).substring(0, 60)}...
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {jsonMode ? (
            // JSON Editor Mode
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-[#cdd6f4]">Input JSON</label>
                <button
                  onClick={handleCopyJson}
                  className="flex items-center gap-1 text-xs text-[#6c7086] hover:text-[#a6adc8]"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <textarea
                value={jsonInput}
                onChange={(e) => handleJsonChange(e.target.value)}
                className={`w-full h-64 px-4 py-3 bg-[#181825] border rounded-lg text-sm font-mono text-[#cdd6f4] resize-none focus:outline-none ${
                  jsonError
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-[#313244] focus:border-purple-500'
                }`}
                placeholder='{"query": "..."}'
              />
              {jsonError && (
                <div className="flex items-center gap-2 text-xs text-red-400">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {jsonError}
                </div>
              )}
            </div>
          ) : (
            // Form Mode
            <div className="space-y-4">
              {flowArguments.inputs.length === 0 ? (
                <div className="text-center py-8 text-[#6c7086]">
                  <p>No input arguments defined.</p>
                  <p className="text-xs mt-1">Add arguments in the sidebar to configure inputs.</p>
                </div>
              ) : (
                flowArguments.inputs.map(arg => (
                  <div key={arg.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-[#cdd6f4]">
                        {arg.name}
                        {arg.required && <span className="text-red-400 ml-1">*</span>}
                      </label>
                      <span className="text-xs text-[#45475a] bg-[#313244] px-2 py-0.5 rounded">
                        {arg.type}
                      </span>
                    </div>
                    {arg.description && (
                      <p className="text-xs text-[#6c7086]">{arg.description}</p>
                    )}
                    {arg.type === 'string' && (
                      <textarea
                        value={String(inputValues[arg.name] || '')}
                        onChange={(e) => handleInputChange(arg.name, e.target.value)}
                        className="w-full px-3 py-2 bg-[#181825] border border-[#313244] rounded-lg text-sm text-[#cdd6f4] resize-none focus:outline-none focus:border-purple-500"
                        rows={3}
                        placeholder={arg.examples?.[0]?.toString() || `Enter ${arg.name}...`}
                      />
                    )}
                    {arg.type === 'number' && (
                      <input
                        type="number"
                        value={Number(inputValues[arg.name]) || 0}
                        onChange={(e) => handleInputChange(arg.name, parseFloat(e.target.value))}
                        className="w-full px-3 py-2 bg-[#181825] border border-[#313244] rounded-lg text-sm text-[#cdd6f4] focus:outline-none focus:border-purple-500"
                      />
                    )}
                    {arg.type === 'boolean' && (
                      <button
                        onClick={() => handleInputChange(arg.name, !inputValues[arg.name])}
                        className={`w-12 h-6 rounded-full transition-colors ${
                          inputValues[arg.name] ? 'bg-green-600' : 'bg-[#313244]'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                          inputValues[arg.name] ? 'translate-x-6' : 'translate-x-0.5'
                        }`} />
                      </button>
                    )}
                    {(arg.type === 'object' || arg.type === 'array') && (
                      <textarea
                        value={JSON.stringify(inputValues[arg.name] || (arg.type === 'array' ? [] : {}), null, 2)}
                        onChange={(e) => {
                          try {
                            handleInputChange(arg.name, JSON.parse(e.target.value));
                          } catch {
                            // Allow invalid JSON during editing
                          }
                        }}
                        className="w-full px-3 py-2 bg-[#181825] border border-[#313244] rounded-lg text-sm font-mono text-[#cdd6f4] resize-none focus:outline-none focus:border-purple-500"
                        rows={4}
                      />
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#313244]">
          <button
            onClick={handleSaveAsTestCase}
            className="flex items-center gap-2 px-3 py-2 text-sm text-[#6c7086] hover:text-[#a6adc8] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Save as Test Case
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-[#6c7086] hover:text-[#cdd6f4] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleRun}
              disabled={jsonMode && !!jsonError}
              className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Play className="w-4 h-4" />
              Run Flow
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
