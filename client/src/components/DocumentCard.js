/**
 * DocumentCard Component
 * 
 * Displays a single document as a card with:
 * - PDF icon
 * - File name
 * - Uploader info (for admins)
 * - File size and upload date
 * - Action buttons: Download, NLP Analysis, Delete
 */

import React from 'react';
import { formatFileSize, formatDate, downloadDocument } from '../utils/documentUtils';

function DocumentCard({ doc, currentUser, onNLPClick, onDelete, deletingId }) {
  return (
    <div className="col-md-6 col-lg-4">
      <div className="card h-100 hover-shadow">
        <div className="card-body">
          {/* PDF Icon at top of card */}
          <div className="text-center mb-3">
            <div className="bg-light rounded p-3 d-inline-block">
              <i className="bi bi-file-earmark-pdf-fill text-danger" style={{ fontSize: '2.5rem' }}></i>
            </div>
          </div>

          {/* File name (truncated if too long) */}
          <h6 className="text-center text-truncate" title={doc.originalName}>
            {doc.originalName}
          </h6>

          {/* Show who uploaded it (admins only) */}
          {currentUser?.role === 'admin' && doc.User && (
            <div className="text-center mb-2">
              <div className="bg-light rounded px-2 py-1">
                <i className="bi bi-person-circle me-1 text-primary"></i>
                <small className="text-muted">
                  <strong>{doc.User.username}</strong>
                </small>
              </div>
            </div>
          )}

          {/* File size and date information */}
          <div className="text-center mb-3">
            {/* File size with hard drive icon */}
            <small className="text-muted d-block mb-1">
              <i className="bi bi-hdd-fill me-1"></i>
              {formatFileSize(doc.fileSize)}
            </small>
            {/* Upload date with clock icon */}
            <small className="text-muted d-block">
              <i className="bi bi-clock-fill me-1"></i>
              {formatDate(doc.uploadDate)}
            </small>
          </div>

          {/* Action buttons (full width) */}
          <div>
            {/* Download button */}
            <button
              className="btn btn-primary btn-sm w-100 mb-2"
              onClick={() => downloadDocument(doc.id, doc.originalName)}
              title="Download this document to your computer"
            >
              <i className="bi bi-download me-1"></i>
              Download
            </button>

            {/* NLP Analysis button */}
            <button
              className="btn btn-info btn-sm w-100 mb-2"
              onClick={() => onNLPClick({ id: doc.id, name: doc.originalName })}
              title="View text analysis and word frequency"
            >
              <i className="bi bi-graph-up me-1"></i>
              NLP Analysis
            </button>

            {/* Delete button (with confirmation) */}
            <button
              className="btn btn-outline-danger btn-sm w-100"
              onClick={() => onDelete(doc.id)}
              disabled={deletingId === doc.id}
              title="Permanently delete this document"
            >
              {/* Show spinner while deleting */}
              {deletingId === doc.id ? (
                <span className="spinner-border spinner-border-sm" role="status"></span>
              ) : (
                <>
                  <i className="bi bi-trash me-1"></i>
                  Delete
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentCard;
