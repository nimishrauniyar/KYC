const path = require('path');
const fs = require('fs');
const multer = require('multer');

const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png'];
const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    const directory = path.resolve('uploads');
    fs.mkdirSync(directory, { recursive: true });
    callback(null, directory);
  },
  filename: (_req, file, callback) => callback(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname).toLowerCase()}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => callback(null, allowedMimeTypes.includes(file.mimetype)),
});

function uploadSingleDocument(req, res, next) {
  upload.single('document')(req, res, (error) => {
    if (error instanceof multer.MulterError) return res.status(400).json({ message: error.code === 'LIMIT_FILE_SIZE' ? 'Document must be 5 MB or smaller.' : error.message });
    if (error) return next(error);
    if (!req.file) return res.status(400).json({ message: 'A PDF, JPEG, or PNG document file is required.' });
    return next();
  });
}

module.exports = { uploadSingleDocument, allowedMimeTypes };
