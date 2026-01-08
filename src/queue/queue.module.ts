import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TranscoderService } from 'src/transcoder/transcoder.service';
import { TranscodeProcessor } from './transcode.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'video-transcode',
    }),
  ],
  providers: [TranscoderService, TranscodeProcessor],
})
export class QueueModule {}
