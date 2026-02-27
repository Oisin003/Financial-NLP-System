import express from 'express';
import fs from 'fs';
import Document from '../../models/Document.js';
import { User } from '../../models/User.js';
import { auth } from '../../middleware/auth.js';
import { buildDatabaseFilter, findDocumentForUser } from './helpers.js';

const router = express.Router();

/**
 * GET /
 * List documents visible to the current user.
 */
router.get('/', auth, async (req, res) => {
  try {
    // Step 1: Build filter based on logged-in user's role.
    const databaseFilter = buildDatabaseFilter(req);

    // Step 2: Load matching documents from database.
    const documents = await Document.findAll({
      where: databaseFilter,
      order: [['uploadDate', 'DESC']],
      attributes: ['id', 'originalName', 'filename', 'fileSize', 'uploadDate', 'userId', 'auditFlags'],
      include: [{
        model: User,
        attributes: ['id', 'username', 'email'],
        required: true
      }]
    });

    // Step 3: Send documents to frontend.
    return res.json({ documents });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

/**
 * GET /:id
 * Download one document if user has access.
 */
router.get('/:id', auth, async (req, res) => {
  try {
    // Step 1: Find document and enforce access permissions.
    const document = await findDocumentForUser(req, req.params.id);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Step 2: Make sure file still exists on disk.
    if (!fs.existsSync(document.filePath)) {
      return res.status(404).json({ error: 'File not found on server' });
    }

    // Step 3: Download file with original name.
    return res.download(document.filePath, document.originalName);
  } catch (error) {
    console.error('Error downloading document:', error);
    return res.status(500).json({ error: 'Failed to download document' });
  }
});

/**
 * DELETE /:id
 * Delete one document and its file.
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    // Step 1: Find document and enforce access permissions.
    const document = await findDocumentForUser(req, req.params.id);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Step 2: Delete file from disk (if it still exists).
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    // Step 3: Delete database row.
    await document.destroy();

    // Step 4: Confirm deletion.
    return res.json({ message: 'The document has been deleted' });
  } catch (error) {
    console.error('Error deleting document:', error);
    return res.status(500).json({ error: 'Failed to delete document' });
  }
});

export default router;
