/**
 * Document Routes
 * 
 * Handles file upload and retrieval for financial documents
 * Features:
 * - PDF file upload with validation
 * - Retrieve user's documents grouped by month
 * - Download individual documents
 * - Secure file storage with authentication
 */

import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Document from '../models/Document.js';
import { auth } from '../middleware/auth.js';
import { processDocument } from '../services/nlpProcessor.js';

const router = express.Router();

// Get current directory path (ES6 module compatible)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/documents');
    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Create unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

// File filter - only allow PDFs
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

// Initialize multer with configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

/**
 * POST /api/documents/upload
 * Upload a PDF document
 * Requires authentication
 */
router.post('/upload', auth, upload.single('document'), async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Create document record in database
    const document = await Document.create({
      originalName: req.file.originalname,
      filename: req.file.filename,
      filePath: req.file.path,
      fileSize: req.file.size,
      userId: req.user.id,
      uploadDate: new Date()
    });

    // Process document with NLP in the background
    processDocumentNLP(document);

    res.status(201).json({
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
    // If database save fails, delete the uploaded file
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

/**
 * GET /api/documents
 * Get all documents for the authenticated user
 * Admins can see all documents from all users
 * Returns documents grouped by month
 */
router.get('/', auth, async (req, res) => {
  try {
    // Import User model to get user details
    const { User } = await import('../models/User.js');

    // Admin sees all documents, regular users see only their own
    const whereClause = req.user.role === 'admin' ? {} : { userId: req.user.id };

    // Fetch documents with user information, sorted by upload date (newest first)
    const documents = await Document.findAll({
      where: whereClause,
      order: [['uploadDate', 'DESC']],
      attributes: ['id', 'originalName', 'filename', 'fileSize', 'uploadDate', 'userId'],
      include: [{
        model: User,
        attributes: ['id', 'username', 'email'],
        required: true
      }]
    });

    res.json({ documents });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

/**
 * GET /api/documents/:id
 * Download a specific document
 * Admins can download any document, users can only download their own
 * Requires authentication
 */
router.get('/:id', auth, async (req, res) => {
  try {
    // Build where clause - admin can access any, user only their own
    const whereClause = req.user.role === 'admin'
      ? { id: req.params.id }
      : { id: req.params.id, userId: req.user.id };

    const document = await Document.findOne({
      where: whereClause
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check if file exists
    if (!fs.existsSync(document.filePath)) {
      return res.status(404).json({ error: 'File not found on server' });
    }

    // Send file for download
    res.download(document.filePath, document.originalName);
  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({ error: 'Failed to download document' });
  }
});

/**
 * DELETE /api/documents/:id
 * Delete a document
 * Admins can delete any document, users can only delete their own
 * Requires authentication
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    // Build where clause - admin can delete any, user only their own
    const whereClause = req.user.role === 'admin'
      ? { id: req.params.id }
      : { id: req.params.id, userId: req.user.id };

    const document = await Document.findOne({
      where: whereClause
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Delete file from filesystem
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    // Delete database record
    await document.destroy();

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

/**
 * Background function to process document with NLP
 * Runs asynchronously after document upload
 */
async function processDocumentNLP(document) {
  try {
    console.log(`Processing document ${document.id} with NLP...`);
    
    // Run NLP processing on the PDF file
    const nlpResults = await processDocument(document.filePath);
    
    // Save results to database
    await document.update({
      extractedText: nlpResults.rawText,
      processedTokens: nlpResults.processedTokens,
      wordFrequency: nlpResults.wordFrequency,
      topWords: nlpResults.topWords,
      nlpProcessed: true
    });
    
    console.log(`Document ${document.id} processed successfully`);
  } catch (error) {
    console.error(`NLP processing failed for document ${document.id}:`, error);
  }
}

/**
 * GET /api/documents/:id/nlp
 * Get NLP analysis results for a specific document
 * Returns processed text, tokens, and word frequencies
 */
router.get('/:id/nlp', auth, async (req, res) => {
  try {
    const whereClause = req.user.role === 'admin'
      ? { id: req.params.id }
      : { id: req.params.id, userId: req.user.id };

    const document = await Document.findOne({ where: whereClause });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // If still processing, return status
    if (!document.nlpProcessed) {
      return res.status(202).json({ 
        message: 'Document is still being processed',
        nlpProcessed: false 
      });
    }

    // Return NLP results
    res.json({
      documentId: document.id,
      originalName: document.originalName,
      nlpProcessed: true,
      extractedText: document.extractedText,
      processedTokens: document.processedTokens,
      wordFrequency: document.wordFrequency,
      topWords: document.topWords
    });
  } catch (error) {
    console.error('Error fetching NLP data:', error);
    res.status(500).json({ error: 'Failed to fetch NLP analysis' });
  }
});

/**
 * POST /api/documents/:id/reprocess
 * Reprocess a document's NLP analysis
 * Useful if the first processing failed or you want fresh results
 */
router.post('/:id/reprocess', auth, async (req, res) => {
  try {
    const whereClause = req.user.role === 'admin'
      ? { id: req.params.id }
      : { id: req.params.id, userId: req.user.id };

    const document = await Document.findOne({ where: whereClause });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Reset status and reprocess
    await document.update({ nlpProcessed: false });
    processDocumentNLP(document);

    res.json({ 
      message: 'Document reprocessing started',
      documentId: document.id 
    });
  } catch (error) {
    console.error('Error reprocessing document:', error);
    res.status(500).json({ error: 'Failed to reprocess document' });
  }
});

export default router;
