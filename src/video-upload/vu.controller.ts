import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { VideoUploadService } from './vu.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { VideoStatusService } from 'src/transcoder/video-status.service';
import { existsSync, mkdirSync } from 'fs';

@Controller('upload')
export class videoController {
  constructor(
    private readonly uploadService: VideoUploadService,
    private readonly videoStatus: VideoStatusService,
  ) {}

  @Get('videos/:id/status')
  async getStatus(@Param('id') id: string) {
    const status = await this.videoStatus.get(id);

    if (!status) {
      throw new NotFoundException('Video not found');
    }

    return status;
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('video', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = './data/uploads';
          if (!existsSync(uploadPath)) {
            // This creates the folder inside the container
            // which syncs to your host via the -v volume
            mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
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
  upload(@UploadedFile() video: Express.Multer.File) {
    if (!video) throw new BadRequestException('Video file is required');
    return this.uploadService.uploadVideo(video);
  }
}
