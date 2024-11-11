import { parentPort } from 'worker_threads';
import { initWhisper } from 'whisper-onnx-speech-to-text';

let whisper = null;

// Initialize Whisper only once
(async () => {
    whisper = await initWhisper("tiny.en");
    console.log("Whisper initialized in worker thread");
})();

// Listen for transcription tasks from the main thread
parentPort.on('message', async (filePath) => {
    try {
        if (!whisper) {
            throw new Error("Whisper is not initialized");
        }

        const transcript = await whisper.transcribe(filePath);
        parentPort.postMessage({ status: 'done', transcript: transcript.chunks });
    } catch (error) {
        parentPort.postMessage({ status: 'error', error: error.message });
    }
});
