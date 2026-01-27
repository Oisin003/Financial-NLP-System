/**
 * Documents Component
 * 
 * Main page showing all uploaded documents
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NLPAnalysis from './NLPAnalysis';
import DocumentCard from './DocumentCard';
import EmptyDocuments from './EmptyDocuments';
import DocumentStatistics from './DocumentStatistics';
import { useDocuments } from '../hooks/useDocuments';
import { groupDocumentsByMonth } from '../utils/documentUtils';
import './Documents.css';

function Documents() {
  // Get all document data and functions from custom hook
  const {
    documents,
    loading,
    error,
    deletingId,
    currentUser,
    handleDelete
  } = useDocuments();

  // Track which document's NLP analysis is being viewed
  const [selectedDocumentForNLP, setSelectedDocumentForNLP] = useState(null);

  // Navigation function
  const navigate = useNavigate();

  /**
   * Loading State
   * Show a spinner while fetching documents from server
   */
  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading documents...</p>
      </div>
    );
  }

  /**
   * Error State
   * Show error message if something went wrong
   */
  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      </div>
    );
  }

  // Organize documents by month for folder-like display
  const groupedDocuments = groupDocumentsByMonth(documents);

  // Check if user has any documents
  const hasDocuments = documents.length > 0;

  return (
    <div className="container">
      {/* Page Header with Title and Upload Button */}
      <div className="card mb-4">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between">
            {/* Left side: Page title and description */}
            <div>
              <h2>
                <i className="bi bi-folder2-open me-2 text-primary"></i>
                {currentUser?.role === 'admin' ? 'All Documents' : 'My Documents'}
              </h2>
              <p className="text-muted mb-0">
                {currentUser?.role === 'admin'
                  ? 'Manage all documents across the organization'
                  : 'Your financial documents organized by month'}
              </p>
            </div>

            {/* Right side: Upload button */}
            <button
              className="btn btn-primary"
              onClick={() => navigate('/upload-document')}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Upload New
            </button>
          </div>
        </div>
      </div>

      {/* Show empty state if no documents */}
      {!hasDocuments && (
        <EmptyDocuments onUploadClick={() => navigate('/upload-document')} />
      )}

      {/* Documents grouped by month (folder structure) */}
      {hasDocuments && Object.entries(groupedDocuments).map(([monthYear, docs]) => (
        <div key={monthYear} className="card mb-3">
          {/* Month header showing month name and document count */}
          <div className="card-header text-white">
            <div className="d-flex justify-content-between align-items-center">
              <h5>
                <i className="bi bi-calendar3 me-2"></i>
                {monthYear}
              </h5>
              {/* Badge showing how many documents in this month */}
              <span className="badge bg-light text-primary">{docs.length} documents</span>
            </div>
          </div>

          {/* Grid of document cards for this month */}
          <div className="card-body">
            <div className="row">
              {docs.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  doc={doc}
                  currentUser={currentUser}
                  onNLPClick={setSelectedDocumentForNLP}
                  onDelete={handleDelete}
                  deletingId={deletingId}
                />
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* Statistics section (only show if there are documents) */}
      {hasDocuments && (
        <DocumentStatistics
          documents={documents}
          groupedDocuments={groupedDocuments}
        />
      )}

      {/* NLP Analysis Modal - Opens when user clicks "NLP Analysis" button */}
      {selectedDocumentForNLP && (
        <div className="modal-overlay" onClick={() => setSelectedDocumentForNLP(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <NLPAnalysis
              documentId={selectedDocumentForNLP.id}
              documentName={selectedDocumentForNLP.name}
              onClose={() => setSelectedDocumentForNLP(null)}
            />
          </div>
        </div>
      )}

    </div>
  );
}

export default Documents;
