import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TranscoderModule } from 'src/transcoder/transcoder.module';
import { TranscodeProcessor } from './transcode.processor';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'video-transcode' }),
    TranscoderModule,
  ],
  providers: [TranscodeProcessor],
})
export class QueueWorkerModule {}
