import { Module } from '@nestjs/common';
import { videoController } from './vu.controller';
import { vidoUploadService } from './vu.service';
import { TranscoderModule } from 'src/transcoder/transcoder.module';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    TranscoderModule,
    BullModule.registerQueue({
      name: 'video-transcode',
    }),
  ],
  controllers: [videoController],
  providers: [vidoUploadService],
})
export class videoUploadModule {}
