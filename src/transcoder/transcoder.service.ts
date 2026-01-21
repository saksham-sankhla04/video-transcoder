import { Injectable } from '@nestjs/common';
import path from 'path';
import * as fs from 'fs';
import { runFFmpeg, validateVideo } from 'src/utils/ffmpeg.util';
import { VideoStatusService } from './video-status.service';

const RESOLUTIONS = [
  { label: '1080p', width: 1920 },
  { label: '720p', width: 1280 },
  { label: '480p', width: 854 },
];

const WEIGHTS = {
  thumbnail: 5,
  '1080p': 35,
  '720p': 30,
  '480p': 30,
};

@Injectable()
export class TranscoderService {
  constructor(private readonly videoStatus: VideoStatusService) {}

  async transCodeAll(inputPath: string, videoId: string) {
    const outputDir = path.join('/data/output', videoId);
    fs.mkdirSync(outputDir, { recursive: true });

    const duration = await validateVideo(inputPath);

    const thumbnailPath = path.join(outputDir, `thumbnail.jpg`);

    await generateThumnail(inputPath, thumbnailPath);

    let baseProgress: number = 5;

    for (const res of RESOLUTIONS) {
      const outputPath = path.join(outputDir, `${res.label}.mp4`);
      const weight: number = WEIGHTS[res.label];

      await runFFmpeg(
        [
          '-y',
          '-i',
          inputPath,

          '-vf',
          `scale=${res.width}:-2`,
          '-c:v',
          'libx264',
          '-preset',
          'fast',
          '-crf',
          '23',
          '-c:a',
          'aac',
          '-progress',
          'pipe:2',
          '-nostats',
          outputPath,
        ],
        (currentTime) => {
          const localProgress: number = Math.min(
            (currentTime / duration) * 100,
            100,
          );

          const progress: number = Math.min(
            Math.floor(baseProgress + (localProgress * weight) / 100),
            99,
          );

          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          this.videoStatus.set(videoId, {
            status: 'processing',
            progress,
          });
        },
      );
      baseProgress += weight;
    }
    return {
      videoId,
      resolutions: RESOLUTIONS.map((r) => r.label),
    };
  }
}

export const generateThumnail = async function (
  inputPath: string,
  thumbnailPath: string,
) {
  await runFFmpeg([
    '-i',
    inputPath,
    '-ss',
    '00:00:01',
    '-vframes',
    '1',
    thumbnailPath,
  ]);
};
