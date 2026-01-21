import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TranscoderModule } from './transcoder/transcoder.module';
import { QueueWorkerModule } from './queue/queue-worker.module';
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
    QueueWorkerModule,
    TranscoderModule,
  ],
})
export class WorkerModule {}
