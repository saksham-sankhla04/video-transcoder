import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import path from 'path';
import { VideoStatusService } from 'src/transcoder/video-status.service';

@Injectable()
export class VideoUploadService {
  constructor(
    @InjectQueue('video-transcode') private readonly queue: Queue,
    private readonly videoStatus: VideoStatusService,
  ) {}
  async uploadVideo(video: Express.Multer.File) {
    console.log(video);
    const videoId = path.parse(video.filename).name;

    //1) Use FFmpeg to convert the file into three different formats
    await this.videoStatus.set(videoId, { status: 'queued' });

    // Normalize path for Docker: data\uploads\file.mp4 -> /data/uploads/file.mp4
    const normalizedPath = '/' + video.path.replace(/\\/g, '/');

    await this.queue.add(
      'transcode',
      {
        inputPath: normalizedPath,
        videoId,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 3000,
        },
      },
    );

    return {
      videoId,
      status: 'processing',
    };
  }
}
