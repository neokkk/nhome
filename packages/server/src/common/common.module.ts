import { Module } from '@nestjs/common';
import { FileService } from './services/file.service';

@Module({
  exports: [FileService],
  providers: [FileService],
})
export class CommonModule {}
