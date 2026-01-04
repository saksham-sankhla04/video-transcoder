import {
  BadRequestException,
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
  constructor(private readonly uploadService: vidoUploadService) {}

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
      fileFilter: (_, file, cb) => {
        if (!file.mimetype.startsWith('video/')) {
          return cb(
            new BadRequestException('Only Video files are allowed'),
            false,
          );
        }

        cb(null, true);
      },
      limits: {
        fileSize: 500 * 1024 * 1024, // 500 MB
      },
    }),
  )
  async upload(@UploadedFile() video: Express.Multer.File) {
    if (!video) throw new BadRequestException('Video file is required');
    return this.uploadService.uploadVideo(video);
  }
}
