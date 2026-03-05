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
import DocumentCardHeader from './documentCard/DocumentCardHeader';
import DocumentCardMeta from './documentCard/DocumentCardMeta';
import DocumentCardRagBadge from './documentCard/DocumentCardRagBadge';
import DocumentCardActions from './documentCard/DocumentCardActions';

function DocumentCard({ doc, currentUser, onNLPClick, onDelete, deletingId }) {
  return (
    <div className="col-md-6 col-lg-4">
      <div className="card h-100 hover-shadow">
        <div className="card-body">
          {/* Top section: icon, file name, and uploader (admins only) */}
          <DocumentCardHeader doc={doc} currentUser={currentUser} />

          {/* Middle section: file size and upload date */}
          <DocumentCardMeta doc={doc} />

          {/* Optional badge from audit flags (RAG or fallback count) */}
          <DocumentCardRagBadge auditFlags={doc.auditFlags} />

          {/* Bottom section: document actions */}
          <DocumentCardActions
            doc={doc}
            onNLPClick={onNLPClick}
            onDelete={onDelete}
            deletingId={deletingId}
          />
        </div>
      </div>
    </div>
  );
}

export default DocumentCard;
