import {Worker} from 'worker_threads';
import { fileURLToPath } from 'url';
import path from 'path';
import { initWhisper } from 'whisper-onnx-speech-to-text';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let whisper = null;
let que = [];
let isWorking = false;

const whisperWorker = new Worker(path.resolve(__dirname, 'transcriptionWorker.js'));

export async function queRequest(inputFile, callback) {
    que.push({inputFile, callback});
    processQue();
}

async function processQue() {
    if (isWorking || que.length === 0) return;

    isWorking = true;

    const {inputFile, callback} = que.shift();

    try{
        const transcriptChunks = await transcribeAudio(inputFile);
        callback(null, transcriptChunks);
    }catch (error) {
        callback(error);
    }finally {
        isWorking = false;
        processQue();
    }
}


export async function transcribeAudio(filePath) {
    return new Promise((resolve, reject) => {
        whisperWorker.once('message', (result) => {
            if (result.status === 'done') {
                resolve(result.transcript);
            } else {
                reject(new Error(result.error));
            }
        });

        whisperWorker.once('error', reject);
        whisperWorker.once('exit', (code) => {
            if (code !== 0) {
                reject(new Error(`Worker stopped with exit code ${code}`));
            }
        });

        // Send the transcription task to the worker
        whisperWorker.postMessage(filePath);
    });
}