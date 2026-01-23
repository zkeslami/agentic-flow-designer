# Agentic Flow Designer

A node-based visual designer for building agentic automations, inspired by tools like n8n, with support for **dual authoring** between low-code visual editing and code.

![Main Canvas](docs/screenshots/main-canvas.png)

## Vision

> *"To win the agentic automation era we need to embrace code as a first class artifact for automation design and runtime and offer both options to end users to meet them where they're at."*

This project implements the vision of **bi-directional low-code ↔ code** authoring for agentic workflows. Users can seamlessly move between visual drag-and-drop design and Python code editing without leaving the build surface.

## Key Principles

### Dual Authoring Model

The system allows full **low-code ↔ code parity**:

- **Visual → Code**: The visual graph compiles to an opinionated Python representation (SDK conformant, framework-agnostic)
- **Code → Visual**: Python re-hydrates to the visual representation when it passes validation, ensuring structural integrity and schema alignment
- **Graceful Degradation**: When code introduces patterns that can't round-trip back to visual (dynamic values, complex control flow, metaprogramming), the editor indicates this to the user rather than preventing it

![Split View - Visual and Code Side by Side](docs/screenshots/split-view.png)

### Pattern-Specific Experiences

Rather than one generic canvas, the designer offers specialized node types for common agentic patterns:

| Pattern | Core Use Case | UX Focus |
|---------|---------------|----------|
| **Retrieval & Grounding** | Q&A from knowledge sources | Source selection, grounding mode, freshness |
| **Tool Use & Function Calling** | Executing APIs or workflows | Preconditions, tool policies, retries |
| **Planner-Executor** | Multi-step reasoning and actioning | Objectives, constraints, checkpoints |
| **Structured Extraction** | Schema-based extraction from docs | Schema definition, precision tradeoff |
| **Document & Email Triage** | Classification and routing | Confidence thresholds, escalation |
| **Memory & Personalization** | Stateful context and recall | Retention rules, auto-write triggers |
| **Evaluation & Experiments** | Testing and benchmarking | Dataset selection, metric suite |
| **Human-in-the-Loop** | Manual approval checkpoints | Pause points, roles, SLA definitions |

![Node Sidebar with Agentic Patterns](docs/screenshots/sidebar.png)

### Visual Cues for Code-Only Features

When a user begins editing in code, certain attributes may break the low-code pattern:

- Dynamic/computed values — properties derived from runtime evaluation
- Complex control flow — conditionals, loops, or branching logic
- External references — closures or variables defined outside the agent definition
- Metaprogramming — dynamic keys, reflection, or programmatically constructed objects

The editor displays visual cues (badges, indicators) that acknowledge the code exists without attempting to render it, providing a clear path back to code mode for those sections.

![Node with Code Override Indicator](docs/screenshots/node-closeup.png)

## Features

### Visual Canvas
- **Drag-and-drop** node placement from the sidebar
- **Connect nodes** by dragging between handles
- **Snap-to-grid** for clean layouts
- **Auto-layout** for automatic node arrangement
- **Zoom & pan** controls

![Properties Panel](docs/screenshots/properties-panel.png)

### Properties Panel
- **Configuration forms** matched to node type (enums become dropdowns, text becomes inputs, expressions open code editors)
- **Advanced settings** collapsible section
- **Per-node code overrides** with syntax highlighting
- **Validation errors** displayed inline

### Code View
- **Live Python code generation** from the visual graph
- **JSON export** for workflow serialization
- **Bi-directional sync indicator** showing round-trip compatibility
- **Monaco editor** with syntax highlighting and autocomplete

![Code View](docs/screenshots/code-view.png)

### AI Assistant

An always-present AI assistant that interprets natural language prompts to modify your workflow:

![AI Assistant](docs/screenshots/ai-assistant-response.png)

**Example Commands:**

| Prompt | Action |
|--------|--------|
| "Add a human approval step after the LLM" | Inserts Human-in-Loop node, rewires connections |
| "Change model to Claude Opus" | Updates LLM node configuration |
| "Create a RAG pipeline for document Q&A" | Generates complete 4-node workflow |
| "Add error handling with retries" | Configures exponential backoff policies |
| "Set temperature to 0.2" | Adjusts LLM creativity setting |
| "Remove the approval step" | Deletes node and reconnects workflow |

The assistant is context-aware and shows which authoring mode you're in (Visual/Code/Split).

![AI Assistant Panel](docs/screenshots/ai-panel.png)

## Technology Stack

- **React 19** with TypeScript
- **React Flow** (@xyflow/react) for the node-based canvas
- **Tailwind CSS v4** for styling
- **Monaco Editor** for code editing
- **Lucide React** for icons
- **Vite** for build tooling

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
git clone https://github.com/zkeslami/agentic-flow-designer.git
cd agentic-flow-designer
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── AgentNode.tsx       # Custom node component
│   ├── AIAssistant.tsx     # AI chat assistant panel
│   ├── CodePanel.tsx       # Code view with Monaco editor
│   ├── PropertiesPanel.tsx # Node configuration panel
│   ├── Sidebar.tsx         # Draggable node palette
│   └── Toolbar.tsx         # Top toolbar with view controls
├── types/
│   └── index.ts            # TypeScript type definitions
├── utils/
│   ├── codeGenerator.ts    # Python/JSON code generation
│   └── nodeConfig.ts       # Node type configurations
├── App.tsx                 # Main application component
└── main.tsx                # Entry point
```

## Node Types

### Triggers
- **Trigger** - Start workflows (manual, webhook, scheduled, event-based)

### Agentic Patterns
- **Retrieval & Grounding** - Q&A from knowledge sources with context grounding
- **Tool Use & Function Calling** - Execute APIs with retry policies
- **Planner-Executor** - Multi-step reasoning with checkpoints
- **Structured Extraction** - Schema-based data extraction
- **Document & Email Triage** - Classification and routing
- **Memory & Personalization** - Stateful context across sessions
- **LLM / AI Model** - Call language models (GPT-4, Claude, etc.)

### Control Flow
- **Human-in-the-Loop** - Manual approval checkpoints
- **Evaluation & Experiments** - Testing and benchmarking

### Actions
- **Output** - Return workflow results

## Inspiration

This project draws inspiration from:

- [n8n](https://n8n.io) - Node-based workflow automation
- [LangGraph](https://github.com/langchain-ai/langgraph) - Agent orchestration framework
- [Prefect](https://github.com/PrefectHQ/prefect) - Workflow orchestration for data pipelines
- [Mastra](https://github.com/mastra-ai/mastra) - TypeScript AI application framework
- Wix Studio, Webflow, Retool - Bi-directional visual/code editing patterns

## Bi-Directional Examples in the Industry

| Platform | Code Integration | Back to Low-Code | Constraints |
|----------|-----------------|------------------|-------------|
| Wix Studio | Velo (JavaScript) | Visual editor updates automatically | Unsupported custom code may require manual binding |
| Webflow | Custom CSS/JS embeds | Visual structure preserved | JS/CSS outside DOM hierarchy won't render |
| Bubble | Plugins or JS in API connector | Full round-trip to workflow editor | Breaking schema disables visual editor temporarily |
| Retool | Inline JS or SQL queries | Immediate sync in UI builder | External API logic may not visualize correctly |
| n8n | Custom function nodes in JS | Updates reflected in graph | External libraries prevent visual re-import |

## Roadmap

- [ ] Undo/redo functionality
- [ ] Workflow templates library
- [ ] Real-time collaboration
- [ ] Backend runtime integration
- [ ] Deployment packaging (.upkg format)
- [ ] Evaluation metrics dashboard
- [ ] Version control for workflows

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see [LICENSE](LICENSE) for details.

---

Built with [Claude Code](https://claude.ai/claude-code)
