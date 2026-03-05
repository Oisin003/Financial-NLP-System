import React from 'react';

function DocumentCardHeader({ doc, currentUser }) {
  const showUploader = currentUser && currentUser.role === 'admin' && doc.User;

  return (
    <>
      <div className="text-center mb-3">
        <div className="bg-light rounded p-3 d-inline-block">
          <i className="bi bi-file-earmark-pdf-fill text-danger" style={{ fontSize: '2.5rem' }}></i>
        </div>
      </div>

      <h6 className="text-center text-truncate" title={doc.originalName}>
        {doc.originalName}
      </h6>

      {/* Only admins can see who uploaded a file */}
      {showUploader && (
        <div className="text-center mb-2">
          <div className="bg-light rounded px-2 py-1">
            <i className="bi bi-person-circle me-1 text-primary"></i>
            <small className="text-muted">
              <strong>{doc.User.username}</strong>
            </small>
          </div>
        </div>
      )}
    </>
  );
}

export default DocumentCardHeader;
