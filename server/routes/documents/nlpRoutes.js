import express from 'express';
import Document from '../../models/Document.js';
import { User } from '../../models/User.js';
import { auth } from '../../middleware/auth.js';
import { findDocumentForUser } from './helpers.js';
import { processDocumentNLP } from './nlpProcessing.js';

const router = express.Router();

/**
 * GET /processing-times
 * Admin-only view of processing durations.
 * Declared before /:id routes to avoid path collisions.
 */
router.get('/processing-times', auth, async (req, res) => {
  try {
    // Step 1: Only admins can access this endpoint.
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Step 2: Fetch processed documents and timing data.
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

    // Step 3: Convert DB rows into API response shape.
    const formattedDocuments = documents.map(function (doc) {
      return {
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
      };
    });

    // Step 4: Send final payload.
    return res.json({
      count: documents.length,
      documents: formattedDocuments
    });
  } catch (error) {
    console.error('Error fetching processing times:', error);
    return res.status(500).json({ error: 'Failed to fetch processing times' });
  }
});

/**
 * GET /:id/nlp
 * Return NLP analysis payload for one document.
 */
router.get('/:id/nlp', auth, async (req, res) => {
  try {
    // Step 1: Find document and enforce access permissions.
    const document = await findDocumentForUser(req, req.params.id);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Step 2: Return status if processing is still running.
    if (!document.nlpProcessed) {
      return res.status(202).json({
        message: 'Document is still being processed',
        nlpProcessed: false
      });
    }

    // Step 3: Return completed NLP result payload.
    return res.json({
      documentId: document.id,
      originalName: document.originalName,
      nlpProcessed: true,
      extractedText: document.extractedText,
      summary: document.nlpSummary || null,
      summary_evaluation: document.nlpSummaryEvaluation || null,
      decision_trace: document.nlpDecisionTrace || null,
      processedTokens: document.processedTokens,
      wordFrequency: document.wordFrequency,
      topWords: document.topWords,
      auditFlags: document.auditFlags || [],
      financial_figures: document.financialFigures || [],
      entities: document.nlpEntities || [],
      timing: {
        startTime: document.nlpProcessingStartTime,
        endTime: document.nlpProcessingEndTime,
        duration: document.nlpProcessingDuration
      }
    });
  } catch (error) {
    console.error('Error fetching NLP data:', error);
    return res.status(500).json({ error: 'Failed to fetch NLP analysis' });
  }
});

/**
 * POST /:id/reprocess
 * Queue NLP processing again for one document.
 */
router.post('/:id/reprocess', auth, async (req, res) => {
  try {
    // Step 1: Find document and enforce access permissions.
    const document = await findDocumentForUser(req, req.params.id);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Step 2: Reset status fields before starting reprocess.
    await document.update({ nlpProcessed: false, nlpError: null, auditFlags: [] });

    // Step 3: Start async processing.
    processDocumentNLP(document);

    // Step 4: Respond immediately.
    return res.json({
      message: 'Document reprocessing started',
      documentId: document.id
    });
  } catch (error) {
    console.error('Error reprocessing document:', error);
    return res.status(500).json({ error: 'Failed to reprocess document' });
  }
});

export default router;
