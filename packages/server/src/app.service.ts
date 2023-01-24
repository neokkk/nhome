import { Injectable } from '@nestjs/common';
import { FileService } from './common/services/file.service';

const LOG_PATH = '../log/dht11';

@Injectable()
export class AppService {
  constructor(private readonly fileService: FileService) {}

  async getDHT11Info() {
    try {
      const latestFileName = await this.fileService.getLatestFileName(LOG_PATH);

      let offset = 0;
      let line = await this.fileService.getLastLine(
        `${LOG_PATH}/${latestFileName}`,
        offset,
      );

      while (this.#hasError(line)) {
        ++offset;
        line = await this.fileService.getLastLine(
          `${LOG_PATH}/${latestFileName}`,
          offset,
        );
      }

      const [datetime, , humidity, temperature] = line
        .replaceAll('\n', '')
        .split(' ');

      return { datetime, humidity, temperature };
    } catch (error) {
      console.log('error');
      console.log(error);

      return {};
    }
  }

  #hasError(message: string) {
    return !message || message.includes('error');
  }
}
