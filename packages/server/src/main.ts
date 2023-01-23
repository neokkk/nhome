import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import address from 'address';
import { resolve } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );

  app.useStaticAssets({
    root: resolve(process.cwd(), 'src', 'assets'),
  });

  app.setViewEngine({
    engine: {
      handlebars: require('handlebars'),
    },
    templates: './src/views',
  });

  await app.listen(30000, '0.0.0.0', (_, port) => {
    Logger.log('================================================');
    Logger.log(`  Server is listening on ${port}!`);
    Logger.log(`  Current IP is: ${address.ip()}`);
    Logger.log('================================================');
  });
}
bootstrap();
