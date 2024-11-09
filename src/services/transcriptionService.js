import {Worker} from 'worker_threads';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export async function transcribeAudio(filePath) {
    return new Promise((resolve, reject) => {
        const worker = new Worker(path.resolve(__dirname, 'transcriptionWorker.js'), {
            workerData: {filePath}
        });

        worker.on('message', (result) => {
            if (result.status === 'done') {
                resolve(result.transcript);
            }else {
                reject(new Error(result.error));
            }
        });

        worker.on('error', reject);
        worker.on('exit', (code) => {
            if (code !== 0)
                reject(new Error('Worker stopped'));
        })
    })
}