import { Injectable } from '@nestjs/common';

export type VideoJobStatus = 'queued' | 'processing' | 'completed' | 'failed';

@Injectable()
export class VideoStatusService {
  private readonly store = new Map<
    string,
    {
      status: VideoJobStatus;
      progress?: number;
      outputs?: Record<string, string>;
      error?: string;
    }
  >();

  set(
    videoId: string,
    data: {
      status: VideoJobStatus;
      progress?: number;
      outputs?: Record<string, string>;
      error?: string;
    },
  ) {
    return this.store.set(videoId, data);
  }

  get(videoId: string) {
    return this.store.get(videoId) ?? { status: 'queued' };
  }
}
