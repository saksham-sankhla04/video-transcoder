import { Module } from '@nestjs/common';
import { videoController } from './vu.controller';
import { vidoUploadService } from './vu.service';
import { TranscoderModule } from 'src/transcoder/transcoder.module';

@Module({
  imports: [TranscoderModule],
  controllers: [videoController],
  providers: [vidoUploadService],
})
export class videoUploadModule {}
