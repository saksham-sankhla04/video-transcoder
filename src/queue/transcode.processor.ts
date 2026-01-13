import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { TranscoderService } from 'src/transcoder/transcoder.service';
import { VideoStatusService } from 'src/transcoder/video-status.service';
import * as fs from 'fs';

interface VideoJobData {
  inputPath: string;
  videoId: string;
}
@Processor('video-transcode')
export class TranscodeProcessor extends WorkerHost {
  constructor(
    private readonly transcoder: TranscoderService,
    private readonly videoStatus: VideoStatusService,
  ) {
    super();
  }

  async process(job: Job<VideoJobData>) {
    const { inputPath, videoId } = job.data;

    try {
      if (!fs.existsSync(inputPath)) {
        throw new Error('Input file not found');
      }
      //Setting The State to processing
      this.videoStatus.set(videoId, { status: 'processing', progress: 0 });
      console.log('Video is processing');

      //Transcoding All Videos
      await this.transcoder.transCodeAll(inputPath, videoId);

      //Setting the state to completed
      console.log('Videos Are transcoded');
      this.videoStatus.set(videoId, {
        status: 'completed',
        progress: 100,
        outputs: {
          thumbnail: `/outputs/${videoId}/thumbnail.jpg`,
          '480p': `/outputs/${videoId}/480p.mp4`,
          '720p': `/outputs/${videoId}/720p.mp4`,
          '1080p': `/outputs/${videoId}/1080p.mp4`,
        },
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.videoStatus.set(videoId, {
        status: 'failed',
        error: errorMessage,
      });

      throw err;
    }
  }
}
