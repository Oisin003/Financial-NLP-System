import React from 'react';
import { formatFileSize, formatDate } from '../../../utils/documentUtils';

function DocumentCardMeta({ doc }) {
  return (
    <div className="text-center mb-3">
      <small className="text-muted d-block mb-1">
        <i className="bi bi-hdd-fill me-1"></i>
        {formatFileSize(doc.fileSize)}
      </small>

      <small className="text-muted d-block">
        <i className="bi bi-clock-fill me-1"></i>
        {formatDate(doc.uploadDate)}
      </small>
    </div>
  );
}

export default DocumentCardMeta;
