import { Module } from '@nestjs/common';
import { TranscoderService } from './transcoder.service';
import { VideoStatusService } from './video-status.service';

@Module({
  providers: [TranscoderService, VideoStatusService],
  exports: [TranscoderService, VideoStatusService],
})
export class TranscoderModule {}
