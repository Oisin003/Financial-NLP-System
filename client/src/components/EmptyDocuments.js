/**
 * EmptyDocuments Component
 * 
 * Friendly empty state displayed when user has no documents yet
 * Shows:
 * - Large inbox icon
 * - Encouraging message
 * - Big "Upload First Document" button
 * 
 * Purpose: Guide new users to take their first action
 * 
 * Props:
 * - onUploadClick: Function to navigate to upload page
 */

import React from 'react';

function EmptyDocuments({ onUploadClick }) {
  return (
    <div className="card">
      <div className="card-body text-center py-5">
        {/* Large inbox icon to represent empty state */}
        <div 
          className="bg-light rounded-circle mb-4" 
          style={{
            width: '120px', 
            height: '120px', 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center'
          }}
        >
          <i className="bi bi-inbox" style={{ fontSize: '4rem', color: '#6c757d' }}></i>
        </div>
        
        {/* Friendly heading */}
        <h4 className="mb-3">No Documents Yet</h4>
        
        {/* Helpful explanation */}
        <p className="text-muted mb-4">
          Upload your first financial document to get started with the system
        </p>
        
        {/* Primary call-to-action button */}
        <button 
          className="btn btn-primary btn-lg"
          onClick={onUploadClick}
        >
          <i className="bi bi-upload me-2"></i>
          Upload Your First Document
        </button>
      </div>
    </div>
  );
}

export default EmptyDocuments;
