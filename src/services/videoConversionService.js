import ffmpeg from "fluent-ffmpeg";

export function convertVideoToWav(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .output(outputPath)
            .withAudioCodec('pcm_s16le')
            .audioFrequency(44100)
            .audioChannels(2)
            .toFormat('wav')
            .on('end', () => resolve(outputPath))
            .on('error', (err) => reject(err))
            .run();
    });
}
