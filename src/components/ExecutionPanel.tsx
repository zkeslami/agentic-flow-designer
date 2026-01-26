import { useState, useCallback, useRef, useEffect } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ChevronRight,
  X,
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Minimize2,
  Clock,
  Cpu,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Code,
  MessageSquare,
  GitBranch,
  BarChart3,
  FileJson,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';
import type {
  ExecutionRun,
  ExecutionTrace,
  TraceViewConfig,
} from '../types/execution';
import { DEFAULT_TRACE_VIEW_CONFIG } from '../types/execution';

interface ExecutionPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
  currentRun: ExecutionRun | null;
  runHistory: ExecutionRun[];
  onSelectRun: (runId: string) => void;
  onRerun: () => void;
  onCancel: () => void;
}

const STATUS_ICONS = {
  pending: <Clock className="w-4 h-4 text-[#6c7086]" />,
  running: <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />,
  completed: <CheckCircle2 className="w-4 h-4 text-green-400" />,
  failed: <XCircle className="w-4 h-4 text-red-400" />,
  cancelled: <AlertCircle className="w-4 h-4 text-yellow-400" />,
};

const STATUS_COLORS = {
  pending: 'text-[#6c7086]',
  running: 'text-blue-400',
  completed: 'text-green-400',
  failed: 'text-red-400',
  cancelled: 'text-yellow-400',
};

export default function ExecutionPanel({
  isOpen,
  onClose,
  onToggle,
  currentRun,
  runHistory: _runHistory,
  onSelectRun: _onSelectRun,
  onRerun,
  onCancel,
}: ExecutionPanelProps) {
  const [viewConfig, setViewConfig] = useState<TraceViewConfig>(DEFAULT_TRACE_VIEW_CONFIG);
  const [selectedTraceId, setSelectedTraceId] = useState<string | null>(null);
  const [panelHeight, setPanelHeight] = useState(350);
  const [isResizing, setIsResizing] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [copied, setCopied] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Handle resize
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newHeight = window.innerHeight - e.clientY;
      setPanelHeight(Math.max(200, Math.min(window.innerHeight - 100, newHeight)));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const toggleTrace = useCallback((traceId: string) => {
    setViewConfig(prev => ({
      ...prev,
      expandedTraceIds: prev.expandedTraceIds.includes(traceId)
        ? prev.expandedTraceIds.filter(id => id !== traceId)
        : [...prev.expandedTraceIds, traceId],
    }));
  }, []);

  const handleCopyJson = useCallback(async (data: unknown) => {
    await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const selectedTrace = currentRun?.traces.find(t => t.id === selectedTraceId);

  // Calculate timeline metrics
  const timelineStart = currentRun?.traces[0]?.startedAt
    ? new Date(currentRun.traces[0].startedAt).getTime()
    : 0;
  const timelineEnd = currentRun?.completedAt
    ? new Date(currentRun.completedAt).getTime()
    : Date.now();
  const totalDuration = timelineEnd - timelineStart;

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-0 left-64 right-80 h-8 bg-[#181825] border-t border-[#313244] flex items-center justify-center gap-2 text-[#6c7086] hover:text-[#cdd6f4] transition-colors z-40"
      >
        <ChevronUp className="w-4 h-4" />
        <span className="text-xs font-medium">
          {currentRun ? `Execution: ${currentRun.status}` : 'Execution Panel'}
        </span>
        {currentRun?.status === 'running' && (
          <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
        )}
      </button>
    );
  }

  return (
    <div
      ref={panelRef}
      className={`fixed bottom-0 left-64 right-80 bg-[#1e1e2e] border-t border-[#313244] flex flex-col z-40 ${
        isMaximized ? 'top-12' : ''
      }`}
      style={{ height: isMaximized ? undefined : panelHeight }}
    >
      {/* Resize Handle */}
      {!isMaximized && (
        <div
          onMouseDown={handleMouseDown}
          className="absolute top-0 left-0 right-0 h-1 cursor-ns-resize hover:bg-purple-500/50 transition-colors"
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#313244] bg-[#181825]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4 text-green-400" />
            <span className="font-medium text-[#cdd6f4]">Execution</span>
            {currentRun && (
              <span className={`text-sm ${STATUS_COLORS[currentRun.status]}`}>
                {currentRun.status}
              </span>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-[#1e1e2e] p-0.5 rounded-md">
            <button
              onClick={() => setViewConfig(prev => ({ ...prev, mode: 'waterfall' }))}
              className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
                viewConfig.mode === 'waterfall'
                  ? 'bg-[#313244] text-[#cdd6f4]'
                  : 'text-[#6c7086] hover:text-[#a6adc8]'
              }`}
            >
              <BarChart3 className="w-3 h-3" />
              Waterfall
            </button>
            <button
              onClick={() => setViewConfig(prev => ({ ...prev, mode: 'span' }))}
              className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
                viewConfig.mode === 'span'
                  ? 'bg-[#313244] text-[#cdd6f4]'
                  : 'text-[#6c7086] hover:text-[#a6adc8]'
              }`}
            >
              <GitBranch className="w-3 h-3" />
              Trace Spans
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Summary Stats */}
          {currentRun && (
            <div className="flex items-center gap-4 text-xs text-[#6c7086] mr-4">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {currentRun.summary.totalDurationMs}ms
              </span>
              <span className="flex items-center gap-1">
                <Cpu className="w-3 h-3" />
                {currentRun.summary.completedNodes}/{currentRun.summary.totalNodes} nodes
              </span>
              {currentRun.summary.tokensUsed && (
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  {currentRun.summary.tokensUsed} tokens
                </span>
              )}
            </div>
          )}

          {/* Actions */}
          {currentRun?.status === 'running' && (
            <button
              onClick={onCancel}
              className="p-1.5 rounded hover:bg-[#313244] text-yellow-400"
              title="Cancel"
            >
              <Pause className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onRerun}
            className="p-1.5 rounded hover:bg-[#313244] text-[#6c7086]"
            title="Re-run"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="p-1.5 rounded hover:bg-[#313244] text-[#6c7086]"
            title={isMaximized ? 'Minimize' : 'Maximize'}
          >
            {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onToggle}
            className="p-1.5 rounded hover:bg-[#313244] text-[#6c7086]"
            title="Minimize"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-[#313244] text-[#6c7086]"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Trace List */}
        <div className="w-80 border-r border-[#313244] overflow-y-auto">
          {!currentRun ? (
            <div className="flex flex-col items-center justify-center h-full text-[#6c7086]">
              <Play className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">No execution running</p>
              <p className="text-xs mt-1">Run your flow to see execution traces</p>
            </div>
          ) : viewConfig.mode === 'waterfall' ? (
            // Waterfall View
            <div className="p-2 space-y-1">
              {currentRun.traces.map((trace) => {
                const traceStart = new Date(trace.startedAt).getTime();
                const traceEnd = trace.completedAt
                  ? new Date(trace.completedAt).getTime()
                  : Date.now();
                const startPercent = totalDuration > 0
                  ? ((traceStart - timelineStart) / totalDuration) * 100
                  : 0;
                const widthPercent = totalDuration > 0
                  ? ((traceEnd - traceStart) / totalDuration) * 100
                  : 100;

                return (
                  <div
                    key={trace.id}
                    onClick={() => setSelectedTraceId(trace.id)}
                    className={`p-2 rounded-lg cursor-pointer transition-colors ${
                      selectedTraceId === trace.id
                        ? 'bg-purple-500/20 border border-purple-500/50'
                        : 'hover:bg-[#313244] border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {STATUS_ICONS[trace.status]}
                      <span className="text-sm font-medium text-[#cdd6f4] truncate">
                        {trace.nodeName}
                      </span>
                      <span className="text-xs text-[#45475a] ml-auto">
                        {trace.durationMs}ms
                      </span>
                    </div>

                    {/* Timeline Bar */}
                    <div className="h-2 bg-[#313244] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          trace.status === 'completed' ? 'bg-green-500' :
                          trace.status === 'failed' ? 'bg-red-500' :
                          trace.status === 'running' ? 'bg-blue-500 animate-pulse' :
                          'bg-[#45475a]'
                        }`}
                        style={{
                          marginLeft: `${startPercent}%`,
                          width: `${Math.max(2, widthPercent)}%`,
                        }}
                      />
                    </div>

                    {/* LLM Explanation Preview */}
                    {trace.llmExplanation && (
                      <p className="text-xs text-[#6c7086] mt-1 truncate">
                        <Sparkles className="w-3 h-3 inline mr-1 text-purple-400" />
                        {trace.llmExplanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            // Span View (Tree)
            <div className="p-2">
              {currentRun.traces.map(trace => (
                <TraceSpanItem
                  key={trace.id}
                  trace={trace}
                  depth={0}
                  isExpanded={viewConfig.expandedTraceIds.includes(trace.id)}
                  isSelected={selectedTraceId === trace.id}
                  onToggle={() => toggleTrace(trace.id)}
                  onSelect={() => setSelectedTraceId(trace.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Trace Details */}
        <div className="flex-1 overflow-y-auto p-4">
          {selectedTrace ? (
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    {STATUS_ICONS[selectedTrace.status]}
                    <h3 className="text-lg font-medium text-[#cdd6f4]">{selectedTrace.nodeName}</h3>
                  </div>
                  <p className="text-xs text-[#6c7086] mt-0.5">
                    {selectedTrace.nodeType} • {selectedTrace.durationMs}ms
                  </p>
                </div>
                <span className="text-xs text-[#45475a]">{selectedTrace.id}</span>
              </div>

              {/* LLM Explanation */}
              {selectedTrace.llmExplanation && (
                <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-medium text-purple-300">What's Happening</span>
                  </div>
                  <p className="text-sm text-[#cdd6f4]">{selectedTrace.llmExplanation}</p>
                </div>
              )}

              {/* Reasoning */}
              {selectedTrace.reasoning && (
                <div className="p-3 bg-[#181825] border border-[#313244] rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium text-[#cdd6f4]">Reasoning</span>
                  </div>
                  <p className="text-sm text-[#a6adc8] whitespace-pre-wrap">{selectedTrace.reasoning}</p>
                </div>
              )}

              {/* Input */}
              {viewConfig.showInput && (
                <div className="p-3 bg-[#181825] border border-[#313244] rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <ChevronRight className="w-4 h-4 text-green-400" />
                      <span className="text-sm font-medium text-[#cdd6f4]">Input</span>
                    </div>
                    <button
                      onClick={() => handleCopyJson(selectedTrace.input)}
                      className="text-xs text-[#6c7086] hover:text-[#a6adc8] flex items-center gap-1"
                    >
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <pre className="text-xs font-mono text-[#a6adc8] overflow-x-auto">
                    {JSON.stringify(selectedTrace.input, null, 2)}
                  </pre>
                </div>
              )}

              {/* Output */}
              {viewConfig.showOutput && selectedTrace.output && (
                <div className="p-3 bg-[#181825] border border-[#313244] rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <ChevronRight className="w-4 h-4 text-blue-400 rotate-180" />
                      <span className="text-sm font-medium text-[#cdd6f4]">Output</span>
                    </div>
                    <button
                      onClick={() => handleCopyJson(selectedTrace.output)}
                      className="text-xs text-[#6c7086] hover:text-[#a6adc8] flex items-center gap-1"
                    >
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <pre className="text-xs font-mono text-[#a6adc8] overflow-x-auto">
                    {JSON.stringify(selectedTrace.output, null, 2)}
                  </pre>
                </div>
              )}

              {/* Error */}
              {selectedTrace.error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="w-4 h-4 text-red-400" />
                    <span className="text-sm font-medium text-red-300">Error</span>
                  </div>
                  <pre className="text-xs font-mono text-red-300 overflow-x-auto">
                    {selectedTrace.error}
                  </pre>
                </div>
              )}

              {/* Tool Calls */}
              {selectedTrace.toolCalls && selectedTrace.toolCalls.length > 0 && (
                <div className="p-3 bg-[#181825] border border-[#313244] rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Code className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-medium text-[#cdd6f4]">Tool Calls</span>
                  </div>
                  <div className="space-y-2">
                    {selectedTrace.toolCalls.map(tool => (
                      <div key={tool.id} className="p-2 bg-[#1e1e2e] rounded border border-[#313244]">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[#cdd6f4]">{tool.toolName}</span>
                          <span className={`text-xs ${STATUS_COLORS[tool.status]}`}>
                            {tool.durationMs}ms
                          </span>
                        </div>
                        {tool.toolOutput !== undefined && (
                          <pre className="text-xs font-mono text-[#6c7086] mt-1 truncate">
                            {String(JSON.stringify(tool.toolOutput)).substring(0, 100)}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata */}
              {viewConfig.showMetadata && (
                <div className="p-3 bg-[#181825] border border-[#313244] rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FileJson className="w-4 h-4 text-[#6c7086]" />
                    <span className="text-sm font-medium text-[#cdd6f4]">Metadata</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {selectedTrace.metadata.model && (
                      <div>
                        <span className="text-[#6c7086]">Model:</span>
                        <span className="text-[#a6adc8] ml-2">{selectedTrace.metadata.model}</span>
                      </div>
                    )}
                    {selectedTrace.metadata.temperature !== undefined && (
                      <div>
                        <span className="text-[#6c7086]">Temperature:</span>
                        <span className="text-[#a6adc8] ml-2">{selectedTrace.metadata.temperature}</span>
                      </div>
                    )}
                    {selectedTrace.metadata.tokensInput !== undefined && (
                      <div>
                        <span className="text-[#6c7086]">Tokens In:</span>
                        <span className="text-[#a6adc8] ml-2">{selectedTrace.metadata.tokensInput}</span>
                      </div>
                    )}
                    {selectedTrace.metadata.tokensOutput !== undefined && (
                      <div>
                        <span className="text-[#6c7086]">Tokens Out:</span>
                        <span className="text-[#a6adc8] ml-2">{selectedTrace.metadata.tokensOutput}</span>
                      </div>
                    )}
                    {selectedTrace.metadata.latencyMs !== undefined && (
                      <div>
                        <span className="text-[#6c7086]">Latency:</span>
                        <span className="text-[#a6adc8] ml-2">{selectedTrace.metadata.latencyMs}ms</span>
                      </div>
                    )}
                    {selectedTrace.metadata.cacheHit !== undefined && (
                      <div>
                        <span className="text-[#6c7086]">Cache Hit:</span>
                        <span className="text-[#a6adc8] ml-2">{selectedTrace.metadata.cacheHit ? 'Yes' : 'No'}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-[#6c7086]">
              <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">Select a trace to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Trace Span Item Component (for tree view)
function TraceSpanItem({
  trace,
  depth,
  isExpanded,
  isSelected,
  onToggle,
  onSelect,
}: {
  trace: ExecutionTrace;
  depth: number;
  isExpanded: boolean;
  isSelected: boolean;
  onToggle: () => void;
  onSelect: () => void;
}) {
  const hasChildren = trace.children && trace.children.length > 0;

  return (
    <div style={{ marginLeft: depth * 16 }}>
      <div
        onClick={onSelect}
        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
          isSelected
            ? 'bg-purple-500/20 border border-purple-500/50'
            : 'hover:bg-[#313244] border border-transparent'
        }`}
      >
        {hasChildren && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
            className="p-0.5 hover:bg-[#45475a] rounded"
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3 text-[#6c7086]" />
            ) : (
              <ChevronRight className="w-3 h-3 text-[#6c7086]" />
            )}
          </button>
        )}
        {!hasChildren && <div className="w-4" />}

        {STATUS_ICONS[trace.status]}

        <span className="text-sm text-[#cdd6f4] truncate flex-1">
          {trace.nodeName}
        </span>

        <span className="text-xs text-[#45475a]">
          {trace.durationMs}ms
        </span>
      </div>

      {isExpanded && hasChildren && (
        <div className="mt-1">
          {trace.children!.map(child => (
            <TraceSpanItem
              key={child.id}
              trace={child}
              depth={depth + 1}
              isExpanded={false}
              isSelected={false}
              onToggle={() => {}}
              onSelect={() => {}}
            />
          ))}
        </div>
      )}
    </div>
  );
}
