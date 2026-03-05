import React from 'react';
import { downloadDocument } from '../../../utils/documentUtils';

function DocumentCardActions({ doc, onNLPClick, onDelete, deletingId }) {
  const isDeleting = deletingId === doc.id;

  return (
    <div>
      <button
        className="btn btn-primary btn-sm w-100 mb-2"
        onClick={() => downloadDocument(doc.id, doc.originalName)}
        title="Download this document to your computer"
      >
        <i className="bi bi-download me-1"></i>
        Download
      </button>

      <button
        className="btn btn-info btn-sm w-100 mb-2"
        onClick={() => onNLPClick({ id: doc.id, name: doc.originalName })}
        title="View text analysis and word frequency"
      >
        <i className="bi bi-graph-up me-1"></i>
        NLP Analysis
      </button>

      <button
        className="btn btn-outline-danger btn-sm w-100"
        onClick={() => onDelete(doc.id)}
        disabled={isDeleting}
        title="Permanently delete this document"
      >
        {isDeleting ? (
          <span className="spinner-border spinner-border-sm" role="status"></span>
        ) : (
          <>
            <i className="bi bi-trash me-1"></i>
            Delete
          </>
        )}
      </button>
    </div>
  );
}

export default DocumentCardActions;
