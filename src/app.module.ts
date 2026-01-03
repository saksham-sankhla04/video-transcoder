import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { videoUploadModule } from './video-upload/vu.module';

@Module({
  imports: [videoUploadModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
