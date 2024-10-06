import express from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { initWhisper } from "whisper-onnx-speech-to-text";
import multer from "multer";
import ffmpeg from "fluent-ffmpeg";

const whisper = await initWhisper("base.en");
const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

//Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + '.' + file.originalname.split('.').pop());
    }
});

const upload = multer({storage: storage});

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/Public/index.html") 
})

//Post video content
app.post("/upload-video", upload.single('video'), async function (req, res) {
    if (!req.file) {
        return res.status(400).send("No files were uploaded.");
    }

    //Define input and output paths
    const inputVideoPath = req.file.path;
    const outputAudioPath = 'public/uploads/' + req.file.filename.split(".")[0] + 'wav';

    try {
        await convertVideoToWav(inputVideoPath, outputAudioPath);
        const transcript = await whisper.transcribe(outputAudioPath);
        res.send(transcript);
    } catch (error){
        res.status(500).send("Error during transcription/conversion");
        console.log(error.message);
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