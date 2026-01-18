import { Module } from '@nestjs/common';
import { videoController } from './vu.controller';
import { VideoUploadService } from './vu.service';
import { BullModule } from '@nestjs/bullmq';
import { TranscoderModule } from 'src/transcoder/transcoder.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'video-transcode',
    }),
    TranscoderModule,
  ],
  controllers: [videoController],
  providers: [VideoUploadService],
})
export class videoUploadModule {}
