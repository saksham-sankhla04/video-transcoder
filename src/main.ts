import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import path from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(path.join(process.cwd(), 'outputs'), {
    prefix: '/outputs',
  });

  console.log(`App Running on port ${process.env.PORT ?? 3000}`);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
