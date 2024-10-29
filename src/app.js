import express from "express";
import bodyParser from "body-parser";
import transcriptionRoutes from "./routes/transcriptionRoutes.js";

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use("/", transcriptionRoutes);

export default app;