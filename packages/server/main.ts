import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { WsAdapter } from '@nestjs/platform-ws';
import address from 'address';
import fs from 'fs';
import hbs from 'hbs';
import { resolve } from 'path';
import { AppModule } from './src/app.module';

const bootstrap = async () => {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
    // new FastifyAdapter({ https: httpsOptions, logger: true }),
  );
  // const httpsOptions = {
  //   key: fs.readFileSync('private.key'),
  //   cert: fs.readFileSync('private.crt'),
  // };

  app.useStaticAssets({
    root: resolve(process.cwd(), 'src', 'assets'),
  });
  app.setViewEngine({
    engine: {
      handlebars: hbs,
    },
    templates: './src/views',
  });

  hbs.registerPartials(resolve(process.cwd(), './src', 'views', 'partials'));

  app.listen(30000, '0.0.0.0', (_, addr) => {
    Logger.log('================================================');
    Logger.log(`  Server is listening on ${addr}!`);
    Logger.log(`  Current IP is: ${address.ip()}`);
    Logger.log('================================================');
  });
};

bootstrap();
