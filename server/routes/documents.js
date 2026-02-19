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
import { getFullNLPAnalysis } from '../services/nlpMicroservice.js';

const router = express.Router();

// Get current directory path 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- HELPER FUNCTIONS ---
// These helper functions keep role-checking logic in one place

/**
 * Build a database filter based on user's role
 * 
 * Admins can see all documents
 * Regular users can only see their own documents
 * 
 * @param {Object} request - The HTTP request object (contains user info)
 * @param {number} documentId - Optional document ID to filter by
 * @returns {Object} Filter object for database query
 */
function buildDatabaseFilter(request, documentId) {
  // Get the user's role from the request
  const userRole = request.user.role;
  const userId = request.user.id;
  
  // Check if user is an admin
  const isAdmin = userRole === 'admin';
  
  // Admins can see everything
  if (isAdmin) {
    // If documentId is provided, filter by just that ID
    // Otherwise, return empty filter (no restrictions)
    if (documentId) {
      return { id: documentId };
    } else {
      return {};
    }
  }
  
  // Regular users can only see their own documents
  if (documentId) {
    // Filter by both document ID and user ID
    return { id: documentId, userId: userId };
  } else {
    // Filter by just user ID
    return { userId: userId };
  }
}

/**
 * Find a single document that the user has access to
 * 
 * @param {Object} request - The HTTP request object
 * @param {number} documentId - The ID of the document to find
 * @returns {Promise<Document|null>} The document or null if not found
 */
function findDocumentForUser(request, documentId) {
  const filter = buildDatabaseFilter(request, documentId);
  return Document.findOne({ where: filter });
}

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

    // Build a database filter based on user's role
    const databaseFilter = buildDatabaseFilter(req);

    // Fetch documents (newest first)
    const documents = await Document.findAll({
      where: databaseFilter,
      order: [['uploadDate', 'DESC']],  // Newest first
      attributes: ['id', 'originalName', 'filename', 'fileSize', 'uploadDate', 'userId', 'auditFlags'],
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
    // Find the document (checks user has permission to access it)
    const document = await findDocumentForUser(req, req.params.id);

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
    // Find the document (checks user has permission to delete it)
    const document = await findDocumentForUser(req, req.params.id);

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
  const startTime = new Date();
  
  try {
    console.log(`Processing document ${document.id} with our patented NLP technique...`);
    
    // Record start time in database and clear any previous error
    await document.update({
      nlpProcessingStartTime: startTime,
      nlpProcessed: false,
      nlpError: null  // Clear any previous error message
    });
    
    // Run NLP processing on the PDF file (basic stats)
    const nlpResults = await processDocument(document.filePath);

    // Call Python microservice for advanced NLP (financial figures, entities, etc.)
    let microserviceResults = {};
    try {
      microserviceResults = await getFullNLPAnalysis(nlpResults.rawText);
    } catch (err) {
      console.error('Python NLP microservice /analyze error:', err.message);
    }

    // Calculate processing time
    const endTime = new Date();
    const durationMs = endTime - startTime;
    const durationSeconds = (durationMs / 1000).toFixed(3);

    // Save NLP results to database, including financial figures and timing
    await document.update({
      extractedText: nlpResults.rawText,
      nlpSummary: microserviceResults.summary || null,
      processedTokens: nlpResults.processedTokens,
      wordFrequency: nlpResults.wordFrequency,
      topWords: nlpResults.topWords,
      auditFlags: nlpResults.auditFlags || [],
      // Store financial_figures and entities as JSON if present
      financialFigures: microserviceResults.financial_figures || [],
      nlpEntities: microserviceResults.entities || [],
      // Store timing information
      nlpProcessingEndTime: endTime,
      nlpProcessingDuration: parseFloat(durationSeconds),
      nlpProcessed: true  // Mark as complete
    });
    
    console.log(`Document ${document.id} processed successfully in ${durationSeconds}s`);
    
  } catch (error) {
    console.error(`NLP processing failed for document ${document.id}:`, error.message);
    
    // Record end time even on failure
    const endTime = new Date();
    const durationSeconds = ((endTime - startTime) / 1000).toFixed(3);
    
    // Store the user-friendly error message in the database
    await document.update({
      nlpProcessingEndTime: endTime,
      nlpProcessingDuration: parseFloat(durationSeconds),
      nlpProcessed: false,  // Mark as failed
      nlpError: error.message  // Store error message for user
    }).catch(err => console.error('Failed to update timing on error:', err));
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
    // Find the document (checks user has permission to view it)
    const document = await findDocumentForUser(req, req.params.id);

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
      summary: document.nlpSummary || null,
      processedTokens: document.processedTokens,
      wordFrequency: document.wordFrequency,
      topWords: document.topWords,
      auditFlags: document.auditFlags || [],
      // Expose financial figures and entities to the frontend
      financial_figures: document.financialFigures || [],
      entities: document.nlpEntities || [],
      // Expose timing information
      timing: {
        startTime: document.nlpProcessingStartTime,
        endTime: document.nlpProcessingEndTime,
        duration: document.nlpProcessingDuration
      }
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
    // Find the document (checks user has permission to reprocess it)
    const document = await findDocumentForUser(req, req.params.id);

    // Check if document exists
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Reset processing status and start reprocessing
    await document.update({ nlpProcessed: false, nlpError: null, auditFlags: [] });
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

/**
 * GET /api/documents/processing-times
 * Get all document processing times (admin only)
 */
router.get('/processing-times', auth, async (req, res) => {
  try {
    // Only admins can see all processing times
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Get all documents with timing information
    const documents = await Document.findAll({
      attributes: [
        'id',
        'originalName',
        'userId',
        'uploadDate',
        'nlpProcessingStartTime',
        'nlpProcessingEndTime',
        'nlpProcessingDuration',
        'nlpProcessed'
      ],
      where: {
        nlpProcessed: true
      },
      order: [['nlpProcessingEndTime', 'DESC']],
      include: [{
        model: User,
        attributes: ['email', 'username']
      }]
    });

    res.json({
      count: documents.length,
      documents: documents.map(doc => ({
        id: doc.id,
        originalName: doc.originalName,
        user: {
          id: doc.userId,
          email: doc.User.email,
          username: doc.User.username
        },
        uploadDate: doc.uploadDate,
        timing: {
          startTime: doc.nlpProcessingStartTime,
          endTime: doc.nlpProcessingEndTime,
          duration: doc.nlpProcessingDuration
        }
      }))
    });
  } catch (error) {
    console.error('Error fetching processing times:', error);
    res.status(500).json({ error: 'Failed to fetch processing times' });
  }
});

export default router;
