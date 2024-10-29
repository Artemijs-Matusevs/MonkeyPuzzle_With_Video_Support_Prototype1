import { convertVideoToWav } from "../services/videoConversionService.js";
import { transcribeAudio } from "../services/transcriptionService.js";
import{ storage } from "../middlewares/multer.js"

const transcripts = {};

export async function uploadVideo(req, res) {
    if (!req.file) {
        return res.status(400).send("No files were uploaded.");
    }


    //Define input and output paths
    const inputVideoPath = req.file.path;
    const outputAudioPath = 'public/uploads/' + req.file.filename.split(".")[0] + 'wav';
    const transcriptId = req.body.tab_id;

    //Set status of the current transcript to processing
    transcripts[transcriptId] = {status: 'processing'};

    convertVideoToWav(inputVideoPath, outputAudioPath)
    .then(async () => {
        const transcript = await transcribeAudio(outputAudioPath);
        transcripts[transcriptId] = {status: 'done', transcript: transcript.chunks};
        console.log(transcript.chunks);
    })
    .catch((error) => {
        transcripts[transcriptId] = {status: 'error', error: error.message}
    });

    res.send({transcriptId});
}

export function getTranscriptStatus(req, res) {
    const transcriptId = req.params.id;

    if (!transcripts[transcriptId]){
        return res.status(404).send(`Transcript not found`);
    }else{
        console.log(transcripts[transcriptId]);
        res.send(transcripts[transcriptId]);
    }
}
