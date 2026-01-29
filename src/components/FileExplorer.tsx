import { useState, useMemo } from 'react';
import {
  ChevronRight,
  ChevronDown,
  FileCode2,
  FolderOpen,
  Folder,
  FileJson,
  FileText,
  FileCog,
  Package,
  Sparkles,
  RefreshCw,
  Plus,
} from 'lucide-react';
import type { AgentNode, AgentNodeData } from '../types';
import type { Edge } from '@xyflow/react';

interface FileExplorerProps {
  nodes: AgentNode[];
  edges: Edge[];
  flowName?: string;
  onFileSelect: (file: GeneratedFile) => void;
  selectedFile?: string;
}

export interface GeneratedFile {
  id: string;
  name: string;
  path: string;
  type: 'python' | 'json' | 'yaml' | 'md' | 'config';
  content: string;
  nodeId?: string;
}

interface FileTreeItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  children?: FileTreeItem[];
  file?: GeneratedFile;
  icon?: React.ReactNode;
}

export default function FileExplorer({
  nodes,
  edges,
  flowName = 'my_agent_flow',
  onFileSelect,
  selectedFile,
}: FileExplorerProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(['root', 'nodes', 'config'])
  );

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  // Generate file structure based on nodes
  const { files, fileTree } = useMemo(() => {
    const generatedFiles: GeneratedFile[] = [];

    // Main flow file
    generatedFiles.push({
      id: 'main',
      name: `${flowName}.py`,
      path: `${flowName}.py`,
      type: 'python',
      content: generateMainFlowCode(nodes, edges, flowName),
    });

    // Package init
    generatedFiles.push({
      id: 'init',
      name: '__init__.py',
      path: '__init__.py',
      type: 'python',
      content: `"""${flowName} - Generated Agent Flow"""\n\nfrom .${flowName} import run_flow\n\n__all__ = ['run_flow']\n`,
    });

    // Individual node files
    nodes.forEach((node) => {
      const nodeData = node.data as AgentNodeData;
      generatedFiles.push({
        id: `node-${node.id}`,
        name: `${sanitizeNodeName(nodeData.label)}.py`,
        path: `nodes/${sanitizeNodeName(nodeData.label)}.py`,
        type: 'python',
        content: generateNodeCode(node),
        nodeId: node.id,
      });
    });

    // Config files
    generatedFiles.push({
      id: 'config-flow',
      name: 'flow.json',
      path: 'config/flow.json',
      type: 'json',
      content: JSON.stringify({ nodes: nodes.map(n => ({ id: n.id, type: (n.data as AgentNodeData).type, label: (n.data as AgentNodeData).label })), edges: edges.map(e => ({ source: e.source, target: e.target })) }, null, 2),
    });

    generatedFiles.push({
      id: 'config-settings',
      name: 'settings.yaml',
      path: 'config/settings.yaml',
      type: 'yaml',
      content: generateSettingsYaml(flowName),
    });

    // README
    generatedFiles.push({
      id: 'readme',
      name: 'README.md',
      path: 'README.md',
      type: 'md',
      content: generateReadme(flowName, nodes),
    });

    // requirements.txt
    generatedFiles.push({
      id: 'requirements',
      name: 'requirements.txt',
      path: 'requirements.txt',
      type: 'config',
      content: 'uipath-sdk>=2.0.0\nlangchain>=0.1.0\nopenai>=1.0.0\npydantic>=2.0.0\n',
    });

    // Build file tree
    const tree: FileTreeItem = {
      id: 'root',
      name: flowName,
      type: 'folder',
      icon: <Package className="w-4 h-4 text-purple-400" />,
      children: [
        {
          id: 'main-file',
          name: `${flowName}.py`,
          type: 'file',
          file: generatedFiles.find(f => f.id === 'main'),
          icon: <Sparkles className="w-4 h-4 text-yellow-400" />,
        },
        {
          id: 'init-file',
          name: '__init__.py',
          type: 'file',
          file: generatedFiles.find(f => f.id === 'init'),
        },
        {
          id: 'nodes',
          name: 'nodes',
          type: 'folder',
          children: nodes.map((node) => {
            const nodeData = node.data as AgentNodeData;
            return {
              id: `node-file-${node.id}`,
              name: `${sanitizeNodeName(nodeData.label)}.py`,
              type: 'file' as const,
              file: generatedFiles.find(f => f.id === `node-${node.id}`),
            };
          }),
        },
        {
          id: 'config',
          name: 'config',
          type: 'folder',
          children: [
            {
              id: 'config-flow-file',
              name: 'flow.json',
              type: 'file',
              file: generatedFiles.find(f => f.id === 'config-flow'),
            },
            {
              id: 'config-settings-file',
              name: 'settings.yaml',
              type: 'file',
              file: generatedFiles.find(f => f.id === 'config-settings'),
            },
          ],
        },
        {
          id: 'readme-file',
          name: 'README.md',
          type: 'file',
          file: generatedFiles.find(f => f.id === 'readme'),
        },
        {
          id: 'requirements-file',
          name: 'requirements.txt',
          type: 'file',
          file: generatedFiles.find(f => f.id === 'requirements'),
        },
      ],
    };

    return { files: generatedFiles, fileTree: tree };
  }, [nodes, edges, flowName]);

  const getFileIcon = (file?: GeneratedFile) => {
    if (!file) return <FileText className="w-4 h-4 text-[#6c7086]" />;
    switch (file.type) {
      case 'python':
        return <FileCode2 className="w-4 h-4 text-blue-400" />;
      case 'json':
        return <FileJson className="w-4 h-4 text-yellow-400" />;
      case 'yaml':
        return <FileCog className="w-4 h-4 text-red-400" />;
      case 'md':
        return <FileText className="w-4 h-4 text-[#a6adc8]" />;
      default:
        return <FileText className="w-4 h-4 text-[#6c7086]" />;
    }
  };

  const renderTreeItem = (item: FileTreeItem, depth: number = 0) => {
    const isExpanded = expandedFolders.has(item.id);
    const isSelected = item.file?.id === selectedFile;

    if (item.type === 'folder') {
      return (
        <div key={item.id}>
          <button
            onClick={() => toggleFolder(item.id)}
            className={`
              w-full flex items-center gap-1 px-2 py-1 text-sm hover:bg-[#313244] transition-colors
              ${depth === 0 ? 'font-medium' : ''}
            `}
            style={{ paddingLeft: `${depth * 12 + 8}px` }}
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-[#6c7086]" />
            ) : (
              <ChevronRight className="w-4 h-4 text-[#6c7086]" />
            )}
            {item.icon || (isExpanded ? (
              <FolderOpen className="w-4 h-4 text-yellow-500" />
            ) : (
              <Folder className="w-4 h-4 text-yellow-500" />
            ))}
            <span className="text-[#cdd6f4] truncate">{item.name}</span>
          </button>
          {isExpanded && item.children && (
            <div>
              {item.children.map((child) => renderTreeItem(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <button
        key={item.id}
        onClick={() => item.file && onFileSelect(item.file)}
        className={`
          w-full flex items-center gap-2 px-2 py-1 text-sm transition-colors
          ${isSelected ? 'bg-[#313244] text-[#cdd6f4]' : 'text-[#a6adc8] hover:bg-[#1e1e2e]'}
        `}
        style={{ paddingLeft: `${depth * 12 + 24}px` }}
      >
        {item.icon || getFileIcon(item.file)}
        <span className="truncate">{item.name}</span>
      </button>
    );
  };

  return (
    <div className="h-full flex flex-col bg-[#181825]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#313244]">
        <span className="text-xs font-semibold text-[#6c7086] uppercase tracking-wider">
          Explorer
        </span>
        <div className="flex items-center gap-1">
          <button className="p-1 hover:bg-[#313244] rounded transition-colors">
            <Plus className="w-4 h-4 text-[#6c7086]" />
          </button>
          <button className="p-1 hover:bg-[#313244] rounded transition-colors">
            <RefreshCw className="w-4 h-4 text-[#6c7086]" />
          </button>
        </div>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto py-2">
        {renderTreeItem(fileTree)}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-[#313244]">
        <p className="text-xs text-[#45475a]">
          {files.length} files • Auto-generated
        </p>
      </div>
    </div>
  );
}

// Helper functions for code generation
function sanitizeNodeName(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function generateMainFlowCode(nodes: AgentNode[], edges: Edge[], flowName: string): string {
  const imports = nodes.map(n => {
    const data = n.data as AgentNodeData;
    const nodeName = sanitizeNodeName(data.label);
    return `from .nodes.${nodeName} import ${nodeName}_node`;
  }).join('\n');

  const nodeRegistrations = nodes.map(n => {
    const data = n.data as AgentNodeData;
    const nodeName = sanitizeNodeName(data.label);
    return `    flow.add_node("${n.id}", ${nodeName}_node)`;
  }).join('\n');

  const edgeRegistrations = edges.map(e => {
    return `    flow.add_edge("${e.source}", "${e.target}")`;
  }).join('\n');

  return `"""
${flowName} - Generated Agent Flow
Auto-generated from visual flow designer
"""

from uipath.sdk import AgentFlow, FlowContext
${imports}


def create_flow() -> AgentFlow:
    """Create and configure the agent flow."""
    flow = AgentFlow(name="${flowName}")

    # Register nodes
${nodeRegistrations}

    # Define edges
${edgeRegistrations}

    return flow


async def run_flow(input_data: dict) -> dict:
    """Execute the flow with the given input."""
    flow = create_flow()
    context = FlowContext(input=input_data)
    result = await flow.execute(context)
    return result.output


if __name__ == "__main__":
    import asyncio
    result = asyncio.run(run_flow({"query": "Hello, world!"}))
    print(result)
`;
}

function generateNodeCode(node: AgentNode): string {
  const data = node.data as AgentNodeData;
  const nodeName = sanitizeNodeName(data.label);
  const config = JSON.stringify(data.config, null, 4).replace(/\n/g, '\n    ');

  return `"""
${data.label} Node
Type: ${data.type}
Auto-generated from visual flow designer
"""

from uipath.sdk import AgentNode, NodeContext
from typing import Any, Dict


# Node configuration
CONFIG = ${config}


@AgentNode(
    name="${data.label}",
    type="${data.type}",
    config=CONFIG
)
async def ${nodeName}_node(context: NodeContext) -> Dict[str, Any]:
    """
    ${data.label} - ${data.type} node

    Args:
        context: Node execution context with input data

    Returns:
        dict: Node output data
    """
    input_data = context.input

    # Node implementation
    result = {
        "status": "success",
        "node": "${data.label}",
        "type": "${data.type}",
        "data": input_data
    }

    return result
`;
}

function generateSettingsYaml(flowName: string): string {
  return `# ${flowName} Settings
# Auto-generated configuration

flow:
  name: ${flowName}
  version: 1.0.0

runtime:
  timeout: 300
  max_retries: 3
  log_level: INFO

llm:
  provider: openai
  model: gpt-4
  temperature: 0.7
  max_tokens: 2048

memory:
  type: conversation
  max_history: 10

tools:
  enabled: true
  require_approval: false
`;
}

function generateReadme(flowName: string, nodes: AgentNode[]): string {
  const nodeList = nodes.map(n => {
    const data = n.data as AgentNodeData;
    return `- **${data.label}** (${data.type})`;
  }).join('\n');

  return `# ${flowName}

Auto-generated Agent Flow from visual designer.

## Nodes

${nodeList}

## Usage

\`\`\`python
from ${flowName} import run_flow
import asyncio

result = asyncio.run(run_flow({"query": "Your input here"}))
print(result)
\`\`\`

## Configuration

See \`config/settings.yaml\` for runtime configuration options.

## Development

1. Install dependencies: \`pip install -r requirements.txt\`
2. Run the flow: \`python -m ${flowName}\`
`;
}
