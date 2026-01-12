import { Injectable } from '@nestjs/common';
import path from 'path';
import * as fs from 'fs';
import { runFFmpeg } from 'src/utils/ffmpeg.util';

const RESOLUTIONS = [
  { label: '1080p', width: 1920 },
  { label: '720p', width: 1280 },
  { label: '480p', width: 854 },
];

@Injectable()
export class TranscoderService {
  async transCodeAll(inputPath: string, videoId: string) {
    const outputDir = path.join('outputs', videoId);
    fs.mkdirSync(outputDir, { recursive: true });

    const thumbnailPath = path.join(outputDir, `thumbnail.jpg`);

    await generateThumnail(inputPath, thumbnailPath);

    for (const res of RESOLUTIONS) {
      const outputPath = path.join(outputDir, `${res.label}.mp4`);

      await runFFmpeg([
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
        outputPath,
      ]);
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
