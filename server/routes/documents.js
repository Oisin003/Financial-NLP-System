/**
 * Document Routes - File Upload and Management
 * 
 * This file handles everything related to financial document uploads and analysis.
 */

import express from 'express';
import multer from 'multer';  // File upload handling
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Document from '../models/Document.js';
import { auth } from '../middleware/auth.js';
import { processDocument } from '../services/nlpProcessor.js';

const router = express.Router();

// Get current directory path 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- SMALL HELPERS ---
// Keep role checks in one place to avoid repeating logic
const buildWhereClause = (req, id) => {
  // Admins can see everything
  if (req.user.role === 'admin') {
    return id ? { id } : {};
  }

  // Regular users can only see their own documents
  return id ? { id, userId: req.user.id } : { userId: req.user.id };
};

const findDocument = (req, id) => {
  return Document.findOne({ where: buildWhereClause(req, id) });
};

// --- FILE UPLOAD CONFIGURATION ---

// Configure where and how files are stored
const storage = multer.diskStorage({
  // Where to save uploaded files
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/documents');
    
    // Create upload directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  
  // How to name the uploaded file
  filename: (req, file, cb) => {
    // Create unique filename: timestamp-randomnumber-originalname.pdf
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

// Only allow PDF files
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);  // Accept file
  } else {
    cb(new Error('PDF files only for the moment - new features are on their way!'), false);  // Reject file
  }
};

// Initialize multer with our configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024  // 10MB maximum file size - May end up chaning depending on what data I get (27/01/26)
  }
});

/**
 * POST /api/documents/upload
 * Upload a PDF document
 */
router.post('/upload', auth, upload.single('document'), async (req, res) => {
  try {
    // Check if a file was actually uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Set expiry date (6 months from now) May end up chaning depending on what Helix says
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 6); // Set expiration to 6 months from now

    // Create database record for the uploaded file
    const document = await Document.create({
      originalName: req.file.originalname,  // User's filename
      filename: req.file.filename,          // Our unique filename
      filePath: req.file.path,              // Full path on server
      fileSize: req.file.size,              // Size in bytes
      userId: req.user.id,                  // Who uploaded it
      uploadDate: new Date(),                // When it was uploaded
      expiresAt                             // Expires in 6 months
    });

    // Start NLP processing in the background (async, don't wait)
    processDocumentNLP(document);

    // Send response immediately
    res.status(201).json({
      message: 'Document uploaded successfully',
      document: {
        id: document.id,
        originalName: document.originalName,
        fileSize: document.fileSize,
        uploadDate: document.uploadDate,
        nlpProcessed: false  // Processing just started
      }
    });
    
  } catch (error) {
    // If database save fails, clean up the uploaded file
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

/**
 * GET /api/documents
 * Get a list of all documents
 */
router.get('/', auth, async (req, res) => {
  try {
    // Import User model to include user info in results
    const { User } = await import('../models/User.js');

    // Build a simple filter based on role
    const whereClause = buildWhereClause(req);

    // Fetch documents (newest first)
    const documents = await Document.findAll({
      where: whereClause,
      order: [['uploadDate', 'DESC']],  // Newest first
      attributes: ['id', 'originalName', 'filename', 'fileSize', 'uploadDate', 'userId'],
      include: [{
        model: User,
        attributes: ['id', 'username', 'email'],  // Include uploader info
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
 */
router.get('/:id', auth, async (req, res) => {
  try {
    // Find the document (role-aware)
    const document = await findDocument(req, req.params.id);

    // Check if document exists in database
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check if file exists on disk
    if (!fs.existsSync(document.filePath)) {
      return res.status(404).json({ error: 'File not found on server' });
    }

    // Send file for download with original filename
    res.download(document.filePath, document.originalName);
    
  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({ error: 'Failed to download document' });
  }
});

/**
 * DELETE /api/documents/:id
 * Delete a document and its file
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    // Find the document (role-aware)
    const document = await findDocument(req, req.params.id);

    // Check if document exists
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Step 1: Delete physical file from disk - Assuming its there
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    // Step 2: Delete database record
    await document.destroy();

    res.json({ message: 'The document has been deleted' });
    
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

/**
 * Background function to process document with NLP
 * 
 * This function runs asynchronously after a document is uploaded.
 * It doesn't block the upload response.
 */
async function processDocumentNLP(document) {
  try {
    console.log(`Processing document ${document.id} with our patented NLP technique...`);
    
    // Run NLP processing on the PDF file
    // This extracts text, tokenizes, and builds stats
    const nlpResults = await processDocument(document.filePath);
    
    // Save NLP results to database
    await document.update({
      extractedText: nlpResults.rawText,
      processedTokens: nlpResults.processedTokens,
      wordFrequency: nlpResults.wordFrequency,
      topWords: nlpResults.topWords,
      nlpProcessed: true  // Mark as complete
    });
    
    console.log(`Document ${document.id} processed successfully`);
    
  } catch (error) {
    console.error(`NLP processing failed for document ${document.id}:`, error.message);
  }
}

/**
 * GET /api/documents/:id/nlp
 * Get NLP analysis results for a document
 * 
 * Status codes:
 * - 200: Analysis complete, data returned
 * - 202: Still processing, try again later
 * - 404: Document not found
 */
router.get('/:id/nlp', auth, async (req, res) => {
  try {
    // Find the document (role-aware)
    const document = await findDocument(req, req.params.id);

    // Check if document exists
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // If still processing, return status 202 (Accepted, but not ready)
    if (!document.nlpProcessed) {
      return res.status(202).json({ 
        message: 'Document is still being processed',
        nlpProcessed: false 
      });
    }

    // Return NLP analysis results
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
 */
router.post('/:id/reprocess', auth, async (req, res) => {
  try {
    // Find the document (role-aware)
    const document = await findDocument(req, req.params.id);

    // Check if document exists
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Reset processing status and start reprocessing
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
