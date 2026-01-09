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

    this.videoStatus.set(videoId, { status: 'processing' });
    console.log(`Processing job ${job.id} for video ${videoId}`);

    await this.transcoder.transCodeAll(inputPath, videoId);

    this.videoStatus.set(videoId, { status: 'completed' });
    console.log(`Completed job ${job.id}`);
  }
}
