import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RouterModule } from '@nestjs/core';
import { CommonModule } from './common/common.module';
import { NodeModule } from './entities/node/node.module';

@Module({
  imports: [
    CommonModule,
    ConfigModule,
    NodeModule,
    RouterModule.register([
      {
        path: '/',
        module: NodeModule,
      },
    ]),
  ],
})
export class AppModule {}
