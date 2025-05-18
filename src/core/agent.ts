import { ethers } from 'ethers';
import { OpenAI } from 'openai';
import { z } from 'zod';
import { Logger } from '../utils/logger';
import { BlockchainManager } from './blockchain';
import { WorkflowManager } from './workflow';
import { AgentConfig, Task, TaskResult } from '../types';

export class AgentGPT {
  private config: AgentConfig;
  private openai: OpenAI;
  private blockchain: BlockchainManager;
  private workflow: WorkflowManager;
  private logger: Logger;

  constructor(config: AgentConfig) {
    this.config = this.validateConfig(config);
    this.openai = new OpenAI({ apiKey: config.apiKey });
    this.blockchain = new BlockchainManager(config);
    this.workflow = new WorkflowManager(config);
    this.logger = new Logger('AgentGPT');
  }

  private validateConfig(config: AgentConfig): AgentConfig {
    const configSchema = z.object({
      apiKey: z.string().min(1),
      network: z.string().default('ethereum'),
      provider: z.string().url(),
      timeout: z.number().default(30000),
      retries: z.number().default(3),
    });

    return configSchema.parse(config);
  }

  public async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing AgentGPT...');
      await this.blockchain.initialize();
      await this.workflow.initialize();
      this.logger.info('AgentGPT initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize AgentGPT', error);
      throw error;
    }
  }

  public async executeTask(task: Task): Promise<TaskResult> {
    try {
      this.logger.info(`Executing task: ${task.type}`);
      
      // Analyze task using GPT-4
      const analysis = await this.analyzeTask(task);
      
      // Execute task based on analysis
      const result = await this.workflow.executeTask(task, analysis);
      
      this.logger.info(`Task completed successfully: ${task.type}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to execute task: ${task.type}`, error);
      throw error;
    }
  }

  private async analyzeTask(task: Task): Promise<any> {
    const prompt = this.buildTaskPrompt(task);
    
    const completion = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert blockchain automation assistant. Analyze the given task and provide detailed execution steps."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    return JSON.parse(completion.choices[0].message.content || '{}');
  }

  private buildTaskPrompt(task: Task): string {
    return `
      Task Type: ${task.type}
      Contract Address: ${task.contractAddress}
      Method: ${task.method}
      Parameters: ${JSON.stringify(task.params)}
      
      Please analyze this task and provide:
      1. Required steps for execution
      2. Potential risks and mitigations
      3. Expected outcomes
      4. Required blockchain interactions
    `;
  }

  public async getTaskStatus(taskId: string): Promise<any> {
    return this.workflow.getTaskStatus(taskId);
  }

  public async cancelTask(taskId: string): Promise<void> {
    await this.workflow.cancelTask(taskId);
  }
} 