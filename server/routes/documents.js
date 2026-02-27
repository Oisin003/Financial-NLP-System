/**
 * Document Route Composer
 *
 * Keeps route wiring in one place while feature logic lives in smaller files:
 * - uploadRoutes: upload + auth safety checks
 * - nlpRoutes: NLP payload + reprocess + admin timing metrics
 * - documentCrudRoutes: list, download, delete
 */

import express from 'express';
import uploadRoutes from './documents/uploadRoutes.js';
import nlpRoutes from './documents/nlpRoutes.js';
import documentCrudRoutes from './documents/documentCrudRoutes.js';

const router = express.Router();

// Route order matters: mount NLP/admin routes before generic /:id routes.
router.use(uploadRoutes);
router.use(nlpRoutes);
router.use(documentCrudRoutes);

export default router;
