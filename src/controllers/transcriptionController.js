import { convertVideoToWav } from "../services/videoConversionService.js";
import { transcribeAudio } from "../services/transcriptionService.js";
import{ storage } from "../middlewares/multer.js"
import { queRequest } from "../services/transcriptionService.js";

const transcripts = {};

export async function uploadVideo(req, res) {
    if (!req.file) {
        return res.status(400).send("No files were uploaded.");
    }


    //Define input and output paths
    const inputVideoPath = req.file.path;
    const outputAudioPath = 'public/uploads/' + req.file.filename.split(".")[0] + 'wav';
    const transcriptId = req.body.tab_id;

    //console.log("Received file for transcript ID:", transcriptId);

    //Set status of the current transcript to processing
    transcripts[transcriptId] = {status: 'processing'};

    try {
        res.send({transcriptId});
        
        await convertVideoToWav(inputVideoPath, outputAudioPath);

        queRequest(outputAudioPath, (error, transcriptChunks) => {
            if(error){
                return req.status(500).send({error: error.message});
            }

            transcripts[transcriptId] = {status: 'done', transcript: transcriptChunks};
        })


    }catch(error) {
        transcripts[transcriptId] = {status: 'error', error: error.message};
        res.status(500).send({error: error.message});
    }
}

export function getTranscriptStatus(req, res) {
    const transcriptId = req.params.id;

    if (!transcripts[transcriptId]){
        return res.status(404).send(`Transcript not found`);
    }else{
        //console.log(transcripts[transcriptId]);
        res.send(transcripts[transcriptId]);
    }
}
