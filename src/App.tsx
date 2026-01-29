import { useCallback, useState, useRef, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type Node,
  type NodeMouseHandler,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';
import type { AgentNode, AgentPatternType, AgentNodeData, SyncStatus, DeepRAGConfig, BatchTransformConfig } from './types';
import { nodeConfigs } from './utils/nodeConfig';
import AgentNodeComponent from './components/AgentNode';
import Sidebar from './components/Sidebar';
import PropertiesPanel from './components/PropertiesPanel';
import CodePanel from './components/CodePanel';
import Toolbar, { type ViewMode } from './components/Toolbar';
import AIAssistant from './components/AIAssistant';
import EvaluationPanel from './components/EvaluationPanel';
import TestInputModal from './components/TestInputModal';
import ExecutionPanel from './components/ExecutionPanel';
import { DeepRAGFullEditor, BatchTransformFullEditor } from './components/PatternEditors';
import ActivityBar, { type ActivityView } from './components/ActivityBar';
import FileExplorer, { type GeneratedFile } from './components/FileExplorer';
import SourceControlPanel from './components/SourceControlPanel';
import type { FlowArgumentsConfig, ExecutionRun, TestInput, ExecutionTrace } from './types/execution';
import { DEFAULT_FLOW_ARGUMENTS, createExecutionTrace } from './types/execution';
import Editor from '@monaco-editor/react';

const nodeTypes = {
  agentNode: AgentNodeComponent,
};

// Initial nodes for demo
const initialNodes: Node<AgentNodeData>[] = [
  {
    id: 'trigger-1',
    type: 'agentNode',
    position: { x: 100, y: 200 },
    data: {
      type: 'trigger',
      label: 'Start',
      config: { triggerType: 'manual' },
    },
  },
  {
    id: 'agent-1',
    type: 'agentNode',
    position: { x: 350, y: 180 },
    data: {
      type: 'agent',
      label: 'Agent',
      config: {
        name: 'Research Agent',
        role: 'researcher',
        goal: 'Find relevant information',
        model: 'gpt-4',
        temperature: 0.7,
        tools: [
          { id: 'tool-1', name: 'Search API', description: 'Search the web', parameters: {}, requiresApproval: false },
          { id: 'tool-2', name: 'Calculator', description: 'Perform calculations', parameters: {}, requiresApproval: false },
        ],
        memoryType: 'conversation',
        contextWindow: 4096,
        reasoningMode: 'react',
        maxIterations: 10,
        confidenceThreshold: 0.8,
        hitlMode: 'on_low_confidence',
        approvalTimeout: 300,
      },
    },
  },
  {
    id: 'llm-1',
    type: 'agentNode',
    position: { x: 650, y: 200 },
    data: {
      type: 'llm',
      label: 'Generate Response',
      config: { model: 'gpt-4', temperature: 0.7 },
    },
  },
  {
    id: 'output-1',
    type: 'agentNode',
    position: { x: 900, y: 200 },
    data: {
      type: 'output',
      label: 'Response',
      config: { outputFormat: 'json' },
    },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: 'trigger-1', target: 'agent-1', animated: true },
  { id: 'e2-3', source: 'agent-1', target: 'llm-1', animated: true },
  { id: 'e3-4', source: 'llm-1', target: 'output-1', animated: true },
];

let nodeId = 10;
const getId = () => `node-${nodeId++}`;

function FlowDesigner() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('visual');
  const [isEvalPanelOpen, setIsEvalPanelOpen] = useState(false);
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const { screenToFlowPosition, zoomIn, zoomOut, fitView } = useReactFlow();

  // IDE Layout state
  const [activeView, setActiveView] = useState<ActivityView>('nodes');
  const [selectedFile, setSelectedFile] = useState<GeneratedFile | null>(null);
  const [sidebarWidth] = useState(280);

  // Flow arguments state
  const [flowArguments, setFlowArguments] = useState<FlowArgumentsConfig>(DEFAULT_FLOW_ARGUMENTS);

  // Execution state
  const [isTestInputModalOpen, setIsTestInputModalOpen] = useState(false);
  const [isExecutionPanelOpen, setIsExecutionPanelOpen] = useState(false);
  const [currentRun, setCurrentRun] = useState<ExecutionRun | null>(null);
  const [runHistory, setRunHistory] = useState<ExecutionRun[]>([]);
  const [recentTestInputs, setRecentTestInputs] = useState<TestInput[]>([]);

  // Sync status for bidirectional editing (CGIS Architecture)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');

  // Pattern editor state
  const [patternEditorNode, setPatternEditorNode] = useState<AgentNode | null>(null);

  // Determine sync status based on node states
  const computedSyncStatus = useMemo<SyncStatus>(() => {
    const hasCodeOnlyRegions = nodes.some((n) => (n.data as AgentNodeData).hasCodeOverride);
    if (hasCodeOnlyRegions) return 'code_only';
    return syncStatus;
  }, [nodes, syncStatus]);

  // Count changes for source control
  const changesCount = useMemo(() => {
    return nodes.length + edges.length;
  }, [nodes, edges]);

  // Force sync handler
  const handleForceSync = useCallback(() => {
    setSyncStatus('parsing');
    setTimeout(() => {
      setSyncStatus('synced');
    }, 500);
  }, []);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge({ ...connection, animated: true }, eds));
    },
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/agentflow') as AgentPatternType;
      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const config = nodeConfigs[type];
      const newNode: Node<AgentNodeData> = {
        id: getId(),
        type: 'agentNode',
        position,
        data: {
          type,
          label: config.label,
          config: { ...config.defaultData },
        },
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [screenToFlowPosition, setNodes]
  );

  const onDragStart = (event: React.DragEvent, nodeType: AgentPatternType) => {
    event.dataTransfer.setData('application/agentflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const onNodeClick: NodeMouseHandler = useCallback((_, node) => {
    const nodeData = node.data as AgentNodeData;
    const nodeConfig = nodeConfigs[nodeData.type as AgentPatternType];

    if (nodeConfig?.hasSpecializedEditor) {
      setPatternEditorNode(node as AgentNode);
    } else {
      setSelectedNode(node.id);
    }
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const handleNodeUpdate = useCallback(
    (nodeId: string, data: Partial<AgentNodeData>) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: { ...node.data, ...data } as AgentNodeData,
            };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  const handlePatternConfigUpdate = useCallback(
    (config: Record<string, unknown>) => {
      if (patternEditorNode) {
        handleNodeUpdate(patternEditorNode.id, { config });
      }
    },
    [patternEditorNode, handleNodeUpdate]
  );

  // AI Assistant handlers
  const handleAddNode = useCallback(
    (node: AgentNode) => {
      setNodes((nds) => [...nds, node as Node<AgentNodeData>]);
      setTimeout(() => fitView({ padding: 0.2 }), 100);
    },
    [setNodes, fitView]
  );

  const handleRemoveNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    },
    [setNodes]
  );

  const handleAddEdge = useCallback(
    (edge: Edge) => {
      setEdges((eds) => [...eds, edge]);
    },
    [setEdges]
  );

  const handleRemoveEdge = useCallback(
    (edgeId: string) => {
      setEdges((eds) => eds.filter((e) => e.id !== edgeId));
    },
    [setEdges]
  );

  const handleSetNodes = useCallback(
    (newNodes: AgentNode[]) => {
      setNodes(newNodes as Node<AgentNodeData>[]);
      setTimeout(() => fitView({ padding: 0.2 }), 100);
    },
    [setNodes, fitView]
  );

  const handleSetEdges = useCallback(
    (newEdges: Edge[]) => {
      setEdges(newEdges);
    },
    [setEdges]
  );

  const handleAutoLayout = useCallback(() => {
    const sortedNodes = [...nodes].sort((a, b) => {
      const order: Record<string, number> = { trigger: 0, output: 100 };
      const aType = (a.data as AgentNodeData).type;
      const bType = (b.data as AgentNodeData).type;
      const aOrder = order[aType] ?? 50;
      const bOrder = order[bType] ?? 50;
      return aOrder - bOrder;
    });

    const layoutedNodes = sortedNodes.map((node, index) => ({
      ...node,
      position: {
        x: 100 + index * 300,
        y: 200,
      },
    }));

    setNodes(layoutedNodes);
    setTimeout(() => fitView({ padding: 0.2 }), 50);
  }, [nodes, setNodes, fitView]);

  const handleSave = useCallback(() => {
    const flow = { nodes, edges };
    const json = JSON.stringify(flow, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workflow.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [nodes, edges]);

  const handleRun = useCallback(() => {
    setIsTestInputModalOpen(true);
  }, []);

  const handleExecuteFlow = useCallback((input: Record<string, unknown>) => {
    setIsTestInputModalOpen(false);
    setIsExecutionPanelOpen(true);

    const runId = `run-${Date.now()}`;
    const newRun: ExecutionRun = {
      id: runId,
      name: `Run ${runHistory.length + 1}`,
      status: 'running',
      startedAt: new Date().toISOString(),
      input,
      traces: [],
      summary: {
        totalNodes: nodes.length,
        completedNodes: 0,
        failedNodes: 0,
        totalDurationMs: 0,
      },
    };

    setCurrentRun(newRun);

    const simulateExecution = async () => {
      const traces: ExecutionTrace[] = [];
      let completedNodes = 0;

      for (const node of nodes) {
        const nodeData = node.data as AgentNodeData;
        const trace = createExecutionTrace(node.id, nodeData.label, nodeData.type, input);
        trace.status = 'running';
        trace.llmExplanation = `Processing ${nodeData.label}...`;

        traces.push(trace);
        setCurrentRun(prev => prev ? {
          ...prev,
          traces: [...traces],
        } : null);

        await new Promise(r => setTimeout(r, 500 + Math.random() * 1000));

        trace.status = 'completed';
        trace.completedAt = new Date().toISOString();
        trace.durationMs = Math.floor(500 + Math.random() * 1000);
        trace.output = { result: `Output from ${nodeData.label}` };
        trace.llmExplanation = `Completed processing ${nodeData.label}`;
        trace.reasoning = nodeData.type === 'llm' ? 'Analyzed the input and generated a response based on the context provided.' : undefined;
        trace.metadata = {
          model: nodeData.type === 'llm' ? 'gpt-4' : undefined,
          tokensInput: nodeData.type === 'llm' ? Math.floor(Math.random() * 500) : undefined,
          tokensOutput: nodeData.type === 'llm' ? Math.floor(Math.random() * 300) : undefined,
          latencyMs: trace.durationMs,
        };

        completedNodes++;

        setCurrentRun(prev => prev ? {
          ...prev,
          traces: [...traces],
          summary: {
            ...prev.summary,
            completedNodes,
            totalDurationMs: traces.reduce((acc, t) => acc + t.durationMs, 0),
          },
        } : null);
      }

      setCurrentRun(prev => {
        if (!prev) return null;
        const completedRun: ExecutionRun = {
          ...prev,
          status: 'completed',
          completedAt: new Date().toISOString(),
          output: { response: 'Workflow completed successfully' },
        };
        setRunHistory(history => [completedRun, ...history]);
        return completedRun;
      });
    };

    simulateExecution();
  }, [nodes, runHistory.length]);

  const handleSaveTestInput = useCallback((input: TestInput) => {
    setRecentTestInputs(prev => [input, ...prev.slice(0, 9)]);
  }, []);

  const handleSelectRun = useCallback((runId: string) => {
    const run = runHistory.find(r => r.id === runId);
    if (run) {
      setCurrentRun(run);
    }
  }, [runHistory]);

  const handleRerun = useCallback(() => {
    if (currentRun?.input) {
      handleExecuteFlow(currentRun.input);
    }
  }, [currentRun, handleExecuteFlow]);

  const handleCancelRun = useCallback(() => {
    setCurrentRun(prev => prev ? {
      ...prev,
      status: 'cancelled',
      completedAt: new Date().toISOString(),
    } : null);
  }, []);

  const handleFileSelect = useCallback((file: GeneratedFile) => {
    setSelectedFile(file);
    setActiveView('explorer');
  }, []);

  const selectedNodeData = useMemo(() => {
    const found = nodes.find((n) => n.id === selectedNode);
    return found ? (found as AgentNode) : null;
  }, [nodes, selectedNode]);

  const agentNodes = nodes as AgentNode[];

  // Render sidebar content based on active view
  const renderSidebarContent = () => {
    switch (activeView) {
      case 'explorer':
        return (
          <FileExplorer
            nodes={agentNodes}
            edges={edges}
            flowName="my_agent_flow"
            onFileSelect={handleFileSelect}
            selectedFile={selectedFile?.id}
          />
        );
      case 'sourceControl':
        return (
          <SourceControlPanel
            hasChanges={changesCount > 0}
            changesCount={changesCount}
            currentBranch="main"
          />
        );
      case 'nodes':
        return (
          <Sidebar
            onDragStart={onDragStart}
            flowArguments={flowArguments}
            onUpdateArguments={setFlowArguments}
            selectedNodeId={selectedNode}
            syncStatus={computedSyncStatus}
            nodeCount={nodes.length}
            edgeCount={edges.length}
          />
        );
      case 'run':
      case 'debug':
        return (
          <div className="h-full flex flex-col bg-[#181825] p-4">
            <h3 className="text-sm font-semibold text-[#cdd6f4] mb-4">
              {activeView === 'run' ? 'Run & Debug' : 'Debug Console'}
            </h3>
            <p className="text-xs text-[#6c7086]">
              {activeView === 'run'
                ? 'Click the Run button in the toolbar to execute the flow.'
                : 'Debug output will appear here during execution.'}
            </p>
          </div>
        );
      case 'search':
        return (
          <div className="h-full flex flex-col bg-[#181825] p-4">
            <h3 className="text-sm font-semibold text-[#cdd6f4] mb-4">Search</h3>
            <input
              type="text"
              placeholder="Search nodes and code..."
              className="w-full px-3 py-2 bg-[#1e1e2e] border border-[#313244] rounded-md text-sm text-[#cdd6f4] placeholder-[#45475a] focus:outline-none focus:border-blue-500"
            />
          </div>
        );
      case 'settings':
        return (
          <div className="h-full flex flex-col bg-[#181825] p-4">
            <h3 className="text-sm font-semibold text-[#cdd6f4] mb-4">Settings</h3>
            <p className="text-xs text-[#6c7086]">Flow and editor settings.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#11111b]">
      {/* Toolbar */}
      <Toolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onFitView={() => fitView({ padding: 0.2 })}
        onAutoLayout={handleAutoLayout}
        onSave={handleSave}
        onRun={handleRun}
        onEvaluate={() => setIsEvalPanelOpen(true)}
        syncStatus={computedSyncStatus}
        onForceSync={handleForceSync}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Activity Bar */}
        <ActivityBar
          activeView={activeView}
          onViewChange={setActiveView}
          hasChanges={computedSyncStatus !== 'synced'}
          changesCount={changesCount}
        />

        {/* Sidebar - Dynamic content based on active view */}
        {viewMode !== 'code' && (
          <div
            className="h-full border-r border-[#313244]"
            style={{ width: sidebarWidth }}
          >
            {renderSidebarContent()}
          </div>
        )}

        {/* Canvas / Code View */}
        <div className="flex-1 flex">
          {/* File Code Editor - when a file is selected */}
          {selectedFile && activeView === 'explorer' && (
            <div className="flex-1 flex flex-col border-r border-[#313244]">
              {/* File tab */}
              <div className="flex items-center px-4 py-2 bg-[#1e1e2e] border-b border-[#313244]">
                <span className="text-sm text-[#cdd6f4]">{selectedFile.name}</span>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="ml-2 p-0.5 hover:bg-[#313244] rounded"
                >
                  <span className="text-[#6c7086] text-xs">×</span>
                </button>
              </div>
              {/* Monaco editor */}
              <div className="flex-1">
                <Editor
                  height="100%"
                  language={selectedFile.type === 'python' ? 'python' : selectedFile.type === 'json' ? 'json' : selectedFile.type === 'yaml' ? 'yaml' : 'markdown'}
                  theme="vs-dark"
                  value={selectedFile.content}
                  options={{
                    readOnly: true,
                    minimap: { enabled: true },
                    fontSize: 13,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    wordWrap: 'on',
                    padding: { top: 12 },
                  }}
                />
              </div>
            </div>
          )}

          {/* Visual Canvas */}
          {(viewMode === 'visual' || viewMode === 'split') && !(selectedFile && activeView === 'explorer') && (
            <div
              ref={reactFlowWrapper}
              className={`${viewMode === 'split' ? 'w-1/2' : 'flex-1'} h-full`}
            >
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onDragOver={onDragOver}
                onDrop={onDrop}
                onNodeClick={onNodeClick}
                onPaneClick={onPaneClick}
                nodeTypes={nodeTypes}
                fitView
                snapToGrid
                snapGrid={[15, 15]}
                defaultEdgeOptions={{
                  style: { stroke: '#45475a', strokeWidth: 2 },
                  type: 'smoothstep',
                }}
                proOptions={{ hideAttribution: true }}
              >
                <Background
                  variant={BackgroundVariant.Dots}
                  gap={20}
                  size={1}
                  color="#313244"
                />
                <Controls
                  className="!bg-[#1e1e2e] !border-[#313244] !rounded-lg"
                  showZoom={false}
                  showFitView={false}
                />
              </ReactFlow>
            </div>
          )}

          {/* Code Panel */}
          {(viewMode === 'code' || viewMode === 'split') && (
            <div
              className={`${
                viewMode === 'split' ? 'w-1/2 border-l border-[#313244]' : 'flex-1'
              } h-full`}
            >
              <CodePanel nodes={agentNodes} edges={edges} />
            </div>
          )}
        </div>

        {/* Properties Panel - shown when node is selected */}
        {selectedNode && viewMode !== 'code' && !selectedFile && (
          <PropertiesPanel
            node={selectedNodeData}
            onUpdate={handleNodeUpdate}
            onClose={() => setSelectedNode(null)}
          />
        )}

        {/* AI Assistant - always visible on the right */}
        <AIAssistant
          nodes={agentNodes}
          edges={edges}
          viewMode={viewMode}
          onAddNode={handleAddNode}
          onRemoveNode={handleRemoveNode}
          onUpdateNode={handleNodeUpdate}
          onAddEdge={handleAddEdge}
          onRemoveEdge={handleRemoveEdge}
          onSetNodes={handleSetNodes}
          onSetEdges={handleSetEdges}
          onOpenEvaluation={() => setIsEvalPanelOpen(true)}
        />
      </div>

      {/* Evaluation Panel */}
      <EvaluationPanel
        nodes={agentNodes}
        edges={edges}
        selectedNodeIds={selectedNodeIds}
        onSelectNodes={setSelectedNodeIds}
        isOpen={isEvalPanelOpen}
        onClose={() => setIsEvalPanelOpen(false)}
      />

      {/* Test Input Modal */}
      <TestInputModal
        isOpen={isTestInputModalOpen}
        onClose={() => setIsTestInputModalOpen(false)}
        onRun={handleExecuteFlow}
        flowArguments={flowArguments}
        recentInputs={recentTestInputs}
        onSaveInput={handleSaveTestInput}
      />

      {/* Execution Panel */}
      <ExecutionPanel
        isOpen={isExecutionPanelOpen}
        onClose={() => setIsExecutionPanelOpen(false)}
        onToggle={() => setIsExecutionPanelOpen(prev => !prev)}
        currentRun={currentRun}
        runHistory={runHistory}
        onSelectRun={handleSelectRun}
        onRerun={handleRerun}
        onCancel={handleCancelRun}
      />

      {/* Pattern Editor Modals */}
      {patternEditorNode && (patternEditorNode.data as AgentNodeData).type === 'deepRAG' && (
        <DeepRAGFullEditor
          isOpen={true}
          onClose={() => setPatternEditorNode(null)}
          config={(patternEditorNode.data as AgentNodeData).config as Partial<DeepRAGConfig>}
          onChange={handlePatternConfigUpdate}
          nodeLabel={(patternEditorNode.data as AgentNodeData).label}
        />
      )}

      {patternEditorNode && (patternEditorNode.data as AgentNodeData).type === 'batchTransform' && (
        <BatchTransformFullEditor
          isOpen={true}
          onClose={() => setPatternEditorNode(null)}
          config={(patternEditorNode.data as AgentNodeData).config as Partial<BatchTransformConfig>}
          onChange={handlePatternConfigUpdate}
          nodeLabel={(patternEditorNode.data as AgentNodeData).label}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <FlowDesigner />
    </ReactFlowProvider>
  );
}
