import { Controller, Get, Logger, Render } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('index.hbs')
  index() {
    Logger.log('index.hbs is requested');
    return this.appService.getDHT11Info();
  }
}
