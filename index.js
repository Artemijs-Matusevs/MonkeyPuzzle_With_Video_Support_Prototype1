import express from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { initWhisper } from "whisper-onnx-speech-to-text";
import multer from "multer";
import ffmpeg from "fluent-ffmpeg";
import bodyParser from "body-parser";

const whisper = await initWhisper("base.en");
const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

//Store status of each transcrtip
let transcripts = {};

//Body parser
app.use(bodyParser.urlencoded({ extended: true }));

//Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/')
    },
    filename: function (req, file, cb) {
        const videoId = req.body.tab_id || 'default'; // Access tab_id from the form
        const extension = file.originalname.split('.').pop();

        console.log(videoId);

        cb(null, videoId + "." + extension);
    }
});

const upload = multer({storage: storage});

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/Public/index.html") 
})

//Post video content
app.post("/upload-video", upload.single('video'), async function (req, res, next) {
    if (!req.file) {
        return res.status(400).send("No files were uploaded.");
    }

    //console.log(req.body.tab_id, req.file);

    storage.filename = function (req, file, cb) {
        const videoId = req.body.tab_id || 'default'; // Access tab_id from the form
        const extension = file.originalname.split('.').pop();

        console.log(videoId);

        cb(null, videoId + "." + extension);
    }

    //Define input and output paths
    const inputVideoPath = req.file.path;
    const outputAudioPath = 'public/uploads/' + req.file.filename.split(".")[0] + 'wav';
    const transcriptId = req.body.tab_id;

    //Set status of the current transcript to processing
    transcripts[transcriptId] = {status: 'processing'};

    convertVideoToWav(inputVideoPath, outputAudioPath)
        .then(async () => {
            const transcript = await whisper.transcribe(outputAudioPath);
            transcripts[transcriptId] = {status: `done`, transcript: transcript.chunks};
            console.log(transcript.chunks);
        })
        .catch((error) => {
            transcripts[transcriptId] = {status: `error`, error: error.message}
        });

    res.send({transcriptId});
})

//Check the status of the transcriptions
app.get(`/transcript-status/:id`, (req, res) => {
    const transcriptId = req.params.id;

    if (!transcripts[transcriptId]) {
        return res.status(404).send(`Transcript not found`);
    }else{
        //console.log(transcripts[transcriptId]);
        res.send(transcripts[transcriptId]);
    }
})

app.listen(3000, () => {
    console.log("Server running on port 3000.");
})


//Function to convert video to .wav
function convertVideoToWav(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .output(outputPath)
            .withAudioCodec('pcm_s16le')
            .audioFrequency(44100)
            .audioChannels(2)
            .toFormat('wav')
            .on('end', () => {
                console.log('Conversion finished ')
                resolve(outputPath);
            })
            .on('error', (err) => {
                console.error('Error:', err);
                reject(err);
            })
            .run();
    });
}

app.use(express.static("public"));