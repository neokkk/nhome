import { Controller, Get, Logger, Render, Req } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { MailService } from './common/services/mail.service';
import { SensorService } from './common/services/sensor.service';

@Controller()
export class AppController {
  constructor(
    private readonly sensorService: SensorService,
    private readonly mailService: MailService,
  ) {}

  @Get()
  @Render('index')
  async index(@Req() req: FastifyRequest) {
    const { headers } = req;

    Logger.log('GET /');
    Logger.log(`Request host is ${headers['host']}`);
    Logger.log(`Request user agent is ${headers['user-agent']}`);

    const dht11Info = await this.sensorService.getDHT11Info();
    if (!dht11Info) return;

    const { invalid, message } = dht11Info.isInvalid();
    if (invalid) {
      Logger.error(`Invalid Range Error ${message}`);
      // this.mailService.sendMail({
      //   template: 'warning',
      // });
    }
    return {
      dht11Info,
    };
  }
}
