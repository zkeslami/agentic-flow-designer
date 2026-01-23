import type { AgentPatternType, NodeConfig } from '../types';

export const nodeConfigs: Record<AgentPatternType, NodeConfig> = {
  trigger: {
    label: 'Trigger',
    description: 'Start the workflow based on an event',
    icon: 'Zap',
    color: '#22c55e',
    category: 'triggers',
    defaultData: {
      triggerType: 'manual',
      schedule: '',
      webhookPath: '',
    },
    configSchema: [
      {
        key: 'triggerType',
        label: 'Trigger Type',
        type: 'select',
        options: [
          { label: 'Manual', value: 'manual' },
          { label: 'Webhook', value: 'webhook' },
          { label: 'Schedule', value: 'schedule' },
          { label: 'Event', value: 'event' },
        ],
        defaultValue: 'manual',
      },
      {
        key: 'schedule',
        label: 'Schedule (cron)',
        type: 'text',
        placeholder: '0 9 * * 1-5',
        description: 'Cron expression for scheduled triggers',
        advanced: true,
      },
      {
        key: 'webhookPath',
        label: 'Webhook Path',
        type: 'text',
        placeholder: '/api/trigger',
        advanced: true,
      },
    ],
  },

  retrieval: {
    label: 'Retrieval & Grounding',
    description: 'Q&A from knowledge sources with context grounding',
    icon: 'Search',
    color: '#3b82f6',
    category: 'agentic',
    defaultData: {
      sources: [],
      groundingMode: 'strict',
      maxResults: 5,
      freshnessWindow: '7d',
      prompt: '',
    },
    configSchema: [
      {
        key: 'groundingMode',
        label: 'Grounding Mode',
        type: 'select',
        options: [
          { label: 'Strict - Only use retrieved context', value: 'strict' },
          { label: 'Flexible - Augment with model knowledge', value: 'flexible' },
          { label: 'Hybrid - Verify claims against sources', value: 'hybrid' },
        ],
        defaultValue: 'strict',
      },
      {
        key: 'maxResults',
        label: 'Max Results',
        type: 'number',
        defaultValue: 5,
        description: 'Maximum number of documents to retrieve',
      },
      {
        key: 'freshnessWindow',
        label: 'Freshness Window',
        type: 'select',
        options: [
          { label: 'Last 24 hours', value: '1d' },
          { label: 'Last 7 days', value: '7d' },
          { label: 'Last 30 days', value: '30d' },
          { label: 'All time', value: 'all' },
        ],
        defaultValue: '7d',
      },
      {
        key: 'prompt',
        label: 'Retrieval Prompt',
        type: 'textarea',
        placeholder: 'Enter the query or use {{input}} for dynamic input',
      },
    ],
  },

  toolUse: {
    label: 'Tool Use & Function Calling',
    description: 'Execute UiPath workflows or external APIs',
    icon: 'Wrench',
    color: '#f59e0b',
    category: 'agentic',
    defaultData: {
      tools: [],
      preconditions: '',
      retryPolicy: 'exponential',
      maxRetries: 3,
      timeout: 30000,
    },
    configSchema: [
      {
        key: 'toolSelector',
        label: 'Select Tools',
        type: 'select',
        options: [
          { label: 'HTTP Request', value: 'http' },
          { label: 'UiPath Workflow', value: 'uipath' },
          { label: 'Database Query', value: 'database' },
          { label: 'File Operations', value: 'file' },
          { label: 'Custom Function', value: 'custom' },
        ],
      },
      {
        key: 'preconditions',
        label: 'Preconditions',
        type: 'textarea',
        placeholder: 'Define conditions that must be met before tool execution',
        advanced: true,
      },
      {
        key: 'retryPolicy',
        label: 'Retry Policy',
        type: 'select',
        options: [
          { label: 'No Retry', value: 'none' },
          { label: 'Linear Backoff', value: 'linear' },
          { label: 'Exponential Backoff', value: 'exponential' },
        ],
        defaultValue: 'exponential',
      },
      {
        key: 'maxRetries',
        label: 'Max Retries',
        type: 'number',
        defaultValue: 3,
      },
    ],
  },

  planner: {
    label: 'Planner-Executor',
    description: 'Multi-step reasoning and actioning with checkpoints',
    icon: 'GitBranch',
    color: '#8b5cf6',
    category: 'agentic',
    defaultData: {
      objective: '',
      constraints: [],
      checkpoints: true,
      maxSteps: 10,
      planningModel: 'gpt-4',
    },
    configSchema: [
      {
        key: 'objective',
        label: 'Objective',
        type: 'textarea',
        placeholder: 'Describe the goal the agent should achieve',
      },
      {
        key: 'constraints',
        label: 'Constraints',
        type: 'textarea',
        placeholder: 'List constraints (one per line)',
        description: 'Boundaries the agent must operate within',
      },
      {
        key: 'checkpoints',
        label: 'Enable Checkpoints',
        type: 'boolean',
        defaultValue: true,
        description: 'Save state at each step for recovery',
      },
      {
        key: 'maxSteps',
        label: 'Max Steps',
        type: 'number',
        defaultValue: 10,
        description: 'Maximum number of planning steps',
      },
    ],
  },

  extraction: {
    label: 'Structured Extraction',
    description: 'Schema-based extraction from documents or messages',
    icon: 'FileText',
    color: '#ec4899',
    category: 'agentic',
    defaultData: {
      schema: {},
      precisionMode: 'balanced',
      validateOutput: true,
    },
    configSchema: [
      {
        key: 'schema',
        label: 'Output Schema',
        type: 'json',
        placeholder: '{\n  "name": "string",\n  "amount": "number"\n}',
        description: 'JSON schema defining the extraction structure',
      },
      {
        key: 'precisionMode',
        label: 'Precision Mode',
        type: 'select',
        options: [
          { label: 'High Recall - Extract more, verify less', value: 'recall' },
          { label: 'Balanced', value: 'balanced' },
          { label: 'High Precision - Only confident extractions', value: 'precision' },
        ],
        defaultValue: 'balanced',
      },
      {
        key: 'validateOutput',
        label: 'Validate Output',
        type: 'boolean',
        defaultValue: true,
      },
    ],
  },

  triage: {
    label: 'Document & Email Triage',
    description: 'Classification and routing based on content',
    icon: 'Mail',
    color: '#06b6d4',
    category: 'agentic',
    defaultData: {
      categories: [],
      confidenceThreshold: 0.8,
      escalationRoute: '',
    },
    configSchema: [
      {
        key: 'categories',
        label: 'Categories',
        type: 'textarea',
        placeholder: 'Enter categories (one per line)',
        description: 'Classification categories for routing',
      },
      {
        key: 'confidenceThreshold',
        label: 'Confidence Threshold',
        type: 'number',
        defaultValue: 0.8,
        description: 'Minimum confidence for auto-routing (0-1)',
      },
      {
        key: 'escalationRoute',
        label: 'Escalation Route',
        type: 'text',
        placeholder: 'Default route when confidence is low',
      },
    ],
  },

  memory: {
    label: 'Memory & Personalization',
    description: 'Stateful context and recall across sessions',
    icon: 'Brain',
    color: '#14b8a6',
    category: 'agentic',
    defaultData: {
      retentionDays: 30,
      autoWriteTriggers: [],
      memoryScope: 'user',
    },
    configSchema: [
      {
        key: 'memoryScope',
        label: 'Memory Scope',
        type: 'select',
        options: [
          { label: 'User - Personal memory', value: 'user' },
          { label: 'Session - Current session only', value: 'session' },
          { label: 'Global - Shared across all users', value: 'global' },
        ],
        defaultValue: 'user',
      },
      {
        key: 'retentionDays',
        label: 'Retention (days)',
        type: 'number',
        defaultValue: 30,
        description: 'How long to retain memories',
      },
      {
        key: 'autoWriteTriggers',
        label: 'Auto-Write Triggers',
        type: 'textarea',
        placeholder: 'Conditions that trigger memory writes',
        advanced: true,
      },
    ],
  },

  evaluation: {
    label: 'Evaluation & Experiments',
    description: 'Testing and benchmarking agent performance',
    icon: 'FlaskConical',
    color: '#f97316',
    category: 'control',
    defaultData: {
      dataset: '',
      metrics: ['accuracy', 'latency'],
      threshold: 0.9,
    },
    configSchema: [
      {
        key: 'dataset',
        label: 'Evaluation Dataset',
        type: 'text',
        placeholder: 'Path or ID of the evaluation dataset',
      },
      {
        key: 'metrics',
        label: 'Metrics',
        type: 'select',
        options: [
          { label: 'Accuracy', value: 'accuracy' },
          { label: 'Latency', value: 'latency' },
          { label: 'Token Usage', value: 'tokens' },
          { label: 'Cost', value: 'cost' },
        ],
      },
      {
        key: 'threshold',
        label: 'Success Threshold',
        type: 'number',
        defaultValue: 0.9,
      },
    ],
  },

  humanInLoop: {
    label: 'Human-in-the-Loop',
    description: 'Manual approval checkpoints with SLA tracking',
    icon: 'UserCheck',
    color: '#ef4444',
    category: 'control',
    defaultData: {
      approvalType: 'single',
      roles: [],
      slaMinutes: 60,
      escalationPath: '',
    },
    configSchema: [
      {
        key: 'approvalType',
        label: 'Approval Type',
        type: 'select',
        options: [
          { label: 'Single Approver', value: 'single' },
          { label: 'Multiple Approvers (Any)', value: 'any' },
          { label: 'Multiple Approvers (All)', value: 'all' },
          { label: 'Sequential', value: 'sequential' },
        ],
        defaultValue: 'single',
      },
      {
        key: 'roles',
        label: 'Authorized Roles',
        type: 'textarea',
        placeholder: 'Enter roles (one per line)',
      },
      {
        key: 'slaMinutes',
        label: 'SLA (minutes)',
        type: 'number',
        defaultValue: 60,
        description: 'Time limit for approval before escalation',
      },
      {
        key: 'escalationPath',
        label: 'Escalation Path',
        type: 'text',
        placeholder: 'Who to notify if SLA is breached',
      },
    ],
  },

  llm: {
    label: 'LLM / AI Model',
    description: 'Call a language model for reasoning or generation',
    icon: 'Sparkles',
    color: '#a855f7',
    category: 'agentic',
    defaultData: {
      model: 'gpt-4',
      prompt: '',
      temperature: 0.7,
      maxTokens: 1000,
      systemPrompt: '',
    },
    configSchema: [
      {
        key: 'model',
        label: 'Model',
        type: 'select',
        options: [
          { label: 'GPT-4', value: 'gpt-4' },
          { label: 'GPT-4 Turbo', value: 'gpt-4-turbo' },
          { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
          { label: 'Claude 3 Opus', value: 'claude-3-opus' },
          { label: 'Claude 3 Sonnet', value: 'claude-3-sonnet' },
        ],
        defaultValue: 'gpt-4',
      },
      {
        key: 'systemPrompt',
        label: 'System Prompt',
        type: 'textarea',
        placeholder: 'Define the AI assistant behavior',
      },
      {
        key: 'prompt',
        label: 'User Prompt',
        type: 'textarea',
        placeholder: 'The prompt to send to the model. Use {{variable}} for inputs.',
      },
      {
        key: 'temperature',
        label: 'Temperature',
        type: 'number',
        defaultValue: 0.7,
        description: 'Creativity (0 = deterministic, 1 = creative)',
      },
      {
        key: 'maxTokens',
        label: 'Max Tokens',
        type: 'number',
        defaultValue: 1000,
        advanced: true,
      },
    ],
  },

  output: {
    label: 'Output',
    description: 'Return the final result of the workflow',
    icon: 'ArrowRightCircle',
    color: '#64748b',
    category: 'actions',
    defaultData: {
      outputFormat: 'json',
      schema: {},
    },
    configSchema: [
      {
        key: 'outputFormat',
        label: 'Output Format',
        type: 'select',
        options: [
          { label: 'JSON', value: 'json' },
          { label: 'Text', value: 'text' },
          { label: 'Structured', value: 'structured' },
        ],
        defaultValue: 'json',
      },
      {
        key: 'schema',
        label: 'Output Schema',
        type: 'json',
        placeholder: '{}',
        advanced: true,
      },
    ],
  },
};

export const getNodeConfig = (type: AgentPatternType): NodeConfig => {
  return nodeConfigs[type];
};

export const nodeCategories = {
  triggers: {
    label: 'Triggers',
    description: 'Start your workflow',
    types: ['trigger'] as AgentPatternType[],
  },
  agentic: {
    label: 'Agentic Patterns',
    description: 'AI-powered automation blocks',
    types: ['retrieval', 'toolUse', 'planner', 'extraction', 'triage', 'memory', 'llm'] as AgentPatternType[],
  },
  control: {
    label: 'Control Flow',
    description: 'Manage workflow execution',
    types: ['humanInLoop', 'evaluation'] as AgentPatternType[],
  },
  actions: {
    label: 'Actions',
    description: 'Output and side effects',
    types: ['output'] as AgentPatternType[],
  },
};
