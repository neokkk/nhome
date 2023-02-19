import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import address from 'address';
import fs from 'fs';
import { resolve } from 'path';
import { AppModule } from './src/app.module';

async function bootstrap() {
  const httpsOptions = {
    key: fs.readFileSync('private.key'),
    cert: fs.readFileSync('private.crt'),
  };
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ https: httpsOptions, logger: true }),
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

  await app.listen(30000, '0.0.0.0', (_, addr) => {
    Logger.log('================================================');
    Logger.log(`  Server is listening on ${addr}!`);
    Logger.log(`  Current IP is: ${address.ip()}`);
    Logger.log('================================================');
  });
}

bootstrap();
