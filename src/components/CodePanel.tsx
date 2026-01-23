import { useState, useEffect } from 'react';
import {
  Code,
  FileJson,
  Copy,
  Check,
  AlertTriangle,
  RefreshCw,
  Download,
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import type { AgentNode, GeneratedCode } from '../types';
import type { Edge } from '@xyflow/react';
import { generatePythonCode } from '../utils/codeGenerator';

interface CodePanelProps {
  nodes: AgentNode[];
  edges: Edge[];
  onCodeChange?: (code: string) => void;
}

export default function CodePanel({ nodes, edges, onCodeChange }: CodePanelProps) {
  const [activeTab, setActiveTab] = useState<'python' | 'json'>('python');
  const [copied, setCopied] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode | null>(null);

  useEffect(() => {
    const code = generatePythonCode(nodes, edges);
    setGeneratedCode(code);
  }, [nodes, edges]);

  const handleCopy = async () => {
    const text = activeTab === 'python' ? generatedCode?.python : generatedCode?.json;
    if (text) {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const text = activeTab === 'python' ? generatedCode?.python : generatedCode?.json;
    const ext = activeTab === 'python' ? 'py' : 'json';
    const filename = `workflow.${ext}`;

    if (text) {
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  if (!generatedCode) {
    return (
      <div className="h-full flex items-center justify-center bg-[#1e1e2e]">
        <RefreshCw className="w-6 h-6 text-[#45475a] animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#1e1e2e]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#313244]">
        <div className="flex items-center gap-2">
          {/* Tabs */}
          <button
            onClick={() => setActiveTab('python')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'python'
                ? 'bg-[#313244] text-[#cdd6f4]'
                : 'text-[#6c7086] hover:text-[#a6adc8]'
            }`}
          >
            <Code className="w-4 h-4" />
            Python
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'json'
                ? 'bg-[#313244] text-[#cdd6f4]'
                : 'text-[#6c7086] hover:text-[#a6adc8]'
            }`}
          >
            <FileJson className="w-4 h-4" />
            JSON
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Round-trip indicator */}
          <div
            className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs ${
              generatedCode.canRoundTrip
                ? 'bg-green-500/10 text-green-400'
                : 'bg-amber-500/10 text-amber-400'
            }`}
          >
            {generatedCode.canRoundTrip ? (
              <>
                <Check className="w-3 h-3" />
                Bi-directional
              </>
            ) : (
              <>
                <AlertTriangle className="w-3 h-3" />
                Code-only regions
              </>
            )}
          </div>

          <button
            onClick={handleCopy}
            className="p-2 rounded hover:bg-[#313244] transition-colors"
            title="Copy to clipboard"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4 text-[#6c7086]" />
            )}
          </button>

          <button
            onClick={handleDownload}
            className="p-2 rounded hover:bg-[#313244] transition-colors"
            title="Download file"
          >
            <Download className="w-4 h-4 text-[#6c7086]" />
          </button>
        </div>
      </div>

      {/* Warnings */}
      {generatedCode.warnings.length > 0 && (
        <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/30">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-200">
              <p className="font-medium mb-1">
                {generatedCode.warnings.length} warning(s)
              </p>
              <ul className="space-y-0.5 text-amber-300/70">
                {generatedCode.warnings.map((warning, i) => (
                  <li key={i}>• {warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Code Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={activeTab === 'python' ? 'python' : 'json'}
          theme="vs-dark"
          value={activeTab === 'python' ? generatedCode.python : generatedCode.json}
          onChange={(value) => onCodeChange?.(value || '')}
          options={{
            readOnly: false,
            minimap: { enabled: true },
            fontSize: 13,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            padding: { top: 16, bottom: 16 },
            folding: true,
            foldingStrategy: 'indentation',
          }}
        />
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-[#313244] flex items-center justify-between text-xs text-[#6c7086]">
        <span>
          {nodes.length} node{nodes.length !== 1 ? 's' : ''} •{' '}
          {edges.length} connection{edges.length !== 1 ? 's' : ''}
        </span>
        <span>
          {activeTab === 'python'
            ? generatedCode.python.split('\n').length
            : generatedCode.json.split('\n').length}{' '}
          lines
        </span>
      </div>
    </div>
  );
}
