import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );

  app.useStaticAssets({
    root: join(process.cwd(), 'log'),
  });

  app.setViewEngine({
    engine: {
      handlebars: require('handlebars'),
    },
    templates: './src/views',
  });

  await app.listen(30000);
}
bootstrap();
