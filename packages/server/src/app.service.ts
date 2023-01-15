import { Injectable } from '@nestjs/common';
import { FileService } from './common/services/file.service';

@Injectable()
export class AppService {
  constructor(private readonly fileService: FileService) {}

  async getDHT11Info() {
    const lastLine = await this.fileService.getLastLine(
      './lib/dht11/dht11.log',
    );
    const [, status, humidity, temperature] = lastLine
      .replaceAll('\n', '')
      .split(' ');

    if (status === 'error') return null;
    return { humidity, temperature };
  }
}
