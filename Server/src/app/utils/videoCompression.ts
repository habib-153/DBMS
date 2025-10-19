import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const unlinkAsync = promisify(fs.unlink);

interface CompressVideoOptions {
  inputPath: string;
  maxSizeMB?: number;
  maxDurationSeconds?: number;
}

export const compressVideo = async ({
  inputPath,
  maxSizeMB = 10,
  maxDurationSeconds = 60,
}: CompressVideoOptions): Promise<string> => {
  return new Promise((resolve, reject) => {
    const outputPath = path.join(
      path.dirname(inputPath),
      `compressed_${Date.now()}_${path.basename(inputPath)}`
    );

    // Get video metadata first
    ffmpeg.ffprobe(inputPath, (err, metadata) => {
      if (err) {
        reject(new Error(`Failed to read video metadata: ${err.message}`));
        return;
      }

      const duration = metadata.format.duration || 0;
      const fileSize = metadata.format.size || 0;
      const fileSizeMB = fileSize / (1024 * 1024);

      // If video is already within limits, return original
      if (fileSizeMB <= maxSizeMB && duration <= maxDurationSeconds) {
        resolve(inputPath);
        return;
      }

      // Calculate target bitrate to achieve desired file size
      const targetSizeBits = maxSizeMB * 8 * 1024 * 1024;
      const targetDuration = Math.min(duration, maxDurationSeconds);
      const targetVideoBitrate = Math.floor(
        (targetSizeBits * 0.9) / targetDuration
      ); // 90% for video
      const targetAudioBitrate = '64k';

      let command = ffmpeg(inputPath)
        .outputOptions([
          '-c:v libx264', // H.264 codec
          '-preset medium', // Balance between speed and compression
          `-b:v ${targetVideoBitrate}`, // Target video bitrate
          '-maxrate ' + targetVideoBitrate,
          '-bufsize ' + targetVideoBitrate * 2,
          '-c:a aac', // AAC audio codec
          `-b:a ${targetAudioBitrate}`, // Audio bitrate
          '-movflags +faststart', // Enable streaming
          '-pix_fmt yuv420p', // Compatibility
        ])
        .format('mp4');

      // Trim if duration exceeds limit
      if (duration > maxDurationSeconds) {
        command = command.duration(maxDurationSeconds);
      }

      command
        .output(outputPath)
        .on('end', () => {
          // Check output file size
          const stats = fs.statSync(outputPath);
          const outputSizeMB = stats.size / (1024 * 1024);

          if (outputSizeMB > maxSizeMB) {
            // If still too large, try again with lower bitrate
            unlinkAsync(outputPath)
              .then(() => {
                reject(
                  new Error(
                    `Compressed video (${outputSizeMB.toFixed(
                      2
                    )}MB) still exceeds ${maxSizeMB}MB limit. Please use a shorter video.`
                  )
                );
              })
              .catch(reject);
          } else {
            resolve(outputPath);
          }
        })
        .on('error', (err) => {
          reject(new Error(`Video compression failed: ${err.message}`));
        })
        .run();
    });
  });
};

export const cleanupTempFile = async (filePath: string): Promise<void> => {
  try {
    if (fs.existsSync(filePath)) {
      await unlinkAsync(filePath);
    }
  } catch (error) {
    console.error(`Failed to cleanup temp file ${filePath}:`, error);
  }
};
