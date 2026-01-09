import { Module } from '@nestjs/common';
import { videoController } from './vu.controller';
import { vidoUploadService } from './vu.service';
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
  providers: [vidoUploadService],
})
export class videoUploadModule {}
