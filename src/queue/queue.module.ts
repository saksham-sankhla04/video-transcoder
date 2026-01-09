import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TranscodeProcessor } from './transcode.processor';
import { TranscoderModule } from 'src/transcoder/transcoder.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'video-transcode',
    }),
    TranscoderModule,
  ],
  providers: [TranscodeProcessor],
})
export class QueueModule {}
