import { Injectable } from '@nestjs/common';
import { FileService } from './common/services/file.service';

@Injectable()
export class AppService {
  constructor(private readonly fileService: FileService) {}

  async getDHT11Info() {
    const latestFileName = await this.fileService.getLatestFileName('./log');

    let offset = 0;
    let line = await this.fileService.getLastLine(
      `./log/${latestFileName}`,
      offset,
    );

    // prettier-ignore
    while (this.#hasError(line)) {
      ++offset;
      line = await this.fileService.getLastLine(
        `./log/${latestFileName}`,
        offset,
      );
    }

    const [datetime, , humidity, temperature] = line
      .replaceAll('\n', '')
      .split(' ');

    return { datetime, humidity, temperature };
  }

  #hasError(message: string) {
    return !message || message.includes('error');
  }
}
