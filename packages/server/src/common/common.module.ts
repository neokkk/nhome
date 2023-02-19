import { Module } from '@nestjs/common';
import { MailModule } from './modules/mail.module';
import { FileService } from './services/file.service';
import { SensorService } from './services/sensor.service';

@Module({
  exports: [FileService, MailModule, SensorService],
  imports: [MailModule],
  providers: [FileService, SensorService],
})
export class CommonModule {}
