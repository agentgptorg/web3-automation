import winston from 'winston';
import { LoggerConfig } from '../types';

export class Logger {
  private logger: winston.Logger;

  constructor(context: string, config?: LoggerConfig) {
    const defaultConfig: LoggerConfig = {
      level: 'info',
      format: 'text'
    };

    const finalConfig = { ...defaultConfig, ...config };

    this.logger = winston.createLogger({
      level: finalConfig.level,
      format: finalConfig.format === 'json' 
        ? winston.format.json()
        : winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, ...meta }) => {
              return `${timestamp} [${context}] ${level}: ${message} ${
                Object.keys(meta).length ? JSON.stringify(meta) : ''
              }`;
            })
          ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ 
          filename: 'error.log', 
          level: 'error' 
        }),
        new winston.transports.File({ 
          filename: 'combined.log' 
        })
      ]
    });
  }

  public debug(message: string, meta?: any): void {
    this.logger.debug(message, meta);
  }

  public info(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }

  public warn(message: string, meta?: any): void {
    this.logger.warn(message, meta);
  }

  public error(message: string, error?: any): void {
    this.logger.error(message, {
      error: error instanceof Error 
        ? { 
            message: error.message,
            stack: error.stack,
            name: error.name
          }
        : error
    });
  }
} 