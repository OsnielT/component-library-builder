/**
 * Infrastructure Layer - File System Utilities
 */

import * as fs from 'fs/promises';
import * as path from 'path';

export interface IFileSystem {
  readFile(filePath: string): Promise<string>;
  writeFile(filePath: string, content: string): Promise<void>;
  exists(filePath: string): Promise<boolean>;
  deleteFile(filePath: string): Promise<void>;
  ensureDir(dirPath: string): Promise<void>;
}

export class FileSystem implements IFileSystem {
  async readFile(filePath: string): Promise<string> {
    return fs.readFile(filePath, 'utf-8');
  }

  async writeFile(filePath: string, content: string): Promise<void> {
    await this.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, content, 'utf-8');
  }

  async exists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    await fs.unlink(filePath);
  }

  async ensureDir(dirPath: string): Promise<void> {
    await fs.mkdir(dirPath, { recursive: true });
  }
}
