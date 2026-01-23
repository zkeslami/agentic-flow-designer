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

type ChangeType = 'add_node' | 'remove_node' | 'update_node' | 'add_edge' | 'remove_edge' | 'update_config' | 'update_edge';

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
}: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your AI assistant. I can help you build and modify your agentic workflow. Try asking me to:\n\n• \"Add a human approval step after the LLM\"\n• \"Change the model to Claude 3 Opus\"\n• \"Add error handling to the workflow\"\n• \"Create a RAG pipeline for document Q&A\"",
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
        { onAddNode, onRemoveNode, onUpdateNode, onAddEdge, onRemoveEdge, onSetNodes, onSetEdges }
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
  actions: AIActions
): Promise<AIResult> {
  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 500));

  const lowerPrompt = prompt.toLowerCase();

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

  // Default response for unrecognized requests
  return {
    success: false,
    message: "I'm not sure how to handle that request. Here are some things I can do:\n\n• Add nodes: \"Add a human approval step\", \"Add memory\", \"Add error handling\"\n• Modify settings: \"Change model to Claude\", \"Set temperature to 0.3\"\n• Create workflows: \"Create a RAG pipeline\"\n• Remove nodes: \"Remove the approval step\"\n\nTry being more specific about what you'd like to change!",
  };
}
