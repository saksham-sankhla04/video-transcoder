import {
  BadRequestException,
  Controller,
  Get,
  MessageEvent,
  NotFoundException,
  Param,
  Post,
  Req,
  Sse,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { VideoUploadService } from './vu.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { VideoStatusService } from 'src/transcoder/video-status.service';
import { existsSync, mkdirSync } from 'fs';
import { Observable } from 'rxjs';
import type { Request } from 'express';

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

  @Sse('videos/:id/events')
  async streamStatus(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<Observable<MessageEvent>> {
    const status = await this.videoStatus.get(id);

    if (!status) {
      throw new NotFoundException('Video not found');
    }

    return new Observable<MessageEvent>((subscriber) => {
      subscriber.next({ data: status });

      let unsubscribe: (() => Promise<void>) | null = null;

      const teardown = async () => {
        req.off('close', handleClose);

        if (unsubscribe) {
          await unsubscribe();
          unsubscribe = null;
        }
      };

      const handleClose = () => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        teardown();
      };

      req.on('close', handleClose);

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.videoStatus
        .subscribe(id, (payload) => {
          subscriber.next({ data: payload });

          if (payload?.status === 'completed' || payload?.status === 'failed') {
            subscriber.complete();
          }
        })
        .then((cleanup) => {
          unsubscribe = cleanup;
        })
        .catch((error: unknown) => {
          subscriber.error(error);
        });

      return () => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        teardown();
      };
    });
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('video', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = './uploads';
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
