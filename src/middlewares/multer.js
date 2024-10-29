import multer from "multer";

export const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        const videoId = req.body.tab_id || 'default';
        const extension = file.originalname.split('.').pop();
        cb(null, `${videoId}.${extension}`);
    }
});

export const upload = multer({ storage: storage });

