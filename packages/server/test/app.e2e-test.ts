import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { FileService } from '../src/common/services/file.service';

describe('AppController', () => {
  let app: NestFastifyApplication;
  const mockedFileService = {
    getLatestFileName: jest.fn().mockImplementation(() => '20220124.log'),
    getLastLine: jest
      .fn()
      .mockImplementation(() => '2023-01-24T21:10:46 success 41.0 20.3'),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(FileService)
      .useValue(mockedFileService)
      .compile();

    app = moduleRef.createNestApplication(new FastifyAdapter());

    app.setViewEngine({
      engine: {
        handlebars: require('handlebars'),
      },
      templates: './src/views',
    });

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(() => {
    app.close();
  });

  describe('GET /', () => {
    it('render html with dht-11 information', async () => {
      const { body } = await app.inject({
        method: 'GET',
        url: '/',
      });

      expect(body).toEqual(expect.stringContaining('2023-01-24 21:10:46'));
      expect(body).toEqual(expect.stringContaining('Humidity: 41.0%'));
      expect(body).toEqual(expect.stringContaining('Temperature: 20.3°C'));
    });
  });
});
