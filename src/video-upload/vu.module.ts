import { Module } from '@nestjs/common';
import { videoController } from './vu.controller';
import { vidoUploadService } from './vu.service';

@Module({
  imports: [],
  controllers: [videoController],
  providers: [vidoUploadService],
})
export class videoUploadModule {}
