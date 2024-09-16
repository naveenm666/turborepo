import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { processFiles } from '../controllers/processFiles';
import { dataSource } from '../index';

const router = express.Router();

// Setup multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Ensure the temporary directory exists
const tempDir = path.resolve(__dirname, 'tmp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Route to handle file uploads
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileBuffer = req.file.buffer;
    const fileName = req.file.originalname;

    // Save the file temporarily
    const tempFilePath = path.join(tempDir, fileName);
    fs.writeFileSync(tempFilePath, fileBuffer);

    // Process the file
    await processFiles(tempFilePath, dataSource);

    // Remove the temporary file
    fs.unlinkSync(tempFilePath);

    res.status(200).json({ message: 'File uploaded and processed successfully' });
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
