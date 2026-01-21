/**
 * Upload Document Component
 * 
 * Allows users to upload PDF financial documents
 * Features:
 * - File selection with drag and drop support
 * - PDF validation (type and size)
 * - Upload progress feedback
 * - Success/error notifications
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function UploadDocument() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    validateAndSetFile(file);
  };

  // Handle drag and drop
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    validateAndSetFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Validate file before setting
  const validateAndSetFile = (file) => {
    if (!file) return;

    // Check if it's a PDF
    if (file.type !== 'application/pdf') {
      setMessage({ type: 'danger', text: 'Only PDF files are allowed' });
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setMessage({ type: 'danger', text: 'File size must be less than 10MB' });
      return;
    }

    setSelectedFile(file);
    setMessage({ type: '', text: '' });
  };

  // Handle file upload
  const handleUpload = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setMessage({ type: 'warning', text: 'Please select a file first' });
      return;
    }

    setUploading(true);
    setMessage({ type: '', text: '' });

    try {
      const formData = new FormData();
      formData.append('document', selectedFile);

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/documents/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Document uploaded successfully!' });
        setSelectedFile(null);
        
        // Reset file input
        document.getElementById('fileInput').value = '';
        
        // Redirect to documents page after 2 seconds
        setTimeout(() => {
          navigate('/documents');
        }, 2000);
      } else {
        setMessage({ type: 'danger', text: data.error || 'Upload failed' });
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessage({ type: 'danger', text: 'Network error. Please try again.' });
    } finally {
      setUploading(false);
    }
  };

  // Format file size for display
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header text-white">
              <h3 className="mb-0 fw-bold">
                <i className="bi bi-cloud-arrow-up me-2"></i>
                Upload Financial Document
              </h3>
              <p className="mb-0 mt-2 opacity-75 small">Upload PDF documents to the system</p>
            </div>
            <div className="card-body p-4">
              {/* Display messages */}
              {message.text && (
                <div className={`alert alert-${message.type} alert-dismissible fade show d-flex align-items-center`} role="alert">
                  <i className={`bi ${message.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} fs-5 me-2`}></i>
                  <span>{message.text}</span>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setMessage({ type: '', text: '' })}
                  ></button>
                </div>
              )}

              <form onSubmit={handleUpload}>
                {/* Drag and drop area */}
                <div 
                  className="border rounded p-4 text-center mb-3"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  style={{ 
                    backgroundColor: '#f8f9fa',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                >
                  <div className="bg-light rounded-circle mb-3" 
                       style={{width: '80px', height: '80px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center'}}>
                    <i className="bi bi-cloud-upload text-primary" style={{ fontSize: '3rem' }}></i>
                  </div>
                  <h5 className="fw-bold mb-2">Drag and drop your PDF here</h5>
                  <p className="text-muted mb-3">or click to browse</p>
                  
                  {/* File input */}
                  <input
                    type="file"
                    id="fileInput"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="d-none"
                  />
                  <label htmlFor="fileInput" className="btn btn-primary">
                    <i className="bi bi-folder2-open me-2"></i>
                    Choose File
                  </label>
                  
                  <div className="mt-3">
                    <div className="row">
                      <div className="col-md-6">
                        <i className="bi bi-file-pdf me-2 text-danger"></i>
                        <strong>Format:</strong> PDF only
                      </div>
                      <div className="col-md-6">
                        <i className="bi bi-hdd me-2 text-primary"></i>
                        <strong>Max Size:</strong> 10MB
                      </div>
                    </div>
                  </div>
                </div>

                {/* Selected file */}
                {selectedFile && (
                  <div className="card bg-light mb-3">
                    <div className="card-body p-3">
                      <div className="d-flex align-items-center">
                        <div className="bg-danger bg-opacity-10 rounded p-3 me-3">
                          <i className="bi bi-file-earmark-pdf-fill text-danger" style={{ fontSize: '2.5rem' }}></i>
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="mb-1">{selectedFile.name}</h6>
                          <small className="text-muted">
                            <i className="bi bi-hdd-fill me-1"></i>
                            Size: {formatFileSize(selectedFile.size)}
                          </small>
                        </div>
                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          onClick={() => {
                            setSelectedFile(null);
                            document.getElementById('fileInput').value = '';
                          }}
                          title="Remove file"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Upload button */}
                <div>
                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={!selectedFile || uploading}
                  >
                    {uploading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Uploading Document...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-upload me-2"></i>
                        Upload Document
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Guidelines */}
              <div className="mt-3 p-3 bg-light rounded">
                <h6 className="mb-2">
                  <i className="bi bi-info-circle me-2"></i>
                  Upload Guidelines
                </h6>
                <ul className="mb-0 small">
                  <li>Only PDF files are accepted</li>
                  <li>Maximum file size is 10MB</li>
                  <li>Documents are organized by upload month</li>
                  <li>You can view all your documents on the Documents page</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UploadDocument;
