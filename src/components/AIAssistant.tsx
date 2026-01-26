import { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Loader2,
  Check,
  AlertCircle,
  Code,
  Eye,
  Wand2,
  Trash2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { AgentNode, AgentNodeData } from '../types';
import type { Edge } from '@xyflow/react';
import type { ViewMode } from './Toolbar';

type ChangeType = 'add_node' | 'remove_node' | 'update_node' | 'add_edge' | 'remove_edge' | 'update_config' | 'update_edge' | 'code_override' | 'code_snippet' | 'open_evaluation' | 'generate_tests' | 'configure_evaluator';

interface Change {
  type: ChangeType;
  description: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  status?: 'pending' | 'success' | 'error';
  changes?: Change[];
}

interface AIAssistantProps {
  nodes: AgentNode[];
  edges: Edge[];
  viewMode: ViewMode;
  onAddNode: (node: AgentNode) => void;
  onRemoveNode: (nodeId: string) => void;
  onUpdateNode: (nodeId: string, data: Partial<AgentNodeData>) => void;
  onAddEdge: (edge: Edge) => void;
  onRemoveEdge: (edgeId: string) => void;
  onSetNodes: (nodes: AgentNode[]) => void;
  onSetEdges: (edges: Edge[]) => void;
  onOpenEvaluation?: () => void;
}

export default function AIAssistant({
  nodes,
  edges,
  viewMode,
  onAddNode,
  onRemoveNode,
  onUpdateNode,
  onAddEdge,
  onRemoveEdge,
  onSetNodes,
  onSetEdges,
  onOpenEvaluation,
}: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your AI assistant. I can help you build, modify, and **evaluate** your agentic workflow.\n\n**Visual commands:**\n• \"Add a human approval step\"\n• \"Create a RAG pipeline\"\n\n**Code commands:**\n• \"Add error handling\"\n• \"Add caching\"\n\n**Evaluation commands:**\n• \"Run evaluation on my flow\"\n• \"Generate test cases\"\n• \"Configure LLM judge evaluator\"\n• \"Set up online monitoring\"",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    // Process the request
    try {
      const result = await processAIRequest(
        input.trim(),
        nodes,
        edges,
        viewMode,
        { onAddNode, onRemoveNode, onUpdateNode, onAddEdge, onRemoveEdge, onSetNodes, onSetEdges, onOpenEvaluation }
      );

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.message,
        timestamp: new Date(),
        status: result.success ? 'success' : 'error',
        changes: result.changes,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I encountered an error processing your request. Please try rephrasing or being more specific.",
        timestamp: new Date(),
        status: 'error',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Chat cleared. How can I help you with your workflow?",
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className={`w-80 bg-[#181825] border-l border-[#313244] flex flex-col transition-all ${isMinimized ? 'h-12' : 'h-full'}`}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-[#313244] cursor-pointer"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20">
            <Bot className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h3 className="font-medium text-sm text-[#cdd6f4]">AI Assistant</h3>
            {!isMinimized && (
              <p className="text-[10px] text-[#6c7086]">
                {viewMode === 'code' ? 'Editing code' : viewMode === 'split' ? 'Split view' : 'Visual mode'}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {!isMinimized && (
            <button
              onClick={(e) => { e.stopPropagation(); clearChat(); }}
              className="p-1.5 rounded hover:bg-[#313244] transition-colors"
              title="Clear chat"
            >
              <Trash2 className="w-3.5 h-3.5 text-[#6c7086]" />
            </button>
          )}
          <button className="p-1.5 rounded hover:bg-[#313244] transition-colors">
            {isMinimized ? (
              <ChevronUp className="w-4 h-4 text-[#6c7086]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#6c7086]" />
            )}
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Mode Indicator */}
          <div className="px-4 py-2 border-b border-[#313244] bg-[#1e1e2e]">
            <div className="flex items-center gap-2 text-xs">
              {viewMode === 'code' ? (
                <>
                  <Code className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-[#a6adc8]">Changes will be applied to code</span>
                </>
              ) : viewMode === 'split' ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-[#a6adc8]">Syncing visual & code</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-[#a6adc8]">Changes will update canvas</span>
                </>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[90%] rounded-lg px-3 py-2 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-[#313244] text-[#cdd6f4]'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                  {/* Changes indicator */}
                  {message.changes && message.changes.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-white/10 space-y-1">
                      {message.changes.map((change, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs">
                          <Wand2 className="w-3 h-3 text-purple-300" />
                          <span className="text-white/80">{change.description}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Status indicator */}
                  {message.status && message.role === 'assistant' && (
                    <div className="mt-2 flex items-center gap-1 text-xs">
                      {message.status === 'success' ? (
                        <>
                          <Check className="w-3 h-3 text-green-400" />
                          <span className="text-green-400">Applied</span>
                        </>
                      ) : message.status === 'error' ? (
                        <>
                          <AlertCircle className="w-3 h-3 text-red-400" />
                          <span className="text-red-400">Failed</span>
                        </>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-[#313244] rounded-lg px-3 py-2 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                  <span className="text-sm text-[#a6adc8]">Thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-[#313244]">
            <div className="relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe changes to your workflow..."
                rows={2}
                className="w-full px-3 py-2 pr-10 bg-[#1e1e2e] border border-[#313244] rounded-lg text-sm text-[#cdd6f4] placeholder-[#45475a] focus:outline-none focus:border-purple-500 resize-none"
                disabled={isProcessing}
              />
              <button
                type="submit"
                disabled={!input.trim() || isProcessing}
                className="absolute right-2 bottom-2 p-1.5 rounded-md bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-[#45475a] mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </form>
        </>
      )}
    </div>
  );
}

// AI Request Processor
interface AIActions {
  onAddNode: (node: AgentNode) => void;
  onRemoveNode: (nodeId: string) => void;
  onUpdateNode: (nodeId: string, data: Partial<AgentNodeData>) => void;
  onAddEdge: (edge: Edge) => void;
  onRemoveEdge: (edgeId: string) => void;
  onSetNodes: (nodes: AgentNode[]) => void;
  onSetEdges: (edges: Edge[]) => void;
  onOpenEvaluation?: () => void;
}

interface AIResult {
  success: boolean;
  message: string;
  changes?: Change[];
}

let nodeIdCounter = 100;

async function processAIRequest(
  prompt: string,
  nodes: AgentNode[],
  edges: Edge[],
  viewMode: ViewMode,
  actions: AIActions
): Promise<AIResult> {
  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 500));

  const lowerPrompt = prompt.toLowerCase();
  const isCodeMode = viewMode === 'code' || viewMode === 'split';

  // Pattern matching for different intents

  // Add human-in-loop / approval step
  if (lowerPrompt.includes('human') || lowerPrompt.includes('approval') || lowerPrompt.includes('review')) {
    const llmNode = nodes.find(n => n.data.type === 'llm');
    const outputNode = nodes.find(n => n.data.type === 'output');

    if (llmNode && outputNode) {
      const newNodeId = `node-${nodeIdCounter++}`;
      const newNode: AgentNode = {
        id: newNodeId,
        type: 'agentNode',
        position: {
          x: (llmNode.position.x + outputNode.position.x) / 2,
          y: llmNode.position.y + 100
        },
        data: {
          type: 'humanInLoop',
          label: 'Human Review',
          config: {
            approvalType: 'single',
            slaMinutes: 60,
            roles: 'Reviewer',
          },
        },
      };

      // Find and remove the edge between LLM and output
      const edgeToRemove = edges.find(e => e.source === llmNode.id && e.target === outputNode.id);
      if (edgeToRemove) {
        actions.onRemoveEdge(edgeToRemove.id);
      }

      // Add the new node
      actions.onAddNode(newNode);

      // Add new edges
      actions.onAddEdge({
        id: `e-${llmNode.id}-${newNodeId}`,
        source: llmNode.id,
        target: newNodeId,
        animated: true,
      });
      actions.onAddEdge({
        id: `e-${newNodeId}-${outputNode.id}`,
        source: newNodeId,
        target: outputNode.id,
        animated: true,
      });

      return {
        success: true,
        message: "I've added a Human Review step between the LLM and Output nodes. This will pause execution and wait for manual approval before proceeding.",
        changes: [
          { type: 'add_node', description: 'Added Human Review node' },
          { type: 'update_edge', description: 'Rewired connections' },
        ],
      };
    }
  }

  // Change model
  if (lowerPrompt.includes('model') || lowerPrompt.includes('claude') || lowerPrompt.includes('gpt')) {
    const llmNode = nodes.find(n => n.data.type === 'llm');

    if (llmNode) {
      let newModel = 'gpt-4';
      if (lowerPrompt.includes('claude') && lowerPrompt.includes('opus')) {
        newModel = 'claude-3-opus';
      } else if (lowerPrompt.includes('claude') && lowerPrompt.includes('sonnet')) {
        newModel = 'claude-3-sonnet';
      } else if (lowerPrompt.includes('gpt-4') && lowerPrompt.includes('turbo')) {
        newModel = 'gpt-4-turbo';
      } else if (lowerPrompt.includes('gpt-3.5') || lowerPrompt.includes('gpt 3.5')) {
        newModel = 'gpt-3.5-turbo';
      } else if (lowerPrompt.includes('claude')) {
        newModel = 'claude-3-sonnet';
      }

      actions.onUpdateNode(llmNode.id, {
        config: { ...llmNode.data.config, model: newModel },
      });

      return {
        success: true,
        message: `I've updated the LLM node to use ${newModel}. The change will be reflected in both the visual canvas and the generated code.`,
        changes: [
          { type: 'update_config', description: `Changed model to ${newModel}` },
        ],
      };
    }
  }

  // Add error handling / retry
  if (lowerPrompt.includes('error') || lowerPrompt.includes('retry') || lowerPrompt.includes('fallback')) {
    const toolNode = nodes.find(n => n.data.type === 'toolUse');
    const llmNode = nodes.find(n => n.data.type === 'llm');
    const targetNode = toolNode || llmNode;

    if (targetNode) {
      if (targetNode.data.type === 'toolUse') {
        actions.onUpdateNode(targetNode.id, {
          config: {
            ...targetNode.data.config,
            retryPolicy: 'exponential',
            maxRetries: 5,
          },
        });
      } else {
        actions.onUpdateNode(targetNode.id, {
          config: {
            ...targetNode.data.config,
            temperature: 0.3, // Lower temperature for more consistent outputs
            maxTokens: 2000,
          },
        });
      }

      return {
        success: true,
        message: `I've enhanced error handling on the ${targetNode.data.label} node. ${targetNode.data.type === 'toolUse' ? 'Set exponential backoff with 5 retries.' : 'Lowered temperature for more consistent outputs.'}`,
        changes: [
          { type: 'update_config', description: 'Enhanced error handling settings' },
        ],
      };
    }
  }

  // Add memory node
  if (lowerPrompt.includes('memory') || lowerPrompt.includes('remember') || lowerPrompt.includes('context') || lowerPrompt.includes('personali')) {
    const triggerNode = nodes.find(n => n.data.type === 'trigger');
    const retrievalNode = nodes.find(n => n.data.type === 'retrieval');

    const afterNode = retrievalNode || triggerNode;

    if (afterNode) {
      const newNodeId = `node-${nodeIdCounter++}`;
      const newNode: AgentNode = {
        id: newNodeId,
        type: 'agentNode',
        position: {
          x: afterNode.position.x,
          y: afterNode.position.y + 120
        },
        data: {
          type: 'memory',
          label: 'User Memory',
          config: {
            memoryScope: 'user',
            retentionDays: 30,
          },
        },
      };

      actions.onAddNode(newNode);

      // Find what afterNode connects to
      const nextEdge = edges.find(e => e.source === afterNode.id);
      if (nextEdge) {
        actions.onRemoveEdge(nextEdge.id);
        actions.onAddEdge({
          id: `e-${afterNode.id}-${newNodeId}`,
          source: afterNode.id,
          target: newNodeId,
          animated: true,
        });
        actions.onAddEdge({
          id: `e-${newNodeId}-${nextEdge.target}`,
          source: newNodeId,
          target: nextEdge.target,
          animated: true,
        });
      }

      return {
        success: true,
        message: "I've added a Memory & Personalization node to your workflow. This will maintain context across user sessions and enable personalized responses.",
        changes: [
          { type: 'add_node', description: 'Added User Memory node' },
          { type: 'update_edge', description: 'Connected to workflow' },
        ],
      };
    }
  }

  // Create RAG pipeline
  if (lowerPrompt.includes('rag') || (lowerPrompt.includes('document') && lowerPrompt.includes('q&a')) || lowerPrompt.includes('knowledge base')) {
    // Create a complete RAG pipeline
    const newNodes: AgentNode[] = [
      {
        id: `node-${nodeIdCounter++}`,
        type: 'agentNode',
        position: { x: 100, y: 200 },
        data: {
          type: 'trigger',
          label: 'Query Input',
          config: { triggerType: 'manual' },
        },
      },
      {
        id: `node-${nodeIdCounter++}`,
        type: 'agentNode',
        position: { x: 350, y: 200 },
        data: {
          type: 'retrieval',
          label: 'Document Retrieval',
          config: { groundingMode: 'strict', maxResults: 5, freshnessWindow: 'all' },
        },
      },
      {
        id: `node-${nodeIdCounter++}`,
        type: 'agentNode',
        position: { x: 600, y: 200 },
        data: {
          type: 'llm',
          label: 'RAG Generator',
          config: {
            model: 'gpt-4',
            temperature: 0.3,
            systemPrompt: 'You are a helpful assistant. Answer questions based only on the provided context. If the answer is not in the context, say so.',
          },
        },
      },
      {
        id: `node-${nodeIdCounter++}`,
        type: 'agentNode',
        position: { x: 850, y: 200 },
        data: {
          type: 'output',
          label: 'Answer',
          config: { outputFormat: 'json' },
        },
      },
    ];

    const newEdges: Edge[] = [
      { id: `e-rag-1`, source: newNodes[0].id, target: newNodes[1].id, animated: true },
      { id: `e-rag-2`, source: newNodes[1].id, target: newNodes[2].id, animated: true },
      { id: `e-rag-3`, source: newNodes[2].id, target: newNodes[3].id, animated: true },
    ];

    actions.onSetNodes(newNodes);
    actions.onSetEdges(newEdges);

    return {
      success: true,
      message: "I've created a complete RAG (Retrieval-Augmented Generation) pipeline for document Q&A:\n\n1. **Query Input** - Receives the user question\n2. **Document Retrieval** - Searches knowledge base for relevant context\n3. **RAG Generator** - Generates answer grounded in retrieved docs\n4. **Answer** - Returns the response\n\nThe LLM is configured with strict grounding to avoid hallucinations.",
      changes: [
        { type: 'add_node', description: 'Created 4-node RAG pipeline' },
        { type: 'add_edge', description: 'Connected all nodes' },
      ],
    };
  }

  // Add extraction node
  if (lowerPrompt.includes('extract') || lowerPrompt.includes('parse') || lowerPrompt.includes('structure')) {
    const llmNode = nodes.find(n => n.data.type === 'llm');
    const outputNode = nodes.find(n => n.data.type === 'output');

    if (llmNode) {
      const newNodeId = `node-${nodeIdCounter++}`;
      const newNode: AgentNode = {
        id: newNodeId,
        type: 'agentNode',
        position: {
          x: llmNode.position.x + 200,
          y: llmNode.position.y
        },
        data: {
          type: 'extraction',
          label: 'Data Extraction',
          config: {
            precisionMode: 'balanced',
            validateOutput: true,
            schema: { name: 'string', email: 'string', amount: 'number' },
          },
        },
      };

      actions.onAddNode(newNode);

      if (outputNode) {
        // Find edge from LLM to output and rewire
        const llmToOutput = edges.find(e => e.source === llmNode.id && e.target === outputNode.id);
        if (llmToOutput) {
          actions.onRemoveEdge(llmToOutput.id);
          actions.onAddEdge({
            id: `e-${llmNode.id}-${newNodeId}`,
            source: llmNode.id,
            target: newNodeId,
            animated: true,
          });
          actions.onAddEdge({
            id: `e-${newNodeId}-${outputNode.id}`,
            source: newNodeId,
            target: outputNode.id,
            animated: true,
          });
        }
      }

      return {
        success: true,
        message: "I've added a Structured Extraction node after the LLM. This will parse the LLM output into a validated schema with fields for name, email, and amount. You can customize the schema in the node properties.",
        changes: [
          { type: 'add_node', description: 'Added Data Extraction node' },
          { type: 'update_edge', description: 'Rewired workflow' },
        ],
      };
    }
  }

  // Add evaluation node
  if (lowerPrompt.includes('eval') || lowerPrompt.includes('test') || lowerPrompt.includes('benchmark')) {
    const outputNode = nodes.find(n => n.data.type === 'output');

    if (outputNode) {
      const newNodeId = `node-${nodeIdCounter++}`;
      const newNode: AgentNode = {
        id: newNodeId,
        type: 'agentNode',
        position: {
          x: outputNode.position.x,
          y: outputNode.position.y + 120
        },
        data: {
          type: 'evaluation',
          label: 'Quality Eval',
          config: {
            dataset: 'test_cases.json',
            threshold: 0.9,
          },
        },
      };

      actions.onAddNode(newNode);

      // Find what connects to output and add parallel connection to eval
      const toOutput = edges.find(e => e.target === outputNode.id);
      if (toOutput) {
        actions.onAddEdge({
          id: `e-${toOutput.source}-${newNodeId}`,
          source: toOutput.source,
          target: newNodeId,
          animated: true,
        });
      }

      return {
        success: true,
        message: "I've added an Evaluation node that runs in parallel with your output. This will benchmark your workflow's quality against test cases. Configure the dataset and threshold in the node properties.",
        changes: [
          { type: 'add_node', description: 'Added Quality Eval node' },
          { type: 'add_edge', description: 'Connected for parallel evaluation' },
        ],
      };
    }
  }

  // Change temperature
  if (lowerPrompt.includes('temperature') || lowerPrompt.includes('creative') || lowerPrompt.includes('deterministic')) {
    const llmNode = nodes.find(n => n.data.type === 'llm');

    if (llmNode) {
      let newTemp = 0.7;
      if (lowerPrompt.includes('creative') || lowerPrompt.includes('high')) {
        newTemp = 0.9;
      } else if (lowerPrompt.includes('deterministic') || lowerPrompt.includes('low') || lowerPrompt.includes('consistent')) {
        newTemp = 0.1;
      } else {
        // Try to extract a number
        const match = lowerPrompt.match(/(\d\.?\d*)/);
        if (match) {
          newTemp = Math.min(1, Math.max(0, parseFloat(match[1])));
        }
      }

      actions.onUpdateNode(llmNode.id, {
        config: { ...llmNode.data.config, temperature: newTemp },
      });

      return {
        success: true,
        message: `I've set the temperature to ${newTemp}. ${newTemp > 0.7 ? 'Higher temperatures produce more creative, varied outputs.' : newTemp < 0.3 ? 'Lower temperatures produce more focused, deterministic outputs.' : 'This is a balanced setting.'}`,
        changes: [
          { type: 'update_config', description: `Set temperature to ${newTemp}` },
        ],
      };
    }
  }

  // Update prompt / system prompt
  if (lowerPrompt.includes('prompt') || lowerPrompt.includes('instruction') || lowerPrompt.includes('system')) {
    const llmNode = nodes.find(n => n.data.type === 'llm');

    if (llmNode) {
      // Extract what seems like a prompt from the user's message
      let newPrompt = llmNode.data.config.systemPrompt as string || '';

      if (lowerPrompt.includes('helpful')) {
        newPrompt = 'You are a helpful, friendly assistant. Provide clear, concise answers.';
      } else if (lowerPrompt.includes('expert') || lowerPrompt.includes('professional')) {
        newPrompt = 'You are an expert assistant. Provide detailed, accurate, and professional responses.';
      } else if (lowerPrompt.includes('concise') || lowerPrompt.includes('brief')) {
        newPrompt = 'You are a concise assistant. Keep responses short and to the point.';
      }

      actions.onUpdateNode(llmNode.id, {
        config: { ...llmNode.data.config, systemPrompt: newPrompt },
      });

      return {
        success: true,
        message: `I've updated the system prompt to:\n\n"${newPrompt}"\n\nYou can further customize this in the node properties.`,
        changes: [
          { type: 'update_config', description: 'Updated system prompt' },
        ],
      };
    }
  }

  // Delete / remove node
  if (lowerPrompt.includes('delete') || lowerPrompt.includes('remove')) {
    // Try to identify which node to remove
    let nodeToRemove: AgentNode | undefined;

    if (lowerPrompt.includes('human') || lowerPrompt.includes('approval')) {
      nodeToRemove = nodes.find(n => n.data.type === 'humanInLoop');
    } else if (lowerPrompt.includes('memory')) {
      nodeToRemove = nodes.find(n => n.data.type === 'memory');
    } else if (lowerPrompt.includes('extract')) {
      nodeToRemove = nodes.find(n => n.data.type === 'extraction');
    } else if (lowerPrompt.includes('eval')) {
      nodeToRemove = nodes.find(n => n.data.type === 'evaluation');
    }

    if (nodeToRemove) {
      // Find edges connected to this node
      const connectedEdges = edges.filter(e => e.source === nodeToRemove!.id || e.target === nodeToRemove!.id);
      const incomingEdge = connectedEdges.find(e => e.target === nodeToRemove!.id);
      const outgoingEdge = connectedEdges.find(e => e.source === nodeToRemove!.id);

      // Remove edges
      connectedEdges.forEach(e => actions.onRemoveEdge(e.id));

      // Reconnect if possible
      if (incomingEdge && outgoingEdge) {
        actions.onAddEdge({
          id: `e-reconnect-${Date.now()}`,
          source: incomingEdge.source,
          target: outgoingEdge.target,
          animated: true,
        });
      }

      // Remove node
      actions.onRemoveNode(nodeToRemove.id);

      return {
        success: true,
        message: `I've removed the ${nodeToRemove.data.label} node and reconnected the workflow.`,
        changes: [
          { type: 'remove_node', description: `Removed ${nodeToRemove.data.label}` },
          { type: 'update_edge', description: 'Reconnected workflow' },
        ],
      };
    }
  }

  // Add tool/function calling
  if (lowerPrompt.includes('tool') || lowerPrompt.includes('api') || lowerPrompt.includes('function')) {
    const llmNode = nodes.find(n => n.data.type === 'llm');

    if (llmNode) {
      const newNodeId = `node-${nodeIdCounter++}`;
      const newNode: AgentNode = {
        id: newNodeId,
        type: 'agentNode',
        position: {
          x: llmNode.position.x,
          y: llmNode.position.y - 120
        },
        data: {
          type: 'toolUse',
          label: 'Tool Executor',
          config: {
            retryPolicy: 'exponential',
            maxRetries: 3,
            timeout: 30000,
          },
        },
      };

      actions.onAddNode(newNode);

      // Connect trigger to tool, then tool to LLM
      const triggerNode = nodes.find(n => n.data.type === 'trigger');
      if (triggerNode) {
        const triggerToLlm = edges.find(e => e.source === triggerNode.id);
        if (triggerToLlm) {
          actions.onRemoveEdge(triggerToLlm.id);
          actions.onAddEdge({
            id: `e-${triggerNode.id}-${newNodeId}`,
            source: triggerNode.id,
            target: newNodeId,
            animated: true,
          });
          actions.onAddEdge({
            id: `e-${newNodeId}-${triggerToLlm.target}`,
            source: newNodeId,
            target: triggerToLlm.target,
            animated: true,
          });
        }
      }

      return {
        success: true,
        message: "I've added a Tool Executor node for API/function calling. This enables the workflow to call external APIs or execute UiPath workflows with built-in retry logic.",
        changes: [
          { type: 'add_node', description: 'Added Tool Executor node' },
          { type: 'update_edge', description: 'Wired into workflow' },
        ],
      };
    }
  }

  // ============================================
  // CODE-SPECIFIC MODIFICATIONS
  // ============================================

  // Add try-except / error handling code
  if (lowerPrompt.includes('try') || lowerPrompt.includes('except') || lowerPrompt.includes('catch') ||
      (lowerPrompt.includes('error') && lowerPrompt.includes('handling') && isCodeMode)) {
    const llmNode = nodes.find(n => n.data.type === 'llm');
    const targetNode = llmNode || nodes.find(n => n.data.type === 'toolUse');

    if (targetNode) {
      const codeOverride = `@dataclass
class ${toPascalCase(targetNode.data.label)}Node:
    """${targetNode.data.label} with enhanced error handling"""
    model: str = "${targetNode.data.config.model || 'gpt-4'}"
    temperature: float = ${targetNode.data.config.temperature || 0.7}
    max_retries: int = 3

    async def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        last_error = None

        for attempt in range(self.max_retries):
            try:
                # Main execution logic
                result = await self._execute_with_timeout(context)
                return result
            except TimeoutError as e:
                last_error = e
                logger.warning(f"Attempt {attempt + 1} timed out: {e}")
            except APIError as e:
                last_error = e
                logger.error(f"API error on attempt {attempt + 1}: {e}")
                if e.status_code == 429:  # Rate limit
                    await asyncio.sleep(2 ** attempt)
                else:
                    raise
            except Exception as e:
                last_error = e
                logger.exception(f"Unexpected error: {e}")
                raise

        raise RuntimeError(f"Failed after {self.max_retries} attempts: {last_error}")

    async def _execute_with_timeout(self, context: Dict[str, Any], timeout: int = 30) -> Dict[str, Any]:
        return await asyncio.wait_for(self._do_execute(context), timeout=timeout)

    async def _do_execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        # Core LLM call
        return {"response": "placeholder"}`;

      actions.onUpdateNode(targetNode.id, {
        hasCodeOverride: true,
        codeOverride: codeOverride,
      });

      return {
        success: true,
        message: `I've added comprehensive error handling code to the ${targetNode.data.label} node with:\n\n• **Retry logic** with exponential backoff\n• **Timeout handling** (30s default)\n• **Rate limit detection** (429 errors)\n• **Structured logging**\n\nThe node now has a code override that you can further customize. This may break bi-directional sync.`,
        changes: [
          { type: 'code_override', description: 'Added try-except with retries' },
          { type: 'code_snippet', description: 'Added timeout wrapper' },
        ],
      };
    }
  }

  // Add logging to code
  if (lowerPrompt.includes('log') || lowerPrompt.includes('debug') || lowerPrompt.includes('trace')) {
    const llmNode = nodes.find(n => n.data.type === 'llm');
    const targetNode = llmNode || nodes[1] || nodes[0];

    if (targetNode) {
      const codeOverride = `import logging
from functools import wraps

# Configure structured logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

def log_execution(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        logger.info(f"Starting {func.__name__}", extra={
            "node_id": "${targetNode.id}",
            "node_type": "${targetNode.data.type}"
        })
        try:
            result = await func(*args, **kwargs)
            logger.info(f"Completed {func.__name__}", extra={
                "node_id": "${targetNode.id}",
                "success": True
            })
            return result
        except Exception as e:
            logger.error(f"Failed {func.__name__}: {e}", extra={
                "node_id": "${targetNode.id}",
                "error": str(e)
            })
            raise
    return wrapper

@dataclass
class ${toPascalCase(targetNode.data.label)}Node:
    """${targetNode.data.label} with logging instrumentation"""

    @log_execution
    async def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        logger.debug("Input context", extra={"context_keys": list(context.keys())})

        # Main logic here
        result = {"response": "placeholder"}

        logger.debug("Output result", extra={"result_keys": list(result.keys())})
        return result`;

      actions.onUpdateNode(targetNode.id, {
        hasCodeOverride: true,
        codeOverride: codeOverride,
      });

      return {
        success: true,
        message: `I've added structured logging to the ${targetNode.data.label} node:\n\n• **Decorator-based logging** via \`@log_execution\`\n• **Structured log entries** with node_id and context\n• **Debug-level tracing** for inputs/outputs\n• **Error capture** with full context\n\nYou can view these logs in your observability platform.`,
        changes: [
          { type: 'code_override', description: 'Added logging decorator' },
          { type: 'code_snippet', description: 'Configured structured logger' },
        ],
      };
    }
  }

  // Add custom Python code / code block
  if (lowerPrompt.includes('custom code') || lowerPrompt.includes('python code') ||
      lowerPrompt.includes('code block') || lowerPrompt.includes('write code')) {
    const llmNode = nodes.find(n => n.data.type === 'llm');

    if (llmNode) {
      const codeOverride = `@dataclass
class ${toPascalCase(llmNode.data.label)}Node:
    """
    Custom implementation for ${llmNode.data.label}

    This code override allows full Python flexibility.
    Modify the execute() method to implement your custom logic.
    """
    model: str = "${llmNode.data.config.model || 'gpt-4'}"
    temperature: float = ${llmNode.data.config.temperature || 0.7}

    # Add your custom attributes here
    custom_config: Dict[str, Any] = None

    def __post_init__(self):
        self.custom_config = self.custom_config or {}
        # Initialize any custom resources

    async def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Custom execution logic.

        Args:
            context: Contains 'input' and 'results' from previous nodes

        Returns:
            Dict with execution results
        """
        # ===== YOUR CUSTOM CODE HERE =====

        input_data = context.get("input", {})
        previous_results = context.get("results", {})

        # Example: Custom preprocessing
        processed_input = self._preprocess(input_data)

        # Example: Call external service
        # response = await self._call_external_api(processed_input)

        # Example: Post-processing
        result = {
            "response": "Implement your custom logic here",
            "metadata": {
                "model": self.model,
                "custom": True
            }
        }

        return result

    def _preprocess(self, data: Dict[str, Any]) -> Dict[str, Any]:
        # Add custom preprocessing logic
        return data`;

      actions.onUpdateNode(llmNode.id, {
        hasCodeOverride: true,
        codeOverride: codeOverride,
      });

      return {
        success: true,
        message: `I've created a custom code template for the ${llmNode.data.label} node. The template includes:\n\n• **Customizable dataclass** with attributes\n• **Pre/post processing hooks**\n• **Async execute method** ready for your logic\n• **Helper methods** scaffold\n\nEdit the code in the Code view to implement your custom behavior. Note: Custom code may not round-trip to visual.`,
        changes: [
          { type: 'code_override', description: 'Created custom code template' },
        ],
      };
    }
  }

  // Add validation / type checking
  if (lowerPrompt.includes('validation') || lowerPrompt.includes('type check') ||
      lowerPrompt.includes('validate') || lowerPrompt.includes('pydantic')) {
    const targetNode = nodes.find(n => n.data.type === 'extraction') || nodes.find(n => n.data.type === 'llm');

    if (targetNode) {
      const codeOverride = `from pydantic import BaseModel, Field, validator
from typing import Optional, List

class InputSchema(BaseModel):
    """Validates incoming data"""
    query: str = Field(..., min_length=1, max_length=10000)
    context: Optional[str] = None
    options: Optional[Dict[str, Any]] = None

    @validator('query')
    def query_not_empty(cls, v):
        if not v.strip():
            raise ValueError('Query cannot be empty or whitespace')
        return v.strip()

class OutputSchema(BaseModel):
    """Validates outgoing data"""
    response: str
    confidence: float = Field(ge=0, le=1)
    sources: Optional[List[str]] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)

@dataclass
class ${toPascalCase(targetNode.data.label)}Node:
    """${targetNode.data.label} with Pydantic validation"""
    strict_validation: bool = True

    async def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        # Validate input
        try:
            validated_input = InputSchema(**context.get("input", {}))
        except ValidationError as e:
            if self.strict_validation:
                raise
            logger.warning(f"Input validation warning: {e}")
            validated_input = context.get("input", {})

        # Main logic
        result = {
            "response": "placeholder",
            "confidence": 0.95,
            "sources": [],
            "metadata": {}
        }

        # Validate output
        validated_output = OutputSchema(**result)
        return validated_output.dict()`;

      actions.onUpdateNode(targetNode.id, {
        hasCodeOverride: true,
        codeOverride: codeOverride,
      });

      return {
        success: true,
        message: `I've added Pydantic validation to the ${targetNode.data.label} node:\n\n• **InputSchema** - validates incoming queries\n• **OutputSchema** - ensures response structure\n• **Field validators** - custom validation logic\n• **Strict mode toggle** - fail or warn on invalid data\n\nCustomize the schemas to match your data requirements.`,
        changes: [
          { type: 'code_override', description: 'Added Pydantic schemas' },
          { type: 'code_snippet', description: 'Input/output validation' },
        ],
      };
    }
  }

  // Add caching / memoization
  if (lowerPrompt.includes('cache') || lowerPrompt.includes('memoize') || lowerPrompt.includes('memoization')) {
    const targetNode = nodes.find(n => n.data.type === 'retrieval') || nodes.find(n => n.data.type === 'llm');

    if (targetNode) {
      const codeOverride = `from functools import lru_cache
import hashlib
import json
from datetime import datetime, timedelta

class CacheManager:
    """Simple TTL cache for node results"""
    def __init__(self, ttl_seconds: int = 300):
        self._cache: Dict[str, tuple] = {}
        self.ttl = timedelta(seconds=ttl_seconds)

    def _hash_key(self, data: Dict) -> str:
        return hashlib.md5(json.dumps(data, sort_keys=True).encode()).hexdigest()

    def get(self, key: Dict) -> Optional[Any]:
        hash_key = self._hash_key(key)
        if hash_key in self._cache:
            value, timestamp = self._cache[hash_key]
            if datetime.now() - timestamp < self.ttl:
                return value
            del self._cache[hash_key]
        return None

    def set(self, key: Dict, value: Any):
        self._cache[self._hash_key(key)] = (value, datetime.now())

@dataclass
class ${toPascalCase(targetNode.data.label)}Node:
    """${targetNode.data.label} with caching"""
    cache_ttl: int = 300  # 5 minutes
    enable_cache: bool = True

    def __post_init__(self):
        self._cache = CacheManager(self.cache_ttl)

    async def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        cache_key = context.get("input", {})

        # Check cache
        if self.enable_cache:
            cached = self._cache.get(cache_key)
            if cached is not None:
                logger.debug("Cache hit", extra={"node": "${targetNode.id}"})
                return {**cached, "_cached": True}

        # Execute and cache result
        result = await self._execute_uncached(context)

        if self.enable_cache:
            self._cache.set(cache_key, result)

        return result

    async def _execute_uncached(self, context: Dict[str, Any]) -> Dict[str, Any]:
        # Core logic here
        return {"response": "placeholder"}`;

      actions.onUpdateNode(targetNode.id, {
        hasCodeOverride: true,
        codeOverride: codeOverride,
      });

      return {
        success: true,
        message: `I've added caching to the ${targetNode.data.label} node:\n\n• **TTL-based cache** (5 min default)\n• **Hash-based cache keys** from input\n• **Cache hit logging** for monitoring\n• **Togglable** via \`enable_cache\` flag\n\nThis reduces redundant API calls for repeated queries.`,
        changes: [
          { type: 'code_override', description: 'Added CacheManager class' },
          { type: 'code_snippet', description: 'Implemented TTL caching' },
        ],
      };
    }
  }

  // Add middleware / decorator chain
  if (lowerPrompt.includes('middleware') || lowerPrompt.includes('decorator') || lowerPrompt.includes('wrapper')) {
    const llmNode = nodes.find(n => n.data.type === 'llm');

    if (llmNode) {
      const codeOverride = `from functools import wraps
from typing import Callable, Awaitable

# Middleware types
Middleware = Callable[[Callable], Callable]

def rate_limit(calls_per_minute: int = 60):
    """Rate limiting middleware"""
    tokens = calls_per_minute
    last_refill = datetime.now()

    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            nonlocal tokens, last_refill
            now = datetime.now()
            tokens += (now - last_refill).seconds * (calls_per_minute / 60)
            tokens = min(tokens, calls_per_minute)
            last_refill = now

            if tokens < 1:
                raise RateLimitExceeded("Rate limit exceeded")
            tokens -= 1
            return await func(*args, **kwargs)
        return wrapper
    return decorator

def timeout(seconds: int = 30):
    """Timeout middleware"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            return await asyncio.wait_for(func(*args, **kwargs), timeout=seconds)
        return wrapper
    return decorator

def retry(max_attempts: int = 3, backoff: float = 2.0):
    """Retry middleware with exponential backoff"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            for attempt in range(max_attempts):
                try:
                    return await func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_attempts - 1:
                        raise
                    await asyncio.sleep(backoff ** attempt)
        return wrapper
    return decorator

@dataclass
class ${toPascalCase(llmNode.data.label)}Node:
    """${llmNode.data.label} with middleware chain"""

    @retry(max_attempts=3)
    @timeout(seconds=30)
    @rate_limit(calls_per_minute=60)
    async def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        # Core logic with middleware protection
        return {"response": "placeholder"}`;

      actions.onUpdateNode(llmNode.id, {
        hasCodeOverride: true,
        codeOverride: codeOverride,
      });

      return {
        success: true,
        message: `I've added a middleware/decorator chain to the ${llmNode.data.label} node:\n\n• **@retry** - Exponential backoff (3 attempts)\n• **@timeout** - 30s execution limit\n• **@rate_limit** - 60 calls/minute\n\nMiddleware executes in order: rate_limit → timeout → retry. You can stack additional decorators as needed.`,
        changes: [
          { type: 'code_override', description: 'Created middleware decorators' },
          { type: 'code_snippet', description: 'Applied decorator chain' },
        ],
      };
    }
  }

  // Add async streaming
  if (lowerPrompt.includes('stream') || lowerPrompt.includes('streaming') || lowerPrompt.includes('async generator')) {
    const llmNode = nodes.find(n => n.data.type === 'llm');

    if (llmNode) {
      const codeOverride = `from typing import AsyncIterator

@dataclass
class ${toPascalCase(llmNode.data.label)}Node:
    """${llmNode.data.label} with streaming support"""
    model: str = "${llmNode.data.config.model || 'gpt-4'}"
    temperature: float = ${llmNode.data.config.temperature || 0.7}
    stream_enabled: bool = True

    async def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        if self.stream_enabled:
            # Return a streaming response
            chunks = []
            async for chunk in self.stream_response(context):
                chunks.append(chunk)
            return {"response": "".join(chunks), "streamed": True}
        else:
            return await self.execute_sync(context)

    async def stream_response(self, context: Dict[str, Any]) -> AsyncIterator[str]:
        """
        Async generator that yields response chunks.

        Usage:
            async for chunk in node.stream_response(context):
                print(chunk, end="", flush=True)
        """
        # TODO: Replace with actual streaming API call
        # Example with OpenAI:
        # async for chunk in await openai.ChatCompletion.acreate(
        #     model=self.model,
        #     messages=[...],
        #     stream=True
        # ):
        #     if chunk.choices[0].delta.content:
        #         yield chunk.choices[0].delta.content

        # Placeholder streaming simulation
        words = "This is a streaming response from the LLM node.".split()
        for word in words:
            yield word + " "
            await asyncio.sleep(0.1)

    async def execute_sync(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Non-streaming fallback"""
        return {"response": "Non-streamed response", "streamed": False}`;

      actions.onUpdateNode(llmNode.id, {
        hasCodeOverride: true,
        codeOverride: codeOverride,
      });

      return {
        success: true,
        message: `I've added streaming support to the ${llmNode.data.label} node:\n\n• **AsyncIterator** - yields response chunks\n• **Configurable** via \`stream_enabled\` flag\n• **Fallback** to sync execution\n• **Ready for OpenAI/Anthropic** streaming APIs\n\nThis enables real-time response display in your UI.`,
        changes: [
          { type: 'code_override', description: 'Added async streaming' },
          { type: 'code_snippet', description: 'Created stream_response generator' },
        ],
      };
    }
  }

  // Set/modify system prompt with code
  if ((lowerPrompt.includes('system') && lowerPrompt.includes('prompt')) ||
      lowerPrompt.includes('instruction') || lowerPrompt.includes('persona')) {
    const llmNode = nodes.find(n => n.data.type === 'llm');

    if (llmNode && isCodeMode) {
      // Extract instruction type from prompt
      let systemPrompt = '';
      let persona = 'assistant';

      if (lowerPrompt.includes('expert') || lowerPrompt.includes('specialist')) {
        persona = 'expert';
        systemPrompt = `You are an expert assistant with deep domain knowledge.

Guidelines:
- Provide detailed, technical explanations
- Cite sources and best practices when relevant
- Ask clarifying questions for complex queries
- Acknowledge uncertainty when appropriate`;
      } else if (lowerPrompt.includes('concise') || lowerPrompt.includes('brief')) {
        persona = 'concise';
        systemPrompt = `You are a concise assistant focused on brevity.

Guidelines:
- Keep responses under 3 sentences when possible
- Use bullet points for lists
- Skip pleasantries and get to the point
- Only elaborate if explicitly asked`;
      } else if (lowerPrompt.includes('code') || lowerPrompt.includes('developer')) {
        persona = 'developer';
        systemPrompt = `You are a senior software engineer assistant.

Guidelines:
- Provide working code examples
- Explain trade-offs and alternatives
- Follow best practices and design patterns
- Include error handling in code samples`;
      } else {
        systemPrompt = llmNode.data.config.systemPrompt as string || 'You are a helpful assistant.';
      }

      actions.onUpdateNode(llmNode.id, {
        config: {
          ...llmNode.data.config,
          systemPrompt,
          persona,
        },
      });

      return {
        success: true,
        message: `I've updated the system prompt to a **${persona}** persona:\n\n\`\`\`\n${systemPrompt}\n\`\`\`\n\nThis prompt is now reflected in the generated Python code.`,
        changes: [
          { type: 'update_config', description: `Set ${persona} system prompt` },
          { type: 'code_snippet', description: 'Updated LLM configuration' },
        ],
      };
    }
  }

  // ============================================
  // EVALUATION COMMANDS
  // ============================================

  // Open evaluation panel / run evaluation
  if (lowerPrompt.includes('evaluat') || lowerPrompt.includes('test') && (lowerPrompt.includes('run') || lowerPrompt.includes('flow'))) {
    if (actions.onOpenEvaluation) {
      actions.onOpenEvaluation();
    }

    return {
      success: true,
      message: `I've opened the **Evaluation Studio** for you. Here's what you can do:\n\n**Offline Evaluation:**\n• Create or import datasets (CSV/JSON)\n• Generate test cases with AI\n• Select evaluators (Exact Match, JSON Similarity, LLM Judge, etc.)\n• Run evaluations on full flow, subgraphs, or individual nodes\n\n**Online Evaluation:**\n• Configure triggers (after each run, on error, scheduled)\n• Set alert thresholds for drift detection\n• Compare against baseline datasets\n\n**Evaluators available:**\n• Exact Match\n• Contains/Keywords\n• JSON Similarity\n• Context Precision\n• LLM Judge (Output)\n• LLM Judge (Trajectory)\n• Trajectory Match`,
      changes: [
        { type: 'open_evaluation', description: 'Opened Evaluation Studio' },
      ],
    };
  }

  // Generate test cases
  if (lowerPrompt.includes('generate') && (lowerPrompt.includes('test') || lowerPrompt.includes('dataset') || lowerPrompt.includes('case'))) {
    if (actions.onOpenEvaluation) {
      actions.onOpenEvaluation();
    }

    const nodeTypes = nodes.map(n => n.data.type).join(', ');

    return {
      success: true,
      message: `I can help you generate test cases for your workflow!\n\nYour flow contains: **${nodeTypes}**\n\n**To generate test cases:**\n1. Click **"Generate with AI"** in the Datasets tab\n2. Specify the number of test cases\n3. Choose to include edge cases and negative cases\n\n**Test case types I'll generate:**\n• **Standard cases** - typical inputs and expected outputs\n• **Edge cases** - empty inputs, very long inputs, special characters\n• **Negative cases** - invalid schemas, injection attempts\n\nI've opened the Evaluation Studio for you. Go to the **Datasets** tab to create your test suite.`,
      changes: [
        { type: 'generate_tests', description: 'Ready to generate test cases' },
        { type: 'open_evaluation', description: 'Opened Evaluation Studio' },
      ],
    };
  }

  // Configure evaluators
  if (lowerPrompt.includes('evaluator') || lowerPrompt.includes('llm judge') || lowerPrompt.includes('exact match') || lowerPrompt.includes('json similar')) {
    if (actions.onOpenEvaluation) {
      actions.onOpenEvaluation();
    }

    let evaluatorInfo = '';
    if (lowerPrompt.includes('llm judge') || lowerPrompt.includes('ai judge')) {
      evaluatorInfo = `**LLM Judge Evaluators:**\n\n• **LLM Judge (Output)** - Uses AI to evaluate response quality\n  - Criteria: accuracy, relevance, completeness, coherence\n  - Configurable rubric and scoring scale (1-5)\n\n• **LLM Judge (Trajectory)** - Uses AI to evaluate execution path\n  - Assesses reasoning quality\n  - Validates step ordering\n  - Can allow extra steps or require strict matching`;
    } else if (lowerPrompt.includes('exact match')) {
      evaluatorInfo = `**Exact Match Evaluator:**\n• Compares output exactly to expected value\n• Options: case-sensitive, trim whitespace\n• Best for: deterministic outputs, IDs, codes`;
    } else if (lowerPrompt.includes('json')) {
      evaluatorInfo = `**JSON Similarity Evaluator:**\n• Compares JSON structure and values\n• Configurable similarity threshold (0-1)\n• Can ignore specific fields\n• Handles nested objects and arrays\n• Best for: structured API responses`;
    } else {
      evaluatorInfo = `**Available Evaluators:**\n\n| Evaluator | Use Case |\n|-----------|----------|\n| Exact Match | Deterministic outputs |\n| Contains | Keyword presence |\n| JSON Similarity | Structured responses |\n| Context Precision | RAG grounding quality |\n| LLM Judge (Output) | Subjective quality |\n| LLM Judge (Trajectory) | Path validation |\n| Trajectory Match | Execution order |`;
    }

    return {
      success: true,
      message: `${evaluatorInfo}\n\nI've opened the Evaluation Studio. Go to the **Configure** tab to select and customize your evaluators.`,
      changes: [
        { type: 'configure_evaluator', description: 'Showed evaluator options' },
        { type: 'open_evaluation', description: 'Opened Evaluation Studio' },
      ],
    };
  }

  // Online evaluation / drift detection
  if (lowerPrompt.includes('online') || lowerPrompt.includes('drift') || lowerPrompt.includes('monitor') || lowerPrompt.includes('production')) {
    if (actions.onOpenEvaluation) {
      actions.onOpenEvaluation();
    }

    return {
      success: true,
      message: `**Online Evaluations** let you continuously monitor your flow in production.\n\n**Trigger Types:**\n• **After Every Run** - Evaluate each execution\n• **On Node Execute** - Evaluate specific nodes\n• **Scheduled** - Run at intervals (hourly, daily, weekly)\n• **On Error** - Evaluate when errors occur\n\n**Drift Detection:**\n• Set a baseline dataset from design-time tests\n• Compare production runs against baseline\n• Get alerts when quality drops below thresholds\n\n**Alert Thresholds:**\n• Minimum score (default: 70%)\n• Maximum latency (default: 5000ms)\n• Maximum error rate (default: 10%)\n\nI've opened the **Online Evals** tab for you.`,
      changes: [
        { type: 'open_evaluation', description: 'Opened Online Evaluations' },
      ],
    };
  }

  // Default response for unrecognized requests
  const codeHelpText = isCodeMode
    ? "\n\n**Code-specific commands:**\n• \"Add try-except error handling\"\n• \"Add logging/debugging\"\n• \"Add caching\"\n• \"Add validation with Pydantic\"\n• \"Add streaming support\"\n• \"Add middleware decorators\""
    : "";

  const evalHelpText = "\n\n**Evaluation commands:**\n• \"Run evaluation\" - Open Evaluation Studio\n• \"Generate test cases\" - AI-generate test data\n• \"Configure evaluators\" - Set up LLM Judge, exact match, etc.\n• \"Set up online monitoring\" - Configure drift detection";

  return {
    success: false,
    message: `I'm not sure how to handle that request. Here are some things I can do:\n\n**Visual/Canvas:**\n• Add nodes: \"Add a human approval step\", \"Add memory\"\n• Modify settings: \"Change model to Claude\", \"Set temperature to 0.3\"\n• Create workflows: \"Create a RAG pipeline\"\n• Remove nodes: \"Remove the approval step\"${codeHelpText}${evalHelpText}\n\nTry being more specific about what you'd like to change!`,
  };
}

// Helper function for code generation
function toPascalCase(str: string): string {
  return str
    .split(/[^a-zA-Z0-9]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}
