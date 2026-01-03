import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { vidoUploadService } from './vu.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Controller('upload')
export class videoController {
  constructor(private uploadServic: vidoUploadService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('video', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now();
          const nameTab = file.originalname.split('.');
          const subArray = nameTab.slice(0, -1);
          const originalName = subArray.join('');
          const ext = `.${nameTab[nameTab.length - 1]}`;
          const filename = `${originalName}-${uniqueSuffix}${ext}`;
          cb(null, filename);
        },
      }),
    }),
  )
  async upload(@UploadedFile() video: Express.Multer.File) {
    return this.uploadServic.uploadVideo(video);
  }
}
