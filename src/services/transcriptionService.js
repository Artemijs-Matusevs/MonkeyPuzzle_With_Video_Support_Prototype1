import { initWhisper } from "whisper-onnx-speech-to-text";

const whisper = await initWhisper("base.en");

export async function transcribeAudio(filePath) {
    return await whisper.transcribe(filePath);
}