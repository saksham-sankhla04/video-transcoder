import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { videoUploadModule } from './video-upload/vu.module';
import { TranscoderService } from './transcoder/transcoder.service';
import { TranscoderModule } from './transcoder/transcoder.module';

@Module({
  imports: [videoUploadModule, TranscoderModule],
  controllers: [AppController],
  providers: [AppService, TranscoderService],
})
export class AppModule {}
