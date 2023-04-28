import { Injectable } from '@nestjs/common';
import { DHT11 } from '../../entities/sensor/dht11.entity';
import { FileService } from './file.service';

const LOG_PATH = '/var/log/dht11';

@Injectable()
export class SensorService {
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

      return new DHT11({
        datetime: datetime.replaceAll('T', ' '),
        humidity,
        temperature,
      });
    } catch (error) {
      console.log('error');
      console.log(error);

      return null;
    }
  }

  #hasError(message: string) {
    return !message || message.includes('error');
  }
}
