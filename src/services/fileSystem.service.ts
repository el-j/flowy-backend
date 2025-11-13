import { promises as fs } from 'fs';
import path from 'path';
import { logger } from '../utils/logger.js';
import { AppError } from '../middleware/errorHandler.js';

export class FileSystemService {
  /**
   * Read directory contents
   */
  async readDirectory(dirPath: string): Promise<string[]> {
    try {
      const files = await fs.readdir(dirPath);
      return files.filter((file) => file !== '.DS_Store');
    } catch (error) {
      logger.error(`Failed to read directory: ${dirPath}`, error);
      throw new AppError(`Failed to read directory: ${dirPath}`, 500);
    }
  }

  /**
   * Create directory recursively
   */
  async createDirectory(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
      logger.info(`Directory created: ${dirPath}`);
    } catch (error) {
      logger.error(`Failed to create directory: ${dirPath}`, error);
      throw new AppError(`Failed to create directory: ${dirPath}`, 500);
    }
  }

  /**
   * Remove directory recursively
   */
  async removeDirectory(dirPath: string): Promise<void> {
    try {
      await fs.rm(dirPath, { recursive: true, force: true });
      logger.info(`Directory removed: ${dirPath}`);
    } catch (error) {
      logger.error(`Failed to remove directory: ${dirPath}`, error);
      throw new AppError(`Failed to remove directory: ${dirPath}`, 500);
    }
  }

  /**
   * Read file content
   */
  async readFile(filePath: string): Promise<string> {
    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch (error) {
      logger.error(`Failed to read file: ${filePath}`, error);
      throw new AppError(`Failed to read file: ${filePath}`, 404);
    }
  }

  /**
   * Write file content
   */
  async writeFile(filePath: string, content: string): Promise<void> {
    try {
      await fs.writeFile(filePath, content, 'utf-8');
      logger.info(`File written: ${filePath}`);
    } catch (error) {
      logger.error(`Failed to write file: ${filePath}`, error);
      throw new AppError(`Failed to write file: ${filePath}`, 500);
    }
  }

  /**
   * Check if path exists
   */
  async exists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get file stats
   */
  async getStats(filePath: string) {
    try {
      return await fs.stat(filePath);
    } catch (error) {
      logger.error(`Failed to get stats for: ${filePath}`, error);
      throw new AppError(`Failed to get stats for: ${filePath}`, 404);
    }
  }

  /**
   * Get file extension
   */
  getFileExtension(filename: string): string {
    return path.extname(filename).slice(1);
  }

  /**
   * Get filename without extension
   */
  getFilenameWithoutExtension(filename: string): string {
    return path.basename(filename, path.extname(filename));
  }
}
