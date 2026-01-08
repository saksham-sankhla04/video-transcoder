import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import path from 'path';

@Injectable()
export class vidoUploadService {
  constructor(@InjectQueue('video-transcode') private readonly queue: Queue) {}
  async uploadVideo(video: Express.Multer.File) {
    console.log(video);
    const videoId = path.parse(video.filename).name;

    //1) Use FFmpeg to convert the file into three different formats
    // await this.transcoder.transCodeAll(video.path, videoId);

    await this.queue.add('transcode', {
      inputPath: video.path,
      videoId,
    });

    return {
      videoId,
      status: 'processing',
    };
  }
}
