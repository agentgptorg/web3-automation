import { Logger } from '../utils/logger';
import { WorkflowConfig, Task, TaskResult } from '../types';
import { BlockchainManager } from './blockchain';

export class WorkflowManager {
  private config: WorkflowConfig;
  private blockchain: BlockchainManager;
  private logger: Logger;
  private activeTasks: Map<string, TaskResult>;

  constructor(config: WorkflowConfig, blockchain: BlockchainManager) {
    this.config = config;
    this.blockchain = blockchain;
    this.logger = new Logger('WorkflowManager');
    this.activeTasks = new Map();
  }

  public async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing workflow manager...');
      // Initialize any required resources
      this.logger.info('Workflow manager initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize workflow manager', error);
      throw error;
    }
  }

  public async executeTask(task: Task, analysis: any): Promise<TaskResult> {
    const taskId = this.generateTaskId();
    const taskResult: TaskResult = {
      taskId,
      status: 'pending',
      timestamp: Date.now()
    };

    this.activeTasks.set(taskId, taskResult);

    try {
      this.logger.info(`Starting task execution: ${taskId}`);

      // Execute task based on type
      switch (task.type) {
        case 'contract_interaction':
          await this.executeContractInteraction(task, analysis);
          break;
        case 'payment':
          await this.executePayment(task, analysis);
          break;
        case 'monitoring':
          await this.executeMonitoring(task, analysis);
          break;
        default:
          throw new Error(`Unsupported task type: ${task.type}`);
      }

      taskResult.status = 'success';
      this.logger.info(`Task completed successfully: ${taskId}`);
    } catch (error) {
      taskResult.status = 'failed';
      taskResult.error = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Task failed: ${taskId}`, error);
    }

    return taskResult;
  }

  private async executeContractInteraction(task: Task, analysis: any): Promise<void> {
    if (!task.contractAddress || !task.method) {
      throw new Error('Contract address and method are required for contract interaction');
    }

    const contract = await this.blockchain.getContract(
      task.contractAddress,
      analysis.contractAbi
    );

    const tx = await contract[task.method](...(task.params || []));
    await this.blockchain.waitForTransaction(tx.hash);
  }

  private async executePayment(task: Task, analysis: any): Promise<void> {
    // Implement payment execution logic
    this.logger.info('Payment execution not implemented yet');
  }

  private async executeMonitoring(task: Task, analysis: any): Promise<void> {
    // Implement monitoring execution logic
    this.logger.info('Monitoring execution not implemented yet');
  }

  public getTaskStatus(taskId: string): TaskResult | undefined {
    return this.activeTasks.get(taskId);
  }

  public async cancelTask(taskId: string): Promise<void> {
    const task = this.activeTasks.get(taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    if (task.status === 'pending') {
      task.status = 'failed';
      task.error = 'Task cancelled by user';
      this.logger.info(`Task cancelled: ${taskId}`);
    } else {
      throw new Error(`Cannot cancel task in ${task.status} status`);
    }
  }

  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
} 