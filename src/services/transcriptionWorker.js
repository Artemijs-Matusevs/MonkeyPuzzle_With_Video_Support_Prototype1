import {parentPort, workerData} from 'worker_threads';
import { initWhisper } from 'whisper-onnx-speech-to-text';

(async () => {
    try{
        const whisper = await initWhisper("tiny.en");
        const transcript = await whisper.transcribe(workerData.filePath);
        parentPort.postMessage({status: 'done', transcript: transcript.chunks});
    }catch (error) {
        parentPort.postMessage({status: 'error', error: error.message});
    }
})();