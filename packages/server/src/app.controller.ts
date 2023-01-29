import { Controller, Get, Logger, Render, Req } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('index')
  index(@Req() req: FastifyRequest) {
    const { headers } = req;

    Logger.log('GET /');
    Logger.log(`Request host is ${headers['host']}`);
    Logger.log(`Request user agent is ${headers['user-agent']}`);

    return this.appService.getDHT11Info();
  }
}
