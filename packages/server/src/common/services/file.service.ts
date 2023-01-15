import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import { createReadStream } from 'fs';
import { resolve } from 'path';

@Injectable()
export class FileService {
  async getFile(path: string) {
    const resolvedPath = resolve(process.cwd(), path);
    const file = createReadStream(resolvedPath, { encoding: 'utf-8' });
    let result = '';

    for await (const chunk of file) {
      result += chunk;
    }

    return result;
  }

  getLastLine(path: string): Promise<string> {
    const resolvedPath = resolve(process.cwd(), path);

    return new Promise((resolve, reject) => {
      exec(`tail -1 ${resolvedPath}`, (_, output, error) => {
        if (error) reject(error);
        else resolve(output);
      });
    });
  }
}
