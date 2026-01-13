import { spawn } from 'child_process';

export function runFFmpeg(
  args: string[],
  onProgress?: (currentTimeinSeconds: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', args);

    ffmpeg.stderr.on('data', (data) => {
      const lines = data.toString().trim().split('\n');

      for (const line of lines) {
        const [key, value] = line.split('=');

        const ms = Number(value);
        if (Number.isNaN(ms) || ms < 0) continue;

        if (key === 'out_time_ms' && onProgress) {
          const currentTime: number = Number(value) / 1_000_000;
          onProgress(currentTime);
        }
      }
    });

    ffmpeg.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg exited with code ${code}`));
    });

    ffmpeg.on('error', reject);
  });
}

export function validateVideo(inputPath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const ffprobe = spawn('ffprobe', [
      '-v',
      'error',
      '-show_entries',
      'format=duration',
      '-of',
      'default=noprint_wrappers=1:nokey=1',
      inputPath,
    ]);

    let output = '';

    ffprobe.stdout.on('data', (data) => {
      output += data.toString();
    });

    ffprobe.on('close', (code) => {
      if (code !== 0 || !output) {
        reject(new Error('Invalid or unsupported Video '));
      } else {
        resolve(parseFloat(output));
      }
    });

    ffprobe.on('error', reject);
  });
}
