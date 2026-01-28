import { useState } from 'react';
import {
  Plus,
  Trash2,
  BookOpen,
  Database,
  Globe,
  FileSearch,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  GripVertical,
} from 'lucide-react';
import type { DeepRAGConfig, GroundingSource, ScopeFilter } from '../../types';

interface DeepRAGEditorProps {
  config: Partial<DeepRAGConfig>;
  onChange: (config: Partial<DeepRAGConfig>) => void;
}

export default function DeepRAGEditor({ config, onChange }: DeepRAGEditorProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    queries: true,
    sources: true,
    filters: false,
    synthesis: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const queries = config.queries || [];
  const groundingSources = config.groundingSources || [];
  const scopeFilters = config.scopeFilters || [];

  const handleAddQuery = () => {
    onChange({ ...config, queries: [...queries, ''] });
  };

  const handleUpdateQuery = (index: number, value: string) => {
    const newQueries = [...queries];
    newQueries[index] = value;
    onChange({ ...config, queries: newQueries });
  };

  const handleRemoveQuery = (index: number) => {
    onChange({ ...config, queries: queries.filter((_, i) => i !== index) });
  };

  const handleAddSource = () => {
    const newSource: GroundingSource = {
      id: `source-${Date.now()}`,
      type: 'index',
      name: 'New Source',
      priority: 1,
      trustLevel: 'medium',
    };
    onChange({ ...config, groundingSources: [...groundingSources, newSource] });
  };

  const handleUpdateSource = (index: number, updates: Partial<GroundingSource>) => {
    const newSources = [...groundingSources];
    newSources[index] = { ...newSources[index], ...updates };
    onChange({ ...config, groundingSources: newSources });
  };

  const handleRemoveSource = (index: number) => {
    onChange({
      ...config,
      groundingSources: groundingSources.filter((_, i) => i !== index),
    });
  };

  const handleAddFilter = () => {
    const newFilter: ScopeFilter = {
      field: '',
      operator: 'contains',
      value: '',
    };
    onChange({ ...config, scopeFilters: [...scopeFilters, newFilter] });
  };

  const handleUpdateFilter = (index: number, updates: Partial<ScopeFilter>) => {
    const newFilters = [...scopeFilters];
    newFilters[index] = { ...newFilters[index], ...updates };
    onChange({ ...config, scopeFilters: newFilters });
  };

  const handleRemoveFilter = (index: number) => {
    onChange({ ...config, scopeFilters: scopeFilters.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="p-3 rounded-lg bg-sky-500/10 border border-sky-500/30">
        <div className="flex items-center gap-2 text-sky-400 mb-1">
          <BookOpen className="w-4 h-4" />
          <span className="text-sm font-medium">Deep RAG Pattern</span>
        </div>
        <p className="text-xs text-sky-300/70">
          Research queries with citations, grounding sources, and evidence tracking
        </p>
      </div>

      {/* Query Type Selection */}
      <div>
        <label className="block text-xs font-medium text-[#a6adc8] mb-2">
          Query Mode
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => onChange({ ...config, queryType: 'single' })}
            className={`flex-1 px-3 py-2 text-sm rounded-md border transition-colors ${
              config.queryType === 'single'
                ? 'bg-sky-500/20 border-sky-500/50 text-sky-300'
                : 'bg-[#1e1e2e] border-[#313244] text-[#6c7086] hover:border-[#45475a]'
            }`}
          >
            Single Query
          </button>
          <button
            onClick={() => onChange({ ...config, queryType: 'multi' })}
            className={`flex-1 px-3 py-2 text-sm rounded-md border transition-colors ${
              config.queryType === 'multi'
                ? 'bg-sky-500/20 border-sky-500/50 text-sky-300'
                : 'bg-[#1e1e2e] border-[#313244] text-[#6c7086] hover:border-[#45475a]'
            }`}
          >
            Multi-Query
          </button>
        </div>
      </div>

      {/* Research Queries Section */}
      <CollapsibleSection
        title="Research Queries"
        count={queries.length}
        expanded={expandedSections.queries}
        onToggle={() => toggleSection('queries')}
      >
        <div className="space-y-2">
          {queries.map((query, index) => (
            <div key={index} className="flex items-start gap-2">
              <GripVertical className="w-4 h-4 text-[#45475a] mt-2.5 cursor-grab" />
              <textarea
                value={query}
                onChange={(e) => handleUpdateQuery(index, e.target.value)}
                placeholder={`Research question ${index + 1}...`}
                rows={2}
                className="flex-1 px-3 py-2 bg-[#1e1e2e] border border-[#313244] rounded-md text-sm text-[#cdd6f4] placeholder-[#45475a] focus:outline-none focus:border-sky-500 resize-none"
              />
              <button
                onClick={() => handleRemoveQuery(index)}
                className="p-2 text-[#6c7086] hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            onClick={handleAddQuery}
            className="w-full px-3 py-2 text-sm text-sky-400 border border-dashed border-sky-500/30 rounded-md hover:bg-sky-500/10 transition-colors flex items-center justify-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Query
          </button>
        </div>
      </CollapsibleSection>

      {/* Grounding Sources Section */}
      <CollapsibleSection
        title="Grounding Sources"
        count={groundingSources.length}
        expanded={expandedSections.sources}
        onToggle={() => toggleSection('sources')}
      >
        <div className="space-y-3">
          {groundingSources.map((source, index) => (
            <div
              key={source.id}
              className="p-3 bg-[#1e1e2e] border border-[#313244] rounded-md space-y-2"
            >
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={source.name}
                  onChange={(e) => handleUpdateSource(index, { name: e.target.value })}
                  className="flex-1 px-2 py-1 bg-transparent text-sm text-[#cdd6f4] border-b border-transparent hover:border-[#45475a] focus:border-sky-500 focus:outline-none"
                />
                <button
                  onClick={() => handleRemoveSource(index)}
                  className="p-1 text-[#6c7086] hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-[10px] text-[#6c7086] mb-1">Type</label>
                  <select
                    value={source.type}
                    onChange={(e) =>
                      handleUpdateSource(index, {
                        type: e.target.value as GroundingSource['type'],
                      })
                    }
                    className="w-full px-2 py-1.5 bg-[#11111b] border border-[#313244] rounded text-xs text-[#cdd6f4]"
                  >
                    <option value="index">Knowledge Index</option>
                    <option value="connector">Data Connector</option>
                    <option value="web">Web Search</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] text-[#6c7086] mb-1">Trust Level</label>
                  <select
                    value={source.trustLevel}
                    onChange={(e) =>
                      handleUpdateSource(index, {
                        trustLevel: e.target.value as GroundingSource['trustLevel'],
                      })
                    }
                    className="w-full px-2 py-1.5 bg-[#11111b] border border-[#313244] rounded text-xs text-[#cdd6f4]"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div className="w-16">
                  <label className="block text-[10px] text-[#6c7086] mb-1">Priority</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={source.priority}
                    onChange={(e) =>
                      handleUpdateSource(index, { priority: Number(e.target.value) })
                    }
                    className="w-full px-2 py-1.5 bg-[#11111b] border border-[#313244] rounded text-xs text-[#cdd6f4]"
                  />
                </div>
              </div>

              {/* Source Type Icon */}
              <div className="flex items-center gap-1 text-[10px] text-[#45475a]">
                {source.type === 'index' && <Database className="w-3 h-3" />}
                {source.type === 'connector' && <FileSearch className="w-3 h-3" />}
                {source.type === 'web' && <Globe className="w-3 h-3" />}
                <span>
                  {source.type === 'index' && 'Vector/semantic search index'}
                  {source.type === 'connector' && 'Data connector integration'}
                  {source.type === 'web' && 'Live web search'}
                </span>
              </div>
            </div>
          ))}

          <button
            onClick={handleAddSource}
            className="w-full px-3 py-2 text-sm text-sky-400 border border-dashed border-sky-500/30 rounded-md hover:bg-sky-500/10 transition-colors flex items-center justify-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Source
          </button>
        </div>
      </CollapsibleSection>

      {/* Scope Filters Section */}
      <CollapsibleSection
        title="Scope Filters"
        count={scopeFilters.length}
        expanded={expandedSections.filters}
        onToggle={() => toggleSection('filters')}
      >
        <div className="space-y-2">
          {scopeFilters.map((filter, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={filter.field}
                onChange={(e) => handleUpdateFilter(index, { field: e.target.value })}
                placeholder="Field"
                className="w-24 px-2 py-1.5 bg-[#1e1e2e] border border-[#313244] rounded text-xs text-[#cdd6f4]"
              />
              <select
                value={filter.operator}
                onChange={(e) =>
                  handleUpdateFilter(index, {
                    operator: e.target.value as ScopeFilter['operator'],
                  })
                }
                className="w-24 px-2 py-1.5 bg-[#1e1e2e] border border-[#313244] rounded text-xs text-[#cdd6f4]"
              >
                <option value="equals">equals</option>
                <option value="contains">contains</option>
                <option value="range">range</option>
                <option value="before">before</option>
                <option value="after">after</option>
              </select>
              <input
                type="text"
                value={String(filter.value)}
                onChange={(e) => handleUpdateFilter(index, { value: e.target.value })}
                placeholder="Value"
                className="flex-1 px-2 py-1.5 bg-[#1e1e2e] border border-[#313244] rounded text-xs text-[#cdd6f4]"
              />
              <button
                onClick={() => handleRemoveFilter(index)}
                className="p-1.5 text-[#6c7086] hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          <button
            onClick={handleAddFilter}
            className="w-full px-3 py-2 text-sm text-sky-400 border border-dashed border-sky-500/30 rounded-md hover:bg-sky-500/10 transition-colors flex items-center justify-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Filter
          </button>
        </div>
      </CollapsibleSection>

      {/* Citation Settings */}
      <div className="space-y-3">
        <h4 className="text-xs font-medium text-[#a6adc8]">Citation Settings</h4>

        <div>
          <label className="block text-[10px] text-[#6c7086] mb-1">Citation Mode</label>
          <div className="flex gap-2">
            <button
              onClick={() => onChange({ ...config, citationMode: 'strict' })}
              className={`flex-1 px-3 py-2 text-xs rounded border transition-colors ${
                config.citationMode === 'strict'
                  ? 'bg-sky-500/20 border-sky-500/50 text-sky-300'
                  : 'bg-[#1e1e2e] border-[#313244] text-[#6c7086] hover:border-[#45475a]'
              }`}
            >
              <div className="font-medium">Strict</div>
              <div className="text-[10px] opacity-70">All claims cited</div>
            </button>
            <button
              onClick={() => onChange({ ...config, citationMode: 'relaxed' })}
              className={`flex-1 px-3 py-2 text-xs rounded border transition-colors ${
                config.citationMode === 'relaxed'
                  ? 'bg-sky-500/20 border-sky-500/50 text-sky-300'
                  : 'bg-[#1e1e2e] border-[#313244] text-[#6c7086] hover:border-[#45475a]'
              }`}
            >
              <div className="font-medium">Relaxed</div>
              <div className="text-[10px] opacity-70">Best effort</div>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] text-[#6c7086] mb-1">
              Evidence Threshold
            </label>
            <input
              type="number"
              min={0}
              max={1}
              step={0.1}
              value={config.evidenceThreshold ?? 0.7}
              onChange={(e) =>
                onChange({ ...config, evidenceThreshold: Number(e.target.value) })
              }
              className="w-full px-2 py-1.5 bg-[#1e1e2e] border border-[#313244] rounded text-xs text-[#cdd6f4]"
            />
          </div>
          <div>
            <label className="block text-[10px] text-[#6c7086] mb-1">Max Sources</label>
            <input
              type="number"
              min={1}
              max={50}
              value={config.maxSources ?? 10}
              onChange={(e) => onChange({ ...config, maxSources: Number(e.target.value) })}
              className="w-full px-2 py-1.5 bg-[#1e1e2e] border border-[#313244] rounded text-xs text-[#cdd6f4]"
            />
          </div>
        </div>
      </div>

      {/* Synthesis Settings */}
      <CollapsibleSection
        title="Synthesis Settings"
        expanded={expandedSections.synthesis}
        onToggle={() => toggleSection('synthesis')}
      >
        <div className="space-y-3">
          <div>
            <label className="block text-[10px] text-[#6c7086] mb-1">
              Synthesis Instructions
            </label>
            <textarea
              value={config.synthesisInstructions || ''}
              onChange={(e) =>
                onChange({ ...config, synthesisInstructions: e.target.value })
              }
              placeholder="How to synthesize and present the research findings..."
              rows={3}
              className="w-full px-3 py-2 bg-[#1e1e2e] border border-[#313244] rounded-md text-xs text-[#cdd6f4] placeholder-[#45475a] focus:outline-none focus:border-sky-500 resize-none"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={config.followUpEnabled ?? true}
              onChange={(e) => onChange({ ...config, followUpEnabled: e.target.checked })}
              className="w-4 h-4 rounded border-[#313244] bg-[#1e1e2e] text-sky-500 focus:ring-sky-500 focus:ring-offset-0"
            />
            <span className="text-xs text-[#a6adc8]">Enable follow-up questions</span>
          </label>
        </div>
      </CollapsibleSection>

      {/* Validation Warning */}
      {queries.length === 0 && (
        <div className="p-3 rounded-md bg-amber-500/10 border border-amber-500/30 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-300">
            Add at least one research query to enable this pattern
          </p>
        </div>
      )}
    </div>
  );
}

interface CollapsibleSectionProps {
  title: string;
  count?: number;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function CollapsibleSection({
  title,
  count,
  expanded,
  onToggle,
  children,
}: CollapsibleSectionProps) {
  return (
    <div className="border border-[#313244] rounded-md overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2 bg-[#1e1e2e] hover:bg-[#262637] transition-colors"
      >
        <div className="flex items-center gap-2">
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-[#6c7086]" />
          ) : (
            <ChevronRight className="w-4 h-4 text-[#6c7086]" />
          )}
          <span className="text-xs font-medium text-[#a6adc8]">{title}</span>
        </div>
        {count !== undefined && (
          <span className="text-xs text-[#45475a]">{count}</span>
        )}
      </button>
      {expanded && <div className="p-3 bg-[#11111b]">{children}</div>}
    </div>
  );
}
