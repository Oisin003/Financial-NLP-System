/**
 * Upload Document Component
 */

import React from 'react';
import { useFileUpload } from '../hooks/useFileUpload';
import FileDropZone from './FileDropZone';
import SelectedFileCard from './SelectedFileCard';
import UploadGuidelines from './UploadGuidelines';
import AlertMessage from './AlertMessage';

function UploadDocument() {
  // Get all file upload functionality from our custom hook
  const { 
    selectedFile, 
    uploading, 
    message, 
    selectFile, 
    removeFile, 
    upload,
    setMessage 
  } = useFileUpload();

  // When user selects a file from their computer
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    selectFile(file);
  };

  // When user drags and drops a file
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    selectFile(file);
  };

  // Required for drag and drop to work
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // When user clicks the upload button
  const handleSubmit = (e) => {
    e.preventDefault();
    upload();
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-8">
          <div className="card">
            {/* Page Title */}
            <div className="card-header text-white">
              <h3 className="mb-0 fw-bold">
                <i className="bi bi-cloud-arrow-up me-2"></i>
                Upload Document
              </h3>
              <p className="mb-0 mt-2 opacity-75 small">
                Upload Financial Reports Analysis
              </p>
            </div>

            <div className="card-body p-4">
              {/* Show success or error messages */}
              <AlertMessage 
                message={message} 
                onClose={() => setMessage({ type: '', text: '' })} 
              />

              <form onSubmit={handleSubmit}>
                {/* Drag & drop area for file selection */}
                <FileDropZone 
                  onFileSelect={handleFileSelect}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                />

                {/* Show the selected file (if any) */}
                <SelectedFileCard 
                  file={selectedFile}
                  onRemove={removeFile}
                />

                {/* Upload button */}
                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={!selectedFile || uploading}
                >
                  {uploading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Document Uploading...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-upload me-2"></i>
                      Upload Document
                    </>
                  )}
                </button>
              </form>

              {/* Show upload rules and information */}
              <UploadGuidelines />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UploadDocument;
