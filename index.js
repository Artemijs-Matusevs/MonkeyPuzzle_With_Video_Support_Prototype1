import express from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

//Setting up middleware
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/Public/index.html") 
})

app.listen(3000, () => {
    console.log("Server running on port 3000.");
})