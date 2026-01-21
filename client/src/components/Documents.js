/**
 * Documents Component
 * 
 * Displays all uploaded financial documents organized by month
 * Features:
 * - Documents grouped by upload month (folder structure)
 * - Sorted by date within each month
 * - Download functionality
 * - Delete functionality
 * - File size and date display
 * - Empty state handling
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  // Fetch documents on component mount
  useEffect(() => {
    // Get current user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/documents', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents);
      } else {
        setError('Failed to load documents');
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Group documents by month and year
  const groupDocumentsByMonth = () => {
    const grouped = {};

    documents.forEach(doc => {
      const date = new Date(doc.uploadDate);
      const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      
      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }
      grouped[monthYear].push(doc);
    });

    return grouped;
  };

  // Format file size for display
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle document download
  const handleDownload = async (documentId, originalName) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/documents/${documentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = originalName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to download document');
      }
    } catch (err) {
      console.error('Download error:', err);
      alert('Network error. Please try again.');
    }
  };

  // Handle document deletion
  const handleDelete = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    setDeletingId(documentId);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Remove document from state
        setDocuments(documents.filter(doc => doc.id !== documentId));
      } else {
        alert('Failed to delete document');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Network error. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  // Loading state
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

  // Error state
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

  const groupedDocuments = groupDocumentsByMonth();
  const hasDocuments = documents.length > 0;

  return (
    <div className="container">
      {/* Header */}
      <div className="card mb-4">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between">
            {/* Title */}
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
            {/* Right side: Upload new document button */}
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

      {/* Empty state */}
      {!hasDocuments && (
        <div className="card">
          <div className="card-body text-center">
            {/* Large inbox icon to indicate empty state */}
            <div className="bg-light rounded-circle mb-4" 
                 style={{width: '120px', height: '120px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center'}}>
              <i className="bi bi-inbox" style={{ fontSize: '4rem', color: '#6c757d' }}></i>
            </div>
            {/* Friendly message encouraging first upload */}
            <h4 className="mb-3">No Documents Yet</h4>
            <p className="text-muted mb-4">
              Upload your first financial document to get started with the system
            </p>
            {/* Primary call-to-action button */}
            <button 
              className="btn btn-primary btn-lg"
              onClick={() => navigate('/upload-document')}
            >
              <i className="bi bi-upload me-2"></i>
              Upload Your First Document
            </button>
          </div>
        </div>
      )}

      {/* Documents grouped by month */}
      {/* Document cards by month */}
      {hasDocuments && Object.entries(groupedDocuments).map(([monthYear, docs]) => (
        <div key={monthYear} className="card mb-3">
          {/* Month header with document count badge */}
          <div className="card-header text-white">
            <div className="d-flex justify-content-between align-items-center">
              <h5>
                <i className="bi bi-calendar3 me-2"></i>
                {monthYear}
              </h5>
              <span className="badge bg-light text-primary">{docs.length} documents</span>
            </div>
          </div>
          
          {/* Documents grid */}
          <div className="card-body">
            <div className="row">
              {docs.map((doc) => (
                <div key={doc.id} className="col-md-6 col-lg-4">
                  {/* Document card */}
                  <div className="card h-100 hover-shadow">
                    <div className="card-body">
                      {/* PDF icon at the top of card */}
                      <div className="text-center mb-3">
                        <div className="bg-light rounded p-3 d-inline-block">
                          <i className="bi bi-file-earmark-pdf-fill text-danger" style={{ fontSize: '2.5rem' }}></i>
                        </div>
                      </div>
                      
                      {/* File name */}
                      <h6 className="text-center text-truncate" title={doc.originalName}>
                        {doc.originalName}
                      </h6>
                      
                      {/* Uploader info */}
                      {currentUser?.role === 'admin' && doc.User && (
                        <div className="text-center">
                          <div className="bg-light rounded px-2 py-1">
                            <i className="bi bi-person-circle me-1 text-primary"></i>
                            <small className="text-muted">
                              <strong>{doc.User.username}</strong>
                            </small>
                          </div>
                        </div>
                      )}
                      
                      {/* File info */}
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
                      
                      {/* Action buttons */}
                      <div>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleDownload(doc.id, doc.originalName)}
                          title="Download document"
                        >
                          <i className="bi bi-download me-1"></i>
                          Download
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm w-100"
                          onClick={() => handleDelete(doc.id)}
                          disabled={deletingId === doc.id}
                          title="Delete document"
                        >
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
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* Statistics */}
      {hasDocuments && (
        <div className="card">
          <div className="card-body">
            <h5 className="text-center mb-3">
              <i className="bi bi-bar-chart-fill me-2 text-primary"></i>
              Document Statistics
            </h5>
            <div className="row text-center">
              {/* Total docs */}
              <div className="col-md-4">
                <div className="card bg-light">
                  <div className="card-body py-4">
                    <div className="bg-primary text-white rounded-circle mb-2" 
                         style={{width: '50px', height: '50px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center'}}>
                      <i className="bi bi-files fs-4"></i>
                    </div>
                    <h3>{documents.length}</h3>
                    <small className="text-muted">Total Documents</small>
                  </div>
                </div>
              </div>
              
              {/* Months with uploads count card */}
              <div className="col-md-4">
                <div className="card bg-light h-100">
                  <div className="card-body py-4">
                    <div className="bg-info text-white rounded-circle mb-2" 
                         style={{width: '50px', height: '50px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center'}}>
                      <i className="bi bi-calendar3 fs-4"></i>
                    </div>
                    <h3 className="mb-1 fw-bold">{Object.keys(groupedDocuments).length}</h3>
                    <small className="text-muted">Months</small>
                  </div>
                </div>
              </div>
              
              {/* Total storage size card */}
              <div className="col-md-4">
                <div className="card bg-light h-100">
                  <div className="card-body py-4">
                    <div className="bg-success text-white rounded-circle mb-2" 
                         style={{width: '50px', height: '50px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center'}}>
                      <i className="bi bi-hdd-fill fs-4"></i>
                    </div>
                    <h3 className="mb-1 fw-bold">
                      {formatFileSize(documents.reduce((sum, doc) => sum + doc.fileSize, 0))}
                    </h3>
                    <small className="text-muted">Total Size</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Documents;
