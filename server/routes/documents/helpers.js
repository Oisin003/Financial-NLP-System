import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Document from '../../models/Document.js';

// These values let us build paths relative to this file.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Build a database filter based on current user's role.
 * - Admins can view all documents
 * - Regular users can only view their own documents
 */
export function buildDatabaseFilter(request, documentId) {
  // Read the current user's role and id from the auth middleware.
  const userRole = request.user.role;
  const userId = request.user.id;
  const isAdmin = userRole === 'admin';

  // Admin users can see everything.
  if (isAdmin) {
    if (documentId) {
      return { id: documentId };
    }

    return {};
  }

  // Normal users can only see their own documents.
  if (documentId) {
    return {
      id: documentId,
      userId: userId
    };
  }

  return {
    userId: userId
  };
}

/**
 * Find one document while enforcing role-based access control.
 */
export function findDocumentForUser(request, documentId) {
  // Build the access filter first, then query once.
  const filter = buildDatabaseFilter(request, documentId);
  return Document.findOne({ where: filter });
}

/**
 * Configure upload storage for PDF documents.
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Keep all uploaded PDFs in one known folder.
    const uploadPath = path.join(__dirname, '../../uploads/documents');

    // Create the folder if it does not exist yet.
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Build a simple unique filename so uploads do not clash.
    const timestamp = Date.now();
    const randomNumber = Math.round(Math.random() * 1e9);
    const uniqueSuffix = String(timestamp) + '-' + String(randomNumber);
    const finalFilename = uniqueSuffix + '-' + file.originalname;

    cb(null, finalFilename);
  }
});

/**
 * Restrict uploads to PDFs only.
 */
const fileFilter = (req, file, cb) => {
  // Only allow PDF files for now.
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
    return;
  }

  cb(new Error('PDF files only for the moment - new features are on their way!'), false);
};

/**
 * Multer middleware used by upload routes.
 */
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});
