import { ethers } from 'ethers';
import { Logger } from '../utils/logger';
import { BlockchainConfig } from '../types';

export class BlockchainManager {
  private config: BlockchainConfig;
  private provider: ethers.JsonRpcProvider;
  private logger: Logger;

  constructor(config: BlockchainConfig) {
    this.config = config;
    this.logger = new Logger('BlockchainManager');
  }

  public async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing blockchain connection...');
      this.provider = new ethers.JsonRpcProvider(this.config.provider);
      await this.provider.getNetwork();
      this.logger.info('Blockchain connection established successfully');
    } catch (error) {
      this.logger.error('Failed to initialize blockchain connection', error);
      throw error;
    }
  }

  public async getContract(address: string, abi: any[]): Promise<ethers.Contract> {
    try {
      return new ethers.Contract(address, abi, this.provider);
    } catch (error) {
      this.logger.error(`Failed to get contract at ${address}`, error);
      throw error;
    }
  }

  public async getBalance(address: string): Promise<string> {
    try {
      const balance = await this.provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      this.logger.error(`Failed to get balance for ${address}`, error);
      throw error;
    }
  }

  public async getGasPrice(): Promise<string> {
    try {
      const gasPrice = await this.provider.getFeeData();
      return ethers.formatUnits(gasPrice.gasPrice || 0, 'gwei');
    } catch (error) {
      this.logger.error('Failed to get gas price', error);
      throw error;
    }
  }

  public async getTransactionReceipt(txHash: string): Promise<ethers.TransactionReceipt | null> {
    try {
      return await this.provider.getTransactionReceipt(txHash);
    } catch (error) {
      this.logger.error(`Failed to get transaction receipt for ${txHash}`, error);
      throw error;
    }
  }

  public async waitForTransaction(txHash: string): Promise<ethers.TransactionReceipt> {
    try {
      return await this.provider.waitForTransaction(txHash);
    } catch (error) {
      this.logger.error(`Failed to wait for transaction ${txHash}`, error);
      throw error;
    }
  }

  public getProvider(): ethers.JsonRpcProvider {
    return this.provider;
  }
} 