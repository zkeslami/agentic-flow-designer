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
import type { AgentNode, AgentPatternType, AgentNodeData } from './types';
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
import type { FlowArgumentsConfig, ExecutionRun, TestInput, ExecutionTrace } from './types/execution';
import { DEFAULT_FLOW_ARGUMENTS, createExecutionTrace } from './types/execution';

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
    id: 'retrieval-1',
    type: 'agentNode',
    position: { x: 350, y: 100 },
    data: {
      type: 'retrieval',
      label: 'Knowledge Search',
      config: { groundingMode: 'strict', maxResults: 5 },
    },
  },
  {
    id: 'llm-1',
    type: 'agentNode',
    position: { x: 600, y: 200 },
    data: {
      type: 'llm',
      label: 'Generate Response',
      config: { model: 'gpt-4', temperature: 0.7 },
    },
  },
  {
    id: 'output-1',
    type: 'agentNode',
    position: { x: 850, y: 200 },
    data: {
      type: 'output',
      label: 'Response',
      config: { outputFormat: 'json' },
    },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: 'trigger-1', target: 'retrieval-1', animated: true },
  { id: 'e2-3', source: 'retrieval-1', target: 'llm-1', animated: true },
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

  // Flow arguments state
  const [flowArguments, setFlowArguments] = useState<FlowArgumentsConfig>(DEFAULT_FLOW_ARGUMENTS);

  // Execution state
  const [isTestInputModalOpen, setIsTestInputModalOpen] = useState(false);
  const [isExecutionPanelOpen, setIsExecutionPanelOpen] = useState(false);
  const [currentRun, setCurrentRun] = useState<ExecutionRun | null>(null);
  const [runHistory, setRunHistory] = useState<ExecutionRun[]>([]);
  const [recentTestInputs, setRecentTestInputs] = useState<TestInput[]>([]);

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
    setSelectedNode(node.id);
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
    // Simple horizontal layout
    const sortedNodes = [...nodes].sort((a, b) => {
      // Sort by dependencies (trigger first, output last)
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
        x: 100 + index * 250,
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

    // Create a new execution run
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

    // Simulate execution with traces
    const simulateExecution = async () => {
      const traces: ExecutionTrace[] = [];
      let completedNodes = 0;

      for (const node of nodes) {
        const nodeData = node.data as AgentNodeData;
        const trace = createExecutionTrace(node.id, nodeData.label, nodeData.type, input);
        trace.status = 'running';
        trace.llmExplanation = `Processing ${nodeData.label}...`;

        // Update current run with new trace
        traces.push(trace);
        setCurrentRun(prev => prev ? {
          ...prev,
          traces: [...traces],
        } : null);

        // Simulate processing time
        await new Promise(r => setTimeout(r, 500 + Math.random() * 1000));

        // Complete the trace
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

      // Complete the run
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

  const selectedNodeData = useMemo(() => {
    const found = nodes.find((n) => n.id === selectedNode);
    return found ? (found as AgentNode) : null;
  }, [nodes, selectedNode]);

  // Cast nodes to AgentNode[] for CodePanel and AIAssistant
  const agentNodes = nodes as AgentNode[];

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
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Node palette */}
        {viewMode !== 'code' && (
          <Sidebar
            onDragStart={onDragStart}
            flowArguments={flowArguments}
            onUpdateArguments={setFlowArguments}
            selectedNodeId={selectedNode}
          />
        )}

        {/* Canvas / Code View */}
        <div className="flex-1 flex">
          {/* Visual Canvas */}
          {(viewMode === 'visual' || viewMode === 'split') && (
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
        {selectedNode && viewMode !== 'code' && (
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
