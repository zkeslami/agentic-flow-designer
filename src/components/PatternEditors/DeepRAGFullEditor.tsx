import { useState } from 'react';
import {
  X,
  BookOpen,
  Settings,
  FileText,
  Play,
  FlaskConical,
  BarChart3,
  History,
  ChevronRight,
  Plus,
  Trash2,
  Database,
  Globe,
  FileSearch,
  Search,
  Filter,
  Quote,
  Pin,
  Star,
  Check,
  AlertCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  Copy,
  Target,
  Gauge,
  ListChecks,
} from 'lucide-react';
import type { DeepRAGConfig, GroundingSource, ScopeFilter } from '../../types';

type EditorTab =
  | 'input'
  | 'citations'
  | 'prompt'
  | 'test'
  | 'evaluate'
  | 'scoring'
  | 'runs';

interface DeepRAGFullEditorProps {
  isOpen: boolean;
  onClose: () => void;
  config: Partial<DeepRAGConfig>;
  onChange: (config: Partial<DeepRAGConfig>) => void;
  nodeLabel: string;
}

// Mock data for demonstration
const mockSources = [
  { id: 's1', name: 'Enterprise Knowledge Base', type: 'index' as const, documents: 1234, lastSync: '2 hours ago' },
  { id: 's2', name: 'Product Documentation', type: 'index' as const, documents: 567, lastSync: '1 day ago' },
  { id: 's3', name: 'Web Search', type: 'web' as const, documents: 0, lastSync: 'Real-time' },
];

const mockCitations = [
  { id: 'c1', source: 'Product Docs', document: 'Installation Guide.pdf', page: 12, excerpt: 'To install the application, first ensure you have Node.js 18+ installed...', pinned: true, included: true, trust: 'high' as const },
  { id: 'c2', source: 'KB Article', document: 'Troubleshooting FAQ', page: 3, excerpt: 'Common issues include port conflicts and missing environment variables...', pinned: false, included: true, trust: 'medium' as const },
  { id: 'c3', source: 'Web Search', document: 'Stack Overflow Answer', page: 1, excerpt: 'You can resolve this by clearing the cache and restarting the service...', pinned: false, included: false, trust: 'low' as const },
];

const mockEvalResults = [
  { question: 'How do I install the product?', expectedCitations: 2, actualCitations: 2, faithfulness: 0.95, status: 'pass' },
  { question: 'What are the system requirements?', expectedCitations: 3, actualCitations: 2, faithfulness: 0.78, status: 'warn' },
  { question: 'How to configure SSO?', expectedCitations: 4, actualCitations: 1, faithfulness: 0.45, status: 'fail' },
];

const mockRuns = [
  { id: 'r1', timestamp: '10 min ago', query: 'Installation steps', sources: 3, latency: 2.3, score: 0.92, status: 'completed' },
  { id: 'r2', timestamp: '1 hour ago', query: 'API authentication', sources: 5, latency: 3.1, score: 0.87, status: 'completed' },
  { id: 'r3', timestamp: '2 hours ago', query: 'Error handling', sources: 2, latency: 1.8, score: 0.95, status: 'completed' },
];

export default function DeepRAGFullEditor({
  isOpen,
  onClose,
  config,
  onChange,
  nodeLabel,
}: DeepRAGFullEditorProps) {
  const [activeTab, setActiveTab] = useState<EditorTab>('input');
  const [selectedCitation, setSelectedCitation] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStep, setSimulationStep] = useState(0);

  if (!isOpen) return null;

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

  const handleAddSource = (source: typeof mockSources[0]) => {
    const newSource: GroundingSource = {
      id: source.id,
      type: source.type,
      name: source.name,
      priority: groundingSources.length + 1,
      trustLevel: 'medium',
    };
    onChange({ ...config, groundingSources: [...groundingSources, newSource] });
  };

  const handleRemoveSource = (id: string) => {
    onChange({
      ...config,
      groundingSources: groundingSources.filter((s) => s.id !== id),
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

  const runSimulation = () => {
    setIsSimulating(true);
    setSimulationStep(0);
    const steps = ['retrieve', 'summarize', 'refine', 'retrieve', 'synthesize'];
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setSimulationStep(step);
      if (step >= steps.length) {
        clearInterval(interval);
        setIsSimulating(false);
      }
    }, 1500);
  };

  const tabs: { id: EditorTab; label: string; icon: React.ReactNode }[] = [
    { id: 'input', label: 'Input & Sources', icon: <Settings className="w-4 h-4" /> },
    { id: 'citations', label: 'Citations', icon: <Quote className="w-4 h-4" /> },
    { id: 'prompt', label: 'Prompt', icon: <FileText className="w-4 h-4" /> },
    { id: 'test', label: 'Test & Simulate', icon: <Play className="w-4 h-4" /> },
    { id: 'evaluate', label: 'Evaluations', icon: <FlaskConical className="w-4 h-4" /> },
    { id: 'scoring', label: 'Scoring', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'runs', label: 'Run History', icon: <History className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
      <div className="w-[95vw] h-[90vh] bg-[#11111b] rounded-xl border border-[#313244] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#313244] bg-[#181825]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-500/20">
              <BookOpen className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#cdd6f4]">{nodeLabel}</h2>
              <p className="text-xs text-[#6c7086]">Deep RAG Pattern Editor</p>
            </div>
            <span className="ml-4 px-2 py-0.5 text-[10px] font-medium bg-purple-500/20 text-purple-300 rounded">
              PATTERN
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[#313244] transition-colors"
          >
            <X className="w-5 h-5 text-[#6c7086]" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-4 py-2 border-b border-[#313244] bg-[#181825] overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-sky-500/20 text-sky-300'
                  : 'text-[#6c7086] hover:text-[#a6adc8] hover:bg-[#1e1e2e]'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {/* Input & Sources Tab */}
          {activeTab === 'input' && (
            <div className="h-full flex">
              {/* Left Panel - Query Input */}
              <div className="w-1/2 p-6 border-r border-[#313244] overflow-y-auto">
                <div className="space-y-6">
                  {/* Query Mode */}
                  <div>
                    <h3 className="text-sm font-medium text-[#cdd6f4] mb-3">Research Query Mode</h3>
                    <div className="flex gap-3">
                      <button
                        onClick={() => onChange({ ...config, queryType: 'single' })}
                        className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                          config.queryType === 'single'
                            ? 'border-sky-500 bg-sky-500/10'
                            : 'border-[#313244] hover:border-[#45475a]'
                        }`}
                      >
                        <Search className="w-5 h-5 text-sky-400 mb-2" />
                        <div className="text-sm font-medium text-[#cdd6f4]">Single Query</div>
                        <div className="text-xs text-[#6c7086] mt-1">One focused research question</div>
                      </button>
                      <button
                        onClick={() => onChange({ ...config, queryType: 'multi' })}
                        className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                          config.queryType === 'multi'
                            ? 'border-sky-500 bg-sky-500/10'
                            : 'border-[#313244] hover:border-[#45475a]'
                        }`}
                      >
                        <ListChecks className="w-5 h-5 text-sky-400 mb-2" />
                        <div className="text-sm font-medium text-[#cdd6f4]">Multi-Query</div>
                        <div className="text-xs text-[#6c7086] mt-1">Multiple related questions</div>
                      </button>
                    </div>
                  </div>

                  {/* Research Queries */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-[#cdd6f4]">Research Queries</h3>
                      <span className="text-xs text-[#45475a]">{queries.length} queries</span>
                    </div>
                    <div className="space-y-3">
                      {queries.map((query, index) => (
                        <div key={index} className="relative group">
                          <textarea
                            value={query}
                            onChange={(e) => handleUpdateQuery(index, e.target.value)}
                            placeholder={`Research question ${index + 1}...`}
                            rows={2}
                            className="w-full px-4 py-3 bg-[#1e1e2e] border border-[#313244] rounded-lg text-sm text-[#cdd6f4] placeholder-[#45475a] focus:outline-none focus:border-sky-500 resize-none pr-10"
                          />
                          <button
                            onClick={() => handleRemoveQuery(index)}
                            className="absolute top-3 right-3 p-1 text-[#45475a] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={handleAddQuery}
                        className="w-full px-4 py-3 text-sm text-sky-400 border-2 border-dashed border-sky-500/30 rounded-lg hover:bg-sky-500/10 transition-colors flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Research Query
                      </button>
                    </div>
                  </div>

                  {/* Scope Filters */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-[#cdd6f4] flex items-center gap-2">
                        <Filter className="w-4 h-4 text-[#6c7086]" />
                        Scope & Filters
                      </h3>
                      <button
                        onClick={handleAddFilter}
                        className="text-xs text-sky-400 hover:text-sky-300"
                      >
                        + Add Filter
                      </button>
                    </div>
                    <div className="space-y-2">
                      {scopeFilters.length === 0 ? (
                        <div className="p-4 text-center text-[#45475a] text-sm border border-dashed border-[#313244] rounded-lg">
                          No filters applied - searching all content
                        </div>
                      ) : (
                        scopeFilters.map((_filter, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-[#1e1e2e] rounded-lg">
                            <select className="px-2 py-1 bg-[#11111b] border border-[#313244] rounded text-xs text-[#cdd6f4]">
                              <option>Date</option>
                              <option>Author</option>
                              <option>Type</option>
                              <option>Category</option>
                            </select>
                            <select className="px-2 py-1 bg-[#11111b] border border-[#313244] rounded text-xs text-[#cdd6f4]">
                              <option>after</option>
                              <option>before</option>
                              <option>equals</option>
                              <option>contains</option>
                            </select>
                            <input
                              type="text"
                              placeholder="Value"
                              className="flex-1 px-2 py-1 bg-[#11111b] border border-[#313244] rounded text-xs text-[#cdd6f4]"
                            />
                            <button className="p-1 text-[#6c7086] hover:text-red-400">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Panel - Grounding Sources */}
              <div className="w-1/2 p-6 overflow-y-auto">
                <div className="space-y-6">
                  {/* Selected Sources */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-[#cdd6f4]">Selected Grounding Sources</h3>
                      <span className="text-xs text-[#45475a]">{groundingSources.length} sources</span>
                    </div>
                    {groundingSources.length === 0 ? (
                      <div className="p-6 text-center border-2 border-dashed border-[#313244] rounded-lg">
                        <Database className="w-8 h-8 text-[#45475a] mx-auto mb-2" />
                        <p className="text-sm text-[#6c7086]">No sources selected</p>
                        <p className="text-xs text-[#45475a] mt-1">Add sources from the catalog below</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {groundingSources.map((source) => (
                          <div
                            key={source.id}
                            className="flex items-center justify-between p-3 bg-[#1e1e2e] border border-[#313244] rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-sky-500/20 flex items-center justify-center">
                                {source.type === 'index' && <Database className="w-4 h-4 text-sky-400" />}
                                {source.type === 'web' && <Globe className="w-4 h-4 text-sky-400" />}
                                {source.type === 'connector' && <FileSearch className="w-4 h-4 text-sky-400" />}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-[#cdd6f4]">{source.name}</div>
                                <div className="flex items-center gap-2 text-xs text-[#6c7086]">
                                  <span>Priority: {source.priority}</span>
                                  <span>•</span>
                                  <span className={`${
                                    source.trustLevel === 'high' ? 'text-green-400' :
                                    source.trustLevel === 'medium' ? 'text-amber-400' : 'text-red-400'
                                  }`}>
                                    {source.trustLevel} trust
                                  </span>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveSource(source.id)}
                              className="p-1 text-[#6c7086] hover:text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Source Catalog */}
                  <div>
                    <h3 className="text-sm font-medium text-[#cdd6f4] mb-3">Source Catalog</h3>
                    <div className="space-y-2">
                      {mockSources.map((source) => {
                        const isSelected = groundingSources.some((s) => s.id === source.id);
                        return (
                          <div
                            key={source.id}
                            className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                              isSelected
                                ? 'bg-sky-500/10 border-sky-500/50'
                                : 'bg-[#1e1e2e] border-[#313244] hover:border-[#45475a]'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                isSelected ? 'bg-sky-500/30' : 'bg-[#313244]'
                              }`}>
                                {source.type === 'index' && <Database className="w-4 h-4 text-sky-400" />}
                                {source.type === 'web' && <Globe className="w-4 h-4 text-sky-400" />}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-[#cdd6f4]">{source.name}</div>
                                <div className="flex items-center gap-2 text-xs text-[#6c7086]">
                                  {source.documents > 0 && <span>{source.documents.toLocaleString()} docs</span>}
                                  <span>•</span>
                                  <span>Synced {source.lastSync}</span>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => isSelected ? handleRemoveSource(source.id) : handleAddSource(source)}
                              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                                isSelected
                                  ? 'bg-sky-500/20 text-sky-300'
                                  : 'bg-[#313244] text-[#a6adc8] hover:bg-[#45475a]'
                              }`}
                            >
                              {isSelected ? 'Added' : 'Add'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Query Preview */}
                  <div className="p-4 bg-[#1e1e2e] border border-[#313244] rounded-lg">
                    <h4 className="text-xs font-medium text-[#6c7086] mb-2">QUERY PREVIEW</h4>
                    <div className="text-sm text-[#cdd6f4]">
                      {queries.length > 0 ? (
                        <div className="space-y-1">
                          {queries.slice(0, 2).map((q, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <ChevronRight className="w-4 h-4 text-sky-400 mt-0.5 flex-shrink-0" />
                              <span className="truncate">{q || '(empty query)'}</span>
                            </div>
                          ))}
                          {queries.length > 2 && (
                            <div className="text-xs text-[#45475a]">+{queries.length - 2} more</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-[#45475a]">No queries defined</span>
                      )}
                    </div>
                    <div className="mt-3 pt-3 border-t border-[#313244]">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#6c7086]">Sources: {groundingSources.length}</span>
                        <span className="text-[#6c7086]">Filters: {scopeFilters.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Citations Tab */}
          {activeTab === 'citations' && (
            <div className="h-full flex">
              {/* Citation List */}
              <div className="w-1/2 p-6 border-r border-[#313244] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-[#cdd6f4]">Citation Inspector</h3>
                  <div className="flex items-center gap-2">
                    <button className="px-2 py-1 text-xs bg-[#1e1e2e] border border-[#313244] rounded text-[#6c7086]">
                      All ({mockCitations.length})
                    </button>
                    <button className="px-2 py-1 text-xs bg-[#1e1e2e] border border-[#313244] rounded text-[#6c7086]">
                      Pinned ({mockCitations.filter(c => c.pinned).length})
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  {mockCitations.map((citation) => (
                    <div
                      key={citation.id}
                      onClick={() => setSelectedCitation(citation.id)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedCitation === citation.id
                          ? 'border-sky-500 bg-sky-500/10'
                          : citation.included
                          ? 'border-[#313244] bg-[#1e1e2e] hover:border-[#45475a]'
                          : 'border-[#313244] bg-[#1e1e2e]/50 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${
                            citation.trust === 'high' ? 'bg-green-500/20 text-green-300' :
                            citation.trust === 'medium' ? 'bg-amber-500/20 text-amber-300' :
                            'bg-red-500/20 text-red-300'
                          }`}>
                            {citation.trust.toUpperCase()}
                          </span>
                          <span className="text-xs text-[#6c7086]">{citation.source}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {citation.pinned && <Pin className="w-3 h-3 text-amber-400" />}
                          {citation.included ? (
                            <Eye className="w-3 h-3 text-green-400" />
                          ) : (
                            <EyeOff className="w-3 h-3 text-[#45475a]" />
                          )}
                        </div>
                      </div>
                      <div className="text-sm font-medium text-[#cdd6f4] mb-1">
                        {citation.document}
                      </div>
                      <div className="text-xs text-[#6c7086] mb-2">Page {citation.page}</div>
                      <div className="text-xs text-[#a6adc8] line-clamp-2 italic">
                        "{citation.excerpt}"
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Citation Detail */}
              <div className="w-1/2 p-6 overflow-y-auto">
                {selectedCitation ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-[#cdd6f4] mb-3">Citation Details</h3>
                      <div className="p-4 bg-[#1e1e2e] border border-[#313244] rounded-lg space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium text-[#cdd6f4]">
                            {mockCitations.find(c => c.id === selectedCitation)?.document}
                          </div>
                          <button className="p-1 hover:bg-[#313244] rounded">
                            <ExternalLink className="w-4 h-4 text-[#6c7086]" />
                          </button>
                        </div>
                        <div className="p-3 bg-[#11111b] rounded-lg">
                          <p className="text-sm text-[#a6adc8] italic">
                            "{mockCitations.find(c => c.id === selectedCitation)?.excerpt}"
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-medium text-[#6c7086] mb-2">ACTIONS</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <button className="flex items-center justify-center gap-2 px-3 py-2 bg-[#1e1e2e] border border-[#313244] rounded-lg text-sm text-[#cdd6f4] hover:bg-[#262637]">
                          <Pin className="w-4 h-4" />
                          Pin Citation
                        </button>
                        <button className="flex items-center justify-center gap-2 px-3 py-2 bg-[#1e1e2e] border border-[#313244] rounded-lg text-sm text-[#cdd6f4] hover:bg-[#262637]">
                          <EyeOff className="w-4 h-4" />
                          Exclude
                        </button>
                        <button className="flex items-center justify-center gap-2 px-3 py-2 bg-[#1e1e2e] border border-[#313244] rounded-lg text-sm text-[#cdd6f4] hover:bg-[#262637]">
                          <Star className="w-4 h-4" />
                          High Trust
                        </button>
                        <button className="flex items-center justify-center gap-2 px-3 py-2 bg-[#1e1e2e] border border-[#313244] rounded-lg text-sm text-[#cdd6f4] hover:bg-[#262637]">
                          <Copy className="w-4 h-4" />
                          Copy
                        </button>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-medium text-[#6c7086] mb-2">CLAIM MAPPING</h4>
                      <div className="p-3 bg-[#1e1e2e] border border-[#313244] rounded-lg">
                        <p className="text-xs text-[#6c7086] mb-2">Claims supported by this citation:</p>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 p-2 bg-[#11111b] rounded text-xs text-[#a6adc8]">
                            <Check className="w-3 h-3 text-green-400" />
                            Installation requires Node.js 18+
                          </div>
                          <div className="flex items-center gap-2 p-2 bg-[#11111b] rounded text-xs text-[#a6adc8]">
                            <Check className="w-3 h-3 text-green-400" />
                            First step is environment setup
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <Quote className="w-12 h-12 text-[#313244] mx-auto mb-3" />
                      <p className="text-sm text-[#6c7086]">Select a citation to view details</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Prompt Tab */}
          {activeTab === 'prompt' && (
            <div className="h-full flex">
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="max-w-4xl mx-auto space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-[#cdd6f4] mb-3">Prompt Template</h3>
                    <div className="space-y-4">
                      {/* Question Framing Section */}
                      <div className="border border-[#313244] rounded-lg overflow-hidden">
                        <div className="px-4 py-2 bg-[#1e1e2e] border-b border-[#313244] flex items-center justify-between">
                          <span className="text-xs font-medium text-[#a6adc8]">QUESTION FRAMING</span>
                          <button className="text-xs text-sky-400">Edit</button>
                        </div>
                        <textarea
                          className="w-full p-4 bg-[#11111b] text-sm text-[#cdd6f4] font-mono resize-none focus:outline-none"
                          rows={4}
                          defaultValue={`You are a research assistant. Answer the following question(s) using ONLY the provided sources.

Question(s):
{{queries}}`}
                        />
                      </div>

                      {/* Evidence Rules Section */}
                      <div className="border border-[#313244] rounded-lg overflow-hidden">
                        <div className="px-4 py-2 bg-[#1e1e2e] border-b border-[#313244] flex items-center justify-between">
                          <span className="text-xs font-medium text-[#a6adc8]">EVIDENCE RULES</span>
                          <button className="text-xs text-sky-400">Edit</button>
                        </div>
                        <textarea
                          className="w-full p-4 bg-[#11111b] text-sm text-[#cdd6f4] font-mono resize-none focus:outline-none"
                          rows={4}
                          defaultValue={`Citation Requirements:
- Every factual claim MUST have a citation
- Use format [Source: Document, Page X]
- Only cite from the provided sources
- If information is not in sources, say "Not found in sources"`}
                        />
                      </div>

                      {/* Synthesis Rules Section */}
                      <div className="border border-[#313244] rounded-lg overflow-hidden">
                        <div className="px-4 py-2 bg-[#1e1e2e] border-b border-[#313244] flex items-center justify-between">
                          <span className="text-xs font-medium text-[#a6adc8]">SYNTHESIS RULES</span>
                          <button className="text-xs text-sky-400">Edit</button>
                        </div>
                        <textarea
                          className="w-full p-4 bg-[#11111b] text-sm text-[#cdd6f4] font-mono resize-none focus:outline-none"
                          rows={4}
                          value={config.synthesisInstructions || 'Synthesize findings into a coherent response. Prioritize high-trust sources.'}
                          onChange={(e) => onChange({ ...config, synthesisInstructions: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Variables */}
                  <div>
                    <h4 className="text-xs font-medium text-[#6c7086] mb-2">AVAILABLE VARIABLES</h4>
                    <div className="flex flex-wrap gap-2">
                      {['{{queries}}', '{{sources}}', '{{filters}}', '{{summaries}}', '{{follow_ups}}'].map((v) => (
                        <span key={v} className="px-2 py-1 bg-[#1e1e2e] border border-[#313244] rounded text-xs font-mono text-sky-300">
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Version History */}
                  <div>
                    <h4 className="text-xs font-medium text-[#6c7086] mb-2">VERSION HISTORY</h4>
                    <div className="space-y-2">
                      {[
                        { version: 'v3 (current)', date: '2 hours ago', author: 'You' },
                        { version: 'v2', date: 'Yesterday', author: 'You' },
                        { version: 'v1', date: '3 days ago', author: 'Template' },
                      ].map((v) => (
                        <div key={v.version} className="flex items-center justify-between p-2 bg-[#1e1e2e] border border-[#313244] rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-[#cdd6f4]">{v.version}</span>
                            <span className="text-xs text-[#45475a]">{v.date}</span>
                          </div>
                          <button className="text-xs text-sky-400">View diff</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Test & Simulate Tab */}
          {activeTab === 'test' && (
            <div className="h-full flex">
              <div className="w-1/2 p-6 border-r border-[#313244] overflow-y-auto">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-[#cdd6f4] mb-3">Research Timeline Simulator</h3>
                    <p className="text-xs text-[#6c7086] mb-4">
                      Simulate the iterative research process: retrieve → summarize → refine → retrieve
                    </p>
                    <button
                      onClick={runSimulation}
                      disabled={isSimulating}
                      className="w-full px-4 py-3 bg-sky-500 text-white font-medium rounded-lg hover:bg-sky-600 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSimulating ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Simulating...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          Run Simulation
                        </>
                      )}
                    </button>
                  </div>

                  {/* Simulation Steps */}
                  <div className="space-y-3">
                    {['Retrieve Initial', 'Summarize', 'Refine Query', 'Retrieve Follow-up', 'Synthesize'].map((step, index) => (
                      <div
                        key={step}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                          simulationStep > index
                            ? 'bg-green-500/10 border-green-500/50'
                            : simulationStep === index && isSimulating
                            ? 'bg-sky-500/10 border-sky-500/50'
                            : 'bg-[#1e1e2e] border-[#313244]'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          simulationStep > index
                            ? 'bg-green-500/20'
                            : simulationStep === index && isSimulating
                            ? 'bg-sky-500/20'
                            : 'bg-[#313244]'
                        }`}>
                          {simulationStep > index ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : simulationStep === index && isSimulating ? (
                            <RefreshCw className="w-4 h-4 text-sky-400 animate-spin" />
                          ) : (
                            <span className="text-xs text-[#6c7086]">{index + 1}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-[#cdd6f4]">{step}</div>
                          <div className="text-xs text-[#6c7086]">
                            {simulationStep > index && 'Completed'}
                            {simulationStep === index && isSimulating && 'In progress...'}
                            {simulationStep < index && !isSimulating && 'Pending'}
                          </div>
                        </div>
                        {simulationStep > index && (
                          <button className="text-xs text-sky-400">View trace</button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="w-1/2 p-6 overflow-y-auto">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-[#cdd6f4] mb-3">Query Transformation Preview</h3>
                    <div className="space-y-3">
                      <div className="p-3 bg-[#1e1e2e] border border-[#313244] rounded-lg">
                        <div className="text-xs text-[#6c7086] mb-1">ORIGINAL QUERY</div>
                        <div className="text-sm text-[#cdd6f4]">{queries[0] || 'No query defined'}</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#45475a] mx-auto" />
                      <div className="p-3 bg-sky-500/10 border border-sky-500/30 rounded-lg">
                        <div className="text-xs text-sky-400 mb-1">GENERATED FOLLOW-UP</div>
                        <div className="text-sm text-[#cdd6f4]">What are the specific version requirements for dependencies?</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-[#cdd6f4] mb-3">Federation Comparison</h3>
                    <div className="space-y-2">
                      {groundingSources.slice(0, 3).map((source) => (
                        <div key={source.id} className="flex items-center justify-between p-3 bg-[#1e1e2e] border border-[#313244] rounded-lg">
                          <div className="flex items-center gap-2">
                            <Database className="w-4 h-4 text-sky-400" />
                            <span className="text-sm text-[#cdd6f4]">{source.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-[#6c7086]">{Math.floor(Math.random() * 10 + 1)} results</span>
                            <span className="text-xs text-green-400">{Math.floor(Math.random() * 30 + 70)}% relevance</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Evaluations Tab */}
          {activeTab === 'evaluate' && (
            <div className="h-full p-6 overflow-y-auto">
              <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-[#cdd6f4]">Evaluation Dataset</h3>
                    <p className="text-xs text-[#6c7086]">Questions with expected citations for testing</p>
                  </div>
                  <button className="px-3 py-1.5 bg-sky-500 text-white text-sm font-medium rounded-lg hover:bg-sky-600 flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Test Case
                  </button>
                </div>

                {/* Evaluation Results Table */}
                <div className="border border-[#313244] rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-[#1e1e2e]">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#6c7086]">Question</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-[#6c7086]">Expected</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-[#6c7086]">Actual</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-[#6c7086]">Faithfulness</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-[#6c7086]">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockEvalResults.map((result, index) => (
                        <tr key={index} className="border-t border-[#313244] hover:bg-[#1e1e2e]/50">
                          <td className="px-4 py-3 text-sm text-[#cdd6f4]">{result.question}</td>
                          <td className="px-4 py-3 text-center text-sm text-[#a6adc8]">{result.expectedCitations}</td>
                          <td className="px-4 py-3 text-center text-sm text-[#a6adc8]">{result.actualCitations}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-sm font-medium ${
                              result.faithfulness >= 0.9 ? 'text-green-400' :
                              result.faithfulness >= 0.7 ? 'text-amber-400' : 'text-red-400'
                            }`}>
                              {(result.faithfulness * 100).toFixed(0)}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                              result.status === 'pass' ? 'bg-green-500/20 text-green-300' :
                              result.status === 'warn' ? 'bg-amber-500/20 text-amber-300' :
                              'bg-red-500/20 text-red-300'
                            }`}>
                              {result.status.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Metrics Charts */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-[#1e1e2e] border border-[#313244] rounded-lg">
                    <div className="flex items-center gap-2 text-xs text-[#6c7086] mb-2">
                      <Target className="w-4 h-4" />
                      Citation Coverage
                    </div>
                    <div className="text-2xl font-bold text-green-400">78%</div>
                    <div className="text-xs text-[#45475a]">+5% from last run</div>
                  </div>
                  <div className="p-4 bg-[#1e1e2e] border border-[#313244] rounded-lg">
                    <div className="flex items-center gap-2 text-xs text-[#6c7086] mb-2">
                      <Check className="w-4 h-4" />
                      Faithfulness
                    </div>
                    <div className="text-2xl font-bold text-amber-400">73%</div>
                    <div className="text-xs text-[#45475a]">-2% from last run</div>
                  </div>
                  <div className="p-4 bg-[#1e1e2e] border border-[#313244] rounded-lg">
                    <div className="flex items-center gap-2 text-xs text-[#6c7086] mb-2">
                      <AlertCircle className="w-4 h-4" />
                      Contradictions
                    </div>
                    <div className="text-2xl font-bold text-[#cdd6f4]">2</div>
                    <div className="text-xs text-[#45475a]">Needs review</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Scoring Tab */}
          {activeTab === 'scoring' && (
            <div className="h-full p-6 overflow-y-auto">
              <div className="max-w-4xl mx-auto space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-[#cdd6f4] mb-4">Composite Scorecard</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Faithfulness', score: 0.87, threshold: 0.8, status: 'pass' },
                      { label: 'Citation Precision', score: 0.92, threshold: 0.85, status: 'pass' },
                      { label: 'Coverage', score: 0.78, threshold: 0.8, status: 'warn' },
                      { label: 'Latency', score: 2.3, threshold: 3.0, unit: 's', status: 'pass' },
                    ].map((metric) => (
                      <div key={metric.label} className="p-4 bg-[#1e1e2e] border border-[#313244] rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-[#a6adc8]">{metric.label}</span>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                            metric.status === 'pass' ? 'bg-green-500/20 text-green-300' :
                            metric.status === 'warn' ? 'bg-amber-500/20 text-amber-300' :
                            'bg-red-500/20 text-red-300'
                          }`}>
                            {metric.status === 'pass' ? 'READY' : 'NEEDS WORK'}
                          </span>
                        </div>
                        <div className="flex items-end gap-2">
                          <span className={`text-3xl font-bold ${
                            metric.status === 'pass' ? 'text-green-400' :
                            metric.status === 'warn' ? 'text-amber-400' : 'text-red-400'
                          }`}>
                            {metric.unit ? metric.score : `${(metric.score * 100).toFixed(0)}%`}
                          </span>
                          {metric.unit && <span className="text-sm text-[#6c7086]">{metric.unit}</span>}
                        </div>
                        <div className="mt-2 h-2 bg-[#313244] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              metric.status === 'pass' ? 'bg-green-500' :
                              metric.status === 'warn' ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${metric.unit ? (metric.score / metric.threshold * 100) : (metric.score * 100)}%` }}
                          />
                        </div>
                        <div className="mt-1 text-xs text-[#45475a]">
                          Threshold: {metric.unit ? `<${metric.threshold}${metric.unit}` : `>${metric.threshold * 100}%`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Score Driver Explanations */}
                <div>
                  <h4 className="text-xs font-medium text-[#6c7086] mb-3">SCORE DRIVERS</h4>
                  <div className="space-y-2">
                    <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5" />
                      <div>
                        <div className="text-sm text-amber-300">Coverage below threshold</div>
                        <div className="text-xs text-amber-200/70">2 questions had missing evidence from primary sources</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <Check className="w-4 h-4 text-green-400 mt-0.5" />
                      <div>
                        <div className="text-sm text-green-300">High citation precision</div>
                        <div className="text-xs text-green-200/70">92% of citations were relevant and accurate</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Production Readiness */}
                <div className="p-4 bg-[#1e1e2e] border border-[#313244] rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-[#cdd6f4]">Production Readiness</h4>
                      <p className="text-xs text-[#6c7086]">3 of 4 metrics meet threshold</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Gauge className="w-5 h-5 text-amber-400" />
                      <span className="text-lg font-bold text-amber-400">75%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Run History Tab */}
          {activeTab === 'runs' && (
            <div className="h-full flex">
              <div className="w-1/3 p-6 border-r border-[#313244] overflow-y-auto">
                <h3 className="text-sm font-medium text-[#cdd6f4] mb-4">Recent Runs</h3>
                <div className="space-y-2">
                  {mockRuns.map((run) => (
                    <div
                      key={run.id}
                      className="p-3 bg-[#1e1e2e] border border-[#313244] rounded-lg hover:border-[#45475a] cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-[#cdd6f4] truncate">{run.query}</span>
                        <span className={`w-2 h-2 rounded-full ${
                          run.status === 'completed' ? 'bg-green-500' : 'bg-amber-500'
                        }`} />
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#6c7086]">
                        <span>{run.timestamp}</span>
                        <span>•</span>
                        <span>{run.sources} sources</span>
                        <span>•</span>
                        <span>{run.latency}s</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex-1 p-6 overflow-y-auto">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-[#cdd6f4] mb-4">Run Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Answer Pane */}
                      <div className="p-4 bg-[#1e1e2e] border border-[#313244] rounded-lg">
                        <h4 className="text-xs font-medium text-[#6c7086] mb-2">ANSWER</h4>
                        <p className="text-sm text-[#cdd6f4]">
                          To install the application, first ensure you have Node.js 18+ installed
                          <sup className="text-sky-400 cursor-pointer">[1]</sup>. Then run npm install
                          in the project directory
                          <sup className="text-sky-400 cursor-pointer">[2]</sup>.
                        </p>
                      </div>

                      {/* Sources Pane */}
                      <div className="p-4 bg-[#1e1e2e] border border-[#313244] rounded-lg">
                        <h4 className="text-xs font-medium text-[#6c7086] mb-2">SOURCES</h4>
                        <div className="space-y-2">
                          <div className="p-2 bg-[#11111b] rounded text-xs">
                            <span className="text-sky-400">[1]</span>
                            <span className="text-[#a6adc8] ml-2">Installation Guide.pdf, p.12</span>
                          </div>
                          <div className="p-2 bg-[#11111b] rounded text-xs">
                            <span className="text-sky-400">[2]</span>
                            <span className="text-[#a6adc8] ml-2">Quick Start.md</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Run Trace */}
                  <div>
                    <h4 className="text-xs font-medium text-[#6c7086] mb-2">RUN TRACE</h4>
                    <div className="p-4 bg-[#1e1e2e] border border-[#313244] rounded-lg space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        <Clock className="w-3 h-3 text-[#6c7086]" />
                        <span className="text-[#6c7086]">Total time:</span>
                        <span className="text-[#cdd6f4]">2.3s</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Search className="w-3 h-3 text-[#6c7086]" />
                        <span className="text-[#6c7086]">Queries issued:</span>
                        <span className="text-[#cdd6f4]">3</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Database className="w-3 h-3 text-[#6c7086]" />
                        <span className="text-[#6c7086]">Sources hit:</span>
                        <span className="text-[#cdd6f4]">2 indexes, 1 web</span>
                      </div>
                    </div>
                  </div>

                  {/* Export */}
                  <div className="flex gap-2">
                    <button className="flex-1 px-4 py-2 bg-[#1e1e2e] border border-[#313244] rounded-lg text-sm text-[#a6adc8] hover:bg-[#262637] flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" />
                      Export Evidence Bundle
                    </button>
                    <button className="px-4 py-2 bg-[#1e1e2e] border border-[#313244] rounded-lg text-sm text-[#a6adc8] hover:bg-[#262637]">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#313244] bg-[#181825]">
          <div className="flex items-center gap-4 text-xs text-[#6c7086]">
            <span>{queries.length} queries</span>
            <span>•</span>
            <span>{groundingSources.length} sources</span>
            <span>•</span>
            <span>{scopeFilters.length} filters</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-[#a6adc8] hover:text-[#cdd6f4]"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-sky-500 text-white text-sm font-medium rounded-lg hover:bg-sky-600"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
