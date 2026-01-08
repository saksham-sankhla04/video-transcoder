import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { TranscoderService } from 'src/transcoder/transcoder.service';

@Processor('video-transcode')
export class TranscodeProcessor extends WorkerHost {
  constructor(private readonly transcoder: TranscoderService) {
    super();
  }

  async process(job: Job) {
    const { inputPath, videoId } = job.data;

    console.log(`Processing job ${job.id} for video ${videoId}`);

    await this.transcoder.transCodeAll(inputPath, videoId);

    console.log(`Completed job ${job.id}`);
  }
}
