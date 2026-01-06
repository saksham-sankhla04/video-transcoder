import { Injectable } from '@nestjs/common';
import path from 'path';
import { TranscoderService } from 'src/transcoder/transcoder.service';

@Injectable()
export class vidoUploadService {
  constructor(private readonly transcoder: TranscoderService) {}
  async uploadVideo(video: Express.Multer.File) {
    console.log(video);
    const videoId = path.parse(video.filename).name;
    //1) Use FFmpeg to convert the file into three different formats
    await this.transcoder.transCode720(video.path, videoId);

    return {
      videoId,
      status: 'transcoding completed',
      outputs: ['1080p', '720p', '480p'],
    };
  }
}
