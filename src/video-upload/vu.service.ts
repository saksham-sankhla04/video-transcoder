import { Injectable } from '@nestjs/common';

@Injectable()
export class vidoUploadService {
  uploadVideo(video) {
    console.log(video);
    //1) Use FFmpeg to convert the file into three different formats

    //2) Store transcoded videos in video-transcoded folder

    return {
      status: 'Successfull',
      Message: 'Uploaded',
    };
  }
}
