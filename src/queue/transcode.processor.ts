import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { TranscoderService } from 'src/transcoder/transcoder.service';
import { VideoStatusService } from 'src/transcoder/video-status.service';

@Processor('video-transcode')
export class TranscodeProcessor extends WorkerHost {
  constructor(
    private readonly transcoder: TranscoderService,
    private readonly videoStatus: VideoStatusService,
  ) {
    super();
  }

  async process(job: Job) {
    const { inputPath, videoId } = job.data;

    try {
      //Setting The State to processing
      this.videoStatus.set(videoId, { status: 'processing' });
      console.log('Video is processing');

      //Transcoding All Videos
      await this.transcoder.transCodeAll(inputPath, videoId);

      //Setting the state to completed
      console.log('Videos Are transcoded');
      this.videoStatus.set(videoId, {
        status: 'completed',
        outputs: {
          thumbnail: `/outputs/${videoId}/thumbnail.jpg`,
          '480p': `/outputs/${videoId}/480p.mp4`,
          '720p': `/outputs/${videoId}/720p.mp4`,
          '1080p': `/outputs/${videoId}/1080p.mp4`,
        },
      });
    } catch (err) {
      this.videoStatus.set(videoId, {
        status: 'failed',
        error: err.message,
      });

      throw err;
    }
  }
}
