import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { videoUploadModule } from './video-upload/vu.module';
import { BullModule } from '@nestjs/bullmq';
import { QueueModule } from './queue/queue.module';
import { RedisModule } from '@nestjs-modules/ioredis';

@Module({
  imports: [
    RedisModule.forRoot({
      type: 'single',
      options: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: 6379,
      },
    }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: 6379,
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
      },
    }),
    videoUploadModule,
    QueueModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
