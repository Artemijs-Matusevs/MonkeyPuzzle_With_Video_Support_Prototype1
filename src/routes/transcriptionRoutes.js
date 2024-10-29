import express from "express";
import { upload } from "../middlewares/multer.js";
import { uploadVideo, getTranscriptStatus } from "../controllers/transcriptionController.js";

const router = express.Router();

router.post("/upload-video", upload.single('video'), uploadVideo);
router.get("/transcript-status/:id", getTranscriptStatus);

export default router;