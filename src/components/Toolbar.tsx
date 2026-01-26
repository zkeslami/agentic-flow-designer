import {
  Play,
  Save,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Maximize,
  Layout,
  Code,
  Columns,
  Eye,
  FlaskConical,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ArrowLeftRight,
} from 'lucide-react';
import type { SyncStatus } from '../types';

export type ViewMode = 'visual' | 'code' | 'split';

interface ToolbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onAutoLayout: () => void;
  onSave: () => void;
  onRun: () => void;
  onEvaluate: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  syncStatus?: SyncStatus;
  onForceSync?: () => void;
}

// Sync status display configuration
const SYNC_STATUS_CONFIG: Record<SyncStatus, {
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  description: string;
}> = {
  synced: {
    label: 'Synced',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10 border-green-500/30',
    description: 'Visual and code are in sync',
  },
  visual_ahead: {
    label: 'Visual Ahead',
    icon: <ArrowLeftRight className="w-3.5 h-3.5" />,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10 border-blue-500/30',
    description: 'Visual has unsaved changes',
  },
  code_ahead: {
    label: 'Code Ahead',
    icon: <ArrowLeftRight className="w-3.5 h-3.5" />,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10 border-amber-500/30',
    description: 'Code has changes not in visual',
  },
  conflict: {
    label: 'Conflict',
    icon: <AlertCircle className="w-3.5 h-3.5" />,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10 border-red-500/30',
    description: 'Conflicting changes detected',
  },
  code_only: {
    label: 'Code Only',
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10 border-purple-500/30',
    description: 'Some code cannot be visualized',
  },
  parsing: {
    label: 'Syncing',
    icon: <RefreshCw className="w-3.5 h-3.5 animate-spin" />,
    color: 'text-[#6c7086]',
    bgColor: 'bg-[#313244]/50 border-[#45475a]',
    description: 'Synchronizing changes...',
  },
};

export default function Toolbar({
  viewMode,
  onViewModeChange,
  onZoomIn,
  onZoomOut,
  onFitView,
  onAutoLayout,
  onSave,
  onRun,
  onEvaluate,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  syncStatus = 'synced',
  onForceSync,
}: ToolbarProps) {
  const statusConfig = SYNC_STATUS_CONFIG[syncStatus];

  return (
    <div className="h-12 bg-[#181825] border-b border-[#313244] flex items-center justify-between px-4">
      {/* Left: File actions & Sync Status */}
      <div className="flex items-center gap-1">
        <button
          onClick={onSave}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#cdd6f4] bg-[#313244] rounded-md hover:bg-[#45475a] transition-colors"
        >
          <Save className="w-4 h-4" />
          Save
        </button>

        {/* Sync Status Indicator */}
        <div className="w-px h-6 bg-[#313244] mx-2" />
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border ${statusConfig.bgColor} ${statusConfig.color} cursor-help`}
          title={statusConfig.description}
          onClick={onForceSync}
        >
          {statusConfig.icon}
          <span>{statusConfig.label}</span>
        </div>

        <div className="w-px h-6 bg-[#313244] mx-2" />

        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="p-2 rounded hover:bg-[#313244] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Undo"
        >
          <Undo className="w-4 h-4 text-[#6c7086]" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="p-2 rounded hover:bg-[#313244] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Redo"
        >
          <Redo className="w-4 h-4 text-[#6c7086]" />
        </button>
      </div>

      {/* Center: View mode toggle */}
      <div className="flex items-center gap-1 bg-[#1e1e2e] p-1 rounded-lg">
        <button
          onClick={() => onViewModeChange('visual')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            viewMode === 'visual'
              ? 'bg-[#313244] text-[#cdd6f4]'
              : 'text-[#6c7086] hover:text-[#a6adc8]'
          }`}
        >
          <Eye className="w-4 h-4" />
          Visual
        </button>
        <button
          onClick={() => onViewModeChange('split')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            viewMode === 'split'
              ? 'bg-[#313244] text-[#cdd6f4]'
              : 'text-[#6c7086] hover:text-[#a6adc8]'
          }`}
        >
          <Columns className="w-4 h-4" />
          Split
        </button>
        <button
          onClick={() => onViewModeChange('code')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            viewMode === 'code'
              ? 'bg-[#313244] text-[#cdd6f4]'
              : 'text-[#6c7086] hover:text-[#a6adc8]'
          }`}
        >
          <Code className="w-4 h-4" />
          Code
        </button>
      </div>

      {/* Right: Canvas controls & Run */}
      <div className="flex items-center gap-1">
        <button
          onClick={onZoomOut}
          className="p-2 rounded hover:bg-[#313244] transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4 text-[#6c7086]" />
        </button>
        <button
          onClick={onZoomIn}
          className="p-2 rounded hover:bg-[#313244] transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4 text-[#6c7086]" />
        </button>
        <button
          onClick={onFitView}
          className="p-2 rounded hover:bg-[#313244] transition-colors"
          title="Fit View"
        >
          <Maximize className="w-4 h-4 text-[#6c7086]" />
        </button>
        <button
          onClick={onAutoLayout}
          className="p-2 rounded hover:bg-[#313244] transition-colors"
          title="Auto Layout"
        >
          <Layout className="w-4 h-4 text-[#6c7086]" />
        </button>

        <div className="w-px h-6 bg-[#313244] mx-2" />

        <button
          onClick={onEvaluate}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#cdd6f4] bg-purple-600/20 border border-purple-500/50 rounded-md hover:bg-purple-600/30 transition-colors"
        >
          <FlaskConical className="w-4 h-4 text-purple-400" />
          Evaluate
        </button>

        <button
          onClick={onRun}
          className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
        >
          <Play className="w-4 h-4" />
          Run
        </button>
      </div>
    </div>
  );
}
