import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'video-transcode',
    }),
  ],
  exports: [BullModule],
})
export class QueueModule {}
