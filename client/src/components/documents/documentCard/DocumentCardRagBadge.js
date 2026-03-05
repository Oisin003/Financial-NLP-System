import React from 'react';

function DocumentCardRagBadge({ auditFlags }) {
  // If no flags exist, show nothing
  if (!Array.isArray(auditFlags) || auditFlags.length === 0) {
    return null;
  }

  // Prefer explicit RAG status when available
  const ragFlag = auditFlags.find((flag) => flag.id === 'rag-status');
  const ragStatus = ragFlag?.evidence?.ragStatus;

  if (ragStatus) {
    const badgeClasses = {
      red: 'bg-danger text-white',
      amber: 'bg-warning text-dark',
      green: 'bg-success text-white'
    };

    const icons = {
      red: 'bi-x-circle-fill',
      amber: 'bi-exclamation-triangle-fill',
      green: 'bi-check-circle-fill'
    };

    return (
      <div className="text-center mb-3">
        <span className={`badge ${badgeClasses[ragStatus] || badgeClasses.amber}`}>
          <i className={`bi ${icons[ragStatus] || icons.amber} me-1`}></i>
          RAG: {ragStatus.toUpperCase()}
        </span>
      </div>
    );
  }

  // Fallback: older flags that do not contain explicit RAG status
  return (
    <div className="text-center mb-3">
      <span className="badge bg-warning text-dark">
        <i className="bi bi-exclamation-triangle-fill me-1"></i>
        {auditFlags.length} flag{auditFlags.length !== 1 ? 's' : ''}
      </span>
    </div>
  );
}

export default DocumentCardRagBadge;
