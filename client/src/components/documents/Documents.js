/**
 * Documents Component
 * 
 * Main page showing all uploaded documents
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NLPAnalysis from '../nlp/NLPAnalysis';
import DocumentCard from './DocumentCard';
import EmptyDocuments from './EmptyDocuments';
import DocumentStatistics from './DocumentStatistics';
import { useDocuments } from '../../hooks/useDocuments';
import { groupDocumentsByMonth } from '../../utils/documentUtils';
import './Documents.css';

// Small presentational component: shows the top title + upload button.
// Keeping this separate makes the main Documents component easier to scan.
function DocumentsHeader({ currentUser, onUploadClick }) {
  const isAdmin = currentUser && currentUser.role === 'admin';

  return (
    <div className="card mb-4">
      <div className="card-body p-4">
        <div className="d-flex justify-content-between">
          {/* Left side: Page title and description */}
          <div>
            <h2>
              <i className="bi bi-folder2-open me-2 text-primary"></i>
              {isAdmin ? 'All Documents' : 'My Documents'}
            </h2>
            <p className="text-muted mb-0">
              {isAdmin
                ? 'Manage all documents across the organization'
                : 'Your financial documents organized by month'}
            </p>
          </div>

          {/* Right side: Upload button */}
          <button className="btn btn-primary" onClick={onUploadClick}>
            <i className="bi bi-plus-circle me-2"></i>
            Upload New
          </button>
        </div>
      </div>
    </div>
  );
}

// Renders all month groups and their document cards.
// Receives simple props so it stays focused on layout.
function DocumentsByMonth({ groupedDocuments, currentUser, deletingId, onDelete, onNLPClick }) {
  const hasDocuments = Object.keys(groupedDocuments).length > 0;

  if (!hasDocuments) {
    return null;
  }

  return (
    <>
      {Object.entries(groupedDocuments).map(([monthYear, docs]) => (
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
                  onNLPClick={onNLPClick}
                  onDelete={onDelete}
                  deletingId={deletingId}
                />
              ))}
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

// Simple wrapper for the NLP Analysis modal. This keeps modal markup
// out of the main Documents component.
function NLPAnalysisModal({ selectedDocument, onClose }) {
  if (!selectedDocument) {
    return null;
  }

  const handleBackgroundClick = () => {
    onClose();
  };

  const stopClickFromClosing = (event) => {
    event.stopPropagation();
  };

  return (
    <div className="modal-overlay" onClick={handleBackgroundClick}>
      <div className="modal-content" onClick={stopClickFromClosing}>
        <NLPAnalysis
          documentId={selectedDocument.id}
          documentName={selectedDocument.name}
          onClose={onClose}
        />
      </div>
    </div>
  );
}

function Documents() {
  // === DATA FROM CUSTOM HOOK ===
  // useDocuments is a custom hook that hides the details of talking to the server.
  // It gives us the documents plus a few helper values and functions.
  const {
    documents,
    loading,
    error,
    deletingId,
    currentUser,
    handleDelete,
  } = useDocuments();

  // === LOCAL UI STATE ===
  // selectedDocumentForNLP: which document the user wants to inspect using NLP.
  // null means the modal is closed.
  const [selectedDocumentForNLP, setSelectedDocumentForNLP] = useState(null);

  // Just for debugging: log whenever the selected document changes.
  useEffect(() => {
    console.log('selectedDocumentForNLP changed:', selectedDocumentForNLP);
  }, [selectedDocumentForNLP]);

  // Navigation helper from React Router.
  const navigate = useNavigate();

  // === LOADING STATE ===
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

  // === ERROR STATE ===
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

  // Organize documents by month for folder-like display.
  const groupedDocuments = groupDocumentsByMonth(documents);

  // Check if user has any documents at all.
  const hasDocuments = documents.length > 0;

  const handleUploadClick = () => {
    navigate('/upload-document');
  };

  return (
    <div className="container">
      {/* Page Header with Title and Upload Button */}
      <DocumentsHeader currentUser={currentUser} onUploadClick={handleUploadClick} />

      {/* Show empty state if no documents */}
      {!hasDocuments && <EmptyDocuments onUploadClick={handleUploadClick} />}

      {/* Documents grouped by month (folder structure) */}
      {hasDocuments && (
        <DocumentsByMonth
          groupedDocuments={groupedDocuments}
          currentUser={currentUser}
          deletingId={deletingId}
          onDelete={handleDelete}
          onNLPClick={setSelectedDocumentForNLP}
        />
      )}

      {/* Statistics section (only show if there are documents) */}
      {hasDocuments && (
        <DocumentStatistics documents={documents} groupedDocuments={groupedDocuments} />
      )}

      {/* NLP Analysis Modal - Opens when user clicks "NLP Analysis" button */}
      <NLPAnalysisModal
        selectedDocument={selectedDocumentForNLP}
        onClose={() => setSelectedDocumentForNLP(null)}
      />
    </div>
  );
}

export default Documents;
