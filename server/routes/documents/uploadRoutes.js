import express from 'express';
import fs from 'fs';
import Document from '../../models/Document.js';
import { User } from '../../models/User.js';
import { auth } from '../../middleware/auth.js';
import { upload } from './helpers.js';
import { processDocumentNLP } from './nlpProcessing.js';

const router = express.Router();

/**
 * POST /upload
 * Upload a PDF and immediately queue background NLP processing.
 */
router.post('/upload', auth, upload.single('document'), async (req, res) => {
  try {
    // Step 1: Make sure a file was sent.
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Step 2: Read user id from auth middleware safely.
    const rawUserId = req.user ? req.user.id : null;
    const authenticatedUserId = Number.parseInt(rawUserId, 10);

    // Step 3: Reject invalid user ids before touching the database.
    if (!Number.isInteger(authenticatedUserId) || authenticatedUserId <= 0) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(401).json({ error: 'Invalid authentication context' });
    }

    // Step 4: Make sure the user still exists in the Users table.
    const authenticatedUser = await User.findByPk(authenticatedUserId, {
      attributes: ['id']
    });

    if (!authenticatedUser) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(401).json({
        error: 'Authenticated user no longer exists. Please log in again.'
      });
    }

    // Step 5: Set expiry date (6 months from now).
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 6);

    // Step 6: Save document metadata.
    const now = new Date();
    const document = await Document.create({
      originalName: req.file.originalname,
      filename: req.file.filename,
      filePath: req.file.path,
      fileSize: req.file.size,
      userId: authenticatedUser.id,
      uploadDate: now,
      expiresAt
    });

    // Step 7: Start NLP processing in background.
    processDocumentNLP(document);

    // Step 8: Return response immediately.
    return res.status(201).json({
      message: 'Document uploaded successfully',
      document: {
        id: document.id,
        originalName: document.originalName,
        fileSize: document.fileSize,
        uploadDate: document.uploadDate,
        nlpProcessed: false
      }
    });
  } catch (error) {
    // If anything fails, delete uploaded file to avoid orphan files.
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(401).json({
        error: 'Upload blocked: authenticated user is invalid. Please log in again.'
      });
    }

    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Failed to upload document' });
  }
});

export default router;
