export interface AgentConfig {
  apiKey: string;
  network: string;
  provider: string;
  timeout?: number;
  retries?: number;
}

export interface Task {
  type: string;
  contractAddress?: string;
  method?: string;
  params?: any[];
  metadata?: Record<string, any>;
}

export interface TaskResult {
  taskId: string;
  status: 'success' | 'failed' | 'pending';
  result?: any;
  error?: string;
  timestamp: number;
}

export interface BlockchainConfig {
  network: string;
  provider: string;
  timeout?: number;
  retries?: number;
}

export interface WorkflowConfig {
  maxConcurrentTasks?: number;
  retryStrategy?: {
    maxRetries: number;
    backoffMs: number;
  };
}

export interface LoggerConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  format?: 'json' | 'text';
} 