import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import { createReadStream } from 'fs';
import { resolve } from 'path';
import readline from 'readline';

@Injectable()
export class FileService {
  getFileReadline(path: string) {
    const resolvedPath = resolve(process.cwd(), path).trim();
    const fileStream = createReadStream(resolvedPath, { encoding: 'utf-8' });

    return readline.createInterface({
      input: fileStream,
    });
  }

  getLatestFileName(directoryPath: string, offset = 0): Promise<string> {
    const resolvedPath = resolve(process.cwd(), directoryPath).trim();

    return new Promise((resolve, reject) => {
      exec(
        `ls -t ${resolvedPath} | head -${1 + offset} | tail -1`,
        (_, output, error) => {
          if (error) reject(error);
          else resolve(output);
        },
      );
    });
  }

  getLastLine(path: string, offset = 0): Promise<string> {
    const resolvedPath = resolve(process.cwd(), path).trim();

    return new Promise((resolve, reject) => {
      exec(
        `tail -${1 + offset} ${resolvedPath} | head -1`,
        (_, output, error) => {
          if (error) return reject(error);
          else resolve(output);
        },
      );
    });
  }
}
