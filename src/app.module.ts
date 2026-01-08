import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { videoUploadModule } from './video-upload/vu.module';
import { TranscoderService } from './transcoder/transcoder.service';
import { TranscoderModule } from './transcoder/transcoder.module';
import { BullModule } from '@nestjs/bullmq';
import { QueueModule } from './queue/queue.module';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: '127.0.0.1',
        port: 6379,
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
      },
    }),
    videoUploadModule,
    TranscoderModule,
    QueueModule,
  ],
  controllers: [AppController],
  providers: [AppService, TranscoderService],
})
export class AppModule {}
