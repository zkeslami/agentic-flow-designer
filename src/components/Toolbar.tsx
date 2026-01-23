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
} from 'lucide-react';

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
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
}

export default function Toolbar({
  viewMode,
  onViewModeChange,
  onZoomIn,
  onZoomOut,
  onFitView,
  onAutoLayout,
  onSave,
  onRun,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: ToolbarProps) {
  return (
    <div className="h-12 bg-[#181825] border-b border-[#313244] flex items-center justify-between px-4">
      {/* Left: File actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={onSave}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#cdd6f4] bg-[#313244] rounded-md hover:bg-[#45475a] transition-colors"
        >
          <Save className="w-4 h-4" />
          Save
        </button>

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
