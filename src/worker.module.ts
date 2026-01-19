import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TranscoderModule } from './transcoder/transcoder.module';
import { QueueModule } from './queue/queue.module';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: 'host.docker.internal', // docker service name later
        port: 6379,
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
      },
    }),
    QueueModule,
    TranscoderModule,
  ],
})
export class WorkerModule {}
