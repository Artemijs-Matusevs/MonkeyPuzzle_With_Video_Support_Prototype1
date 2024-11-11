import app from "./src/app.js";

const PORT = 3000;
let whisper = null;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});

