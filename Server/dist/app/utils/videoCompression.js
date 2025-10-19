"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupTempFile = exports.compressVideo = void 0;
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const util_1 = require("util");
const unlinkAsync = (0, util_1.promisify)(fs_1.default.unlink);
const compressVideo = (_a) => __awaiter(void 0, [_a], void 0, function* ({ inputPath, maxSizeMB = 10, maxDurationSeconds = 60, }) {
    return new Promise((resolve, reject) => {
        const outputPath = path_1.default.join(path_1.default.dirname(inputPath), `compressed_${Date.now()}_${path_1.default.basename(inputPath)}`);
        // Get video metadata first
        fluent_ffmpeg_1.default.ffprobe(inputPath, (err, metadata) => {
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
            const targetVideoBitrate = Math.floor((targetSizeBits * 0.9) / targetDuration); // 90% for video
            const targetAudioBitrate = '64k';
            let command = (0, fluent_ffmpeg_1.default)(inputPath)
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
                const stats = fs_1.default.statSync(outputPath);
                const outputSizeMB = stats.size / (1024 * 1024);
                if (outputSizeMB > maxSizeMB) {
                    // If still too large, try again with lower bitrate
                    unlinkAsync(outputPath)
                        .then(() => {
                        reject(new Error(`Compressed video (${outputSizeMB.toFixed(2)}MB) still exceeds ${maxSizeMB}MB limit. Please use a shorter video.`));
                    })
                        .catch(reject);
                }
                else {
                    resolve(outputPath);
                }
            })
                .on('error', (err) => {
                reject(new Error(`Video compression failed: ${err.message}`));
            })
                .run();
        });
    });
});
exports.compressVideo = compressVideo;
const cleanupTempFile = (filePath) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (fs_1.default.existsSync(filePath)) {
            yield unlinkAsync(filePath);
        }
    }
    catch (error) {
        console.error(`Failed to cleanup temp file ${filePath}:`, error);
    }
});
exports.cleanupTempFile = cleanupTempFile;
