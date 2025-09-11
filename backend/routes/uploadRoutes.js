// import express from 'express'
// import multer from 'multer'
// import path from 'path'
// import fs from 'fs'


// const router = express.Router()


// // Ensure uploads folder exists
// const uploadDir = path.join(process.cwd(), 'uploads');
// if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// // Multer storage
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, uploadDir);
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + '-' + file.originalname);
//   }
// });

// const upload = multer({ storage });

// // Upload image/video
// router.post('/upload', upload.single('file'), (req, res) => {
//   if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
//   res.json({ file: { path: `uploads/${req.file.filename}` } });
// });

// export default router;