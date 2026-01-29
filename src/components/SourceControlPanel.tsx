import { useState } from 'react';
import {
  GitBranch,
  GitCommit,
  GitPullRequest,
  Plus,
  Minus,
  RefreshCw,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  FileCode2,
  Clock,
  User,
  Tag,
} from 'lucide-react';

interface SourceControlPanelProps {
  hasChanges?: boolean;
  changesCount?: number;
  currentBranch?: string;
  lastCommit?: {
    hash: string;
    message: string;
    author: string;
    date: string;
  };
  onCommit?: (message: string) => void;
  onPush?: () => void;
  onPull?: () => void;
}

interface FileChange {
  path: string;
  status: 'added' | 'modified' | 'deleted';
  staged: boolean;
}

export default function SourceControlPanel({
  currentBranch = 'main',
  lastCommit = {
    hash: 'a35c0b9',
    message: 'Add full-screen pattern editors',
    author: 'developer',
    date: '2 hours ago',
  },
  onCommit,
  onPush,
  onPull,
}: SourceControlPanelProps) {
  const [commitMessage, setCommitMessage] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    staged: true,
    changes: true,
    commits: false,
  });

  // Mock file changes - in real implementation, these would come from diff detection
  const [changes] = useState<FileChange[]>([
    { path: 'my_agent_flow.py', status: 'modified', staged: false },
    { path: 'nodes/knowledge_search.py', status: 'modified', staged: false },
    { path: 'nodes/generate_response.py', status: 'added', staged: true },
    { path: 'config/flow.json', status: 'modified', staged: true },
  ]);

  const stagedChanges = changes.filter(c => c.staged);
  const unstagedChanges = changes.filter(c => !c.staged);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getStatusIcon = (status: FileChange['status']) => {
    switch (status) {
      case 'added':
        return <Plus className="w-3 h-3 text-green-400" />;
      case 'modified':
        return <RefreshCw className="w-3 h-3 text-yellow-400" />;
      case 'deleted':
        return <Minus className="w-3 h-3 text-red-400" />;
    }
  };

  const getStatusColor = (status: FileChange['status']) => {
    switch (status) {
      case 'added':
        return 'text-green-400';
      case 'modified':
        return 'text-yellow-400';
      case 'deleted':
        return 'text-red-400';
    }
  };

  const handleCommit = () => {
    if (commitMessage.trim() && onCommit) {
      onCommit(commitMessage);
      setCommitMessage('');
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#181825]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#313244]">
        <span className="text-xs font-semibold text-[#6c7086] uppercase tracking-wider">
          Source Control
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={onPull}
            className="p-1 hover:bg-[#313244] rounded transition-colors"
            title="Pull"
          >
            <GitPullRequest className="w-4 h-4 text-[#6c7086]" />
          </button>
          <button
            onClick={onPush}
            className="p-1 hover:bg-[#313244] rounded transition-colors"
            title="Push"
          >
            <GitBranch className="w-4 h-4 text-[#6c7086]" />
          </button>
        </div>
      </div>

      {/* Branch Info */}
      <div className="px-4 py-3 border-b border-[#313244]">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-purple-400" />
          <span className="text-sm text-[#cdd6f4] font-medium">{currentBranch}</span>
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs text-[#6c7086]">
          <GitCommit className="w-3 h-3" />
          <span className="font-mono">{lastCommit.hash}</span>
          <span className="truncate">{lastCommit.message}</span>
        </div>
      </div>

      {/* Commit Message Input */}
      <div className="px-4 py-3 border-b border-[#313244]">
        <textarea
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          placeholder="Commit message"
          className="w-full px-3 py-2 bg-[#1e1e2e] border border-[#313244] rounded-md text-sm text-[#cdd6f4] placeholder-[#45475a] focus:outline-none focus:border-blue-500 resize-none"
          rows={3}
        />
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleCommit}
            disabled={!commitMessage.trim() || stagedChanges.length === 0}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-[#313244] disabled:text-[#6c7086] text-white text-sm font-medium rounded-md transition-colors"
          >
            <Check className="w-4 h-4" />
            Commit
          </button>
        </div>
      </div>

      {/* Changes List */}
      <div className="flex-1 overflow-y-auto">
        {/* Staged Changes */}
        <div className="border-b border-[#313244]">
          <button
            onClick={() => toggleSection('staged')}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-[#1e1e2e] transition-colors"
          >
            {expandedSections.staged ? (
              <ChevronDown className="w-4 h-4 text-[#6c7086]" />
            ) : (
              <ChevronRight className="w-4 h-4 text-[#6c7086]" />
            )}
            <span className="text-[#cdd6f4] font-medium">Staged Changes</span>
            <span className="ml-auto text-xs text-[#6c7086] bg-[#313244] px-2 py-0.5 rounded">
              {stagedChanges.length}
            </span>
          </button>
          {expandedSections.staged && stagedChanges.length > 0 && (
            <div className="px-2 pb-2">
              {stagedChanges.map((change) => (
                <div
                  key={change.path}
                  className="flex items-center gap-2 px-2 py-1 text-sm hover:bg-[#1e1e2e] rounded transition-colors group"
                >
                  {getStatusIcon(change.status)}
                  <FileCode2 className="w-4 h-4 text-blue-400" />
                  <span className={`flex-1 truncate ${getStatusColor(change.status)}`}>
                    {change.path}
                  </span>
                  <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#313244] rounded">
                    <X className="w-3 h-3 text-[#6c7086]" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Unstaged Changes */}
        <div className="border-b border-[#313244]">
          <button
            onClick={() => toggleSection('changes')}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-[#1e1e2e] transition-colors"
          >
            {expandedSections.changes ? (
              <ChevronDown className="w-4 h-4 text-[#6c7086]" />
            ) : (
              <ChevronRight className="w-4 h-4 text-[#6c7086]" />
            )}
            <span className="text-[#cdd6f4] font-medium">Changes</span>
            <span className="ml-auto text-xs text-[#6c7086] bg-[#313244] px-2 py-0.5 rounded">
              {unstagedChanges.length}
            </span>
          </button>
          {expandedSections.changes && unstagedChanges.length > 0 && (
            <div className="px-2 pb-2">
              {unstagedChanges.map((change) => (
                <div
                  key={change.path}
                  className="flex items-center gap-2 px-2 py-1 text-sm hover:bg-[#1e1e2e] rounded transition-colors group"
                >
                  {getStatusIcon(change.status)}
                  <FileCode2 className="w-4 h-4 text-blue-400" />
                  <span className={`flex-1 truncate ${getStatusColor(change.status)}`}>
                    {change.path}
                  </span>
                  <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#313244] rounded">
                    <Plus className="w-3 h-3 text-[#6c7086]" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Commits */}
        <div>
          <button
            onClick={() => toggleSection('commits')}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-[#1e1e2e] transition-colors"
          >
            {expandedSections.commits ? (
              <ChevronDown className="w-4 h-4 text-[#6c7086]" />
            ) : (
              <ChevronRight className="w-4 h-4 text-[#6c7086]" />
            )}
            <span className="text-[#cdd6f4] font-medium">Recent Commits</span>
          </button>
          {expandedSections.commits && (
            <div className="px-2 pb-2 space-y-1">
              {[
                { hash: 'a35c0b9', message: 'Add full-screen pattern editors', date: '2h ago' },
                { hash: '4e679a2', message: 'Add agentic patterns, context engineering', date: '4h ago' },
                { hash: '5e3c83f', message: 'Enhance bidirectional sync architecture', date: '6h ago' },
              ].map((commit) => (
                <div
                  key={commit.hash}
                  className="flex items-start gap-2 px-2 py-2 text-sm hover:bg-[#1e1e2e] rounded transition-colors"
                >
                  <GitCommit className="w-4 h-4 text-[#6c7086] mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[#cdd6f4] truncate">{commit.message}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-[#6c7086]">
                      <span className="font-mono">{commit.hash}</span>
                      <span>•</span>
                      <Clock className="w-3 h-3" />
                      <span>{commit.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Version Tag */}
      <div className="px-4 py-3 border-t border-[#313244]">
        <div className="flex items-center gap-2 text-xs text-[#6c7086]">
          <Tag className="w-3 h-3" />
          <span>v1.0.0</span>
          <span className="mx-1">•</span>
          <User className="w-3 h-3" />
          <span>developer</span>
        </div>
      </div>
    </div>
  );
}
