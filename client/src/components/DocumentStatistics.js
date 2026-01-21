/**
 * DocumentStatistics Component
 * 
 * Shows overview statistics about documents:
 * - Total number of documents
 * - Number of months with uploads
 * - Total storage used
 * 
 * Each stat has:
 * - Colored icon
 * - Large number
 * - Descriptive label
 * 
 * Props:
 * - documents: Array of all documents
 * - groupedDocuments: Documents organized by month
 */

import React from 'react';
import { formatFileSize } from '../utils/documentUtils';

function DocumentStatistics({ documents, groupedDocuments }) {
  // Calculate total storage used across all documents
  const totalSize = documents.reduce((sum, doc) => sum + doc.fileSize, 0);
  
  // Count how many different months have documents
  const monthsCount = Object.keys(groupedDocuments).length;

  return (
    <div className="card">
      <div className="card-body">
        {/* Section heading with icon */}
        <h5 className="text-center mb-3">
          <i className="bi bi-bar-chart-fill me-2 text-primary"></i>
          Document Statistics
        </h5>
        
        <div className="row text-center">
          {/* Total Documents Card */}
          <div className="col-md-4">
            <div className="card bg-light">
              <div className="card-body py-4">
                {/* Blue circle with files icon */}
                <div 
                  className="bg-primary text-white rounded-circle mb-2" 
                  style={{
                    width: '50px', 
                    height: '50px', 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    justifyContent: 'center'
                  }}
                >
                  <i className="bi bi-files fs-4"></i>
                </div>
                {/* Big number showing document count */}
                <h3>{documents.length}</h3>
                {/* Label explaining what the number means */}
                <small className="text-muted">Total Documents</small>
              </div>
            </div>
          </div>
          
          {/* Months Active Card */}
          <div className="col-md-4">
            <div className="card bg-light h-100">
              <div className="card-body py-4">
                {/* Cyan circle with calendar icon */}
                <div 
                  className="bg-info text-white rounded-circle mb-2" 
                  style={{
                    width: '50px', 
                    height: '50px', 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    justifyContent: 'center'
                  }}
                >
                  <i className="bi bi-calendar3 fs-4"></i>
                </div>
                {/* Big number showing months with uploads */}
                <h3 className="mb-1 fw-bold">{monthsCount}</h3>
                {/* Label */}
                <small className="text-muted">Months</small>
              </div>
            </div>
          </div>
          
          {/* Total Storage Card */}
          <div className="col-md-4">
            <div className="card bg-light h-100">
              <div className="card-body py-4">
                {/* Green circle with hard drive icon */}
                <div 
                  className="bg-success text-white rounded-circle mb-2" 
                  style={{
                    width: '50px', 
                    height: '50px', 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    justifyContent: 'center'
                  }}
                >
                  <i className="bi bi-hdd-fill fs-4"></i>
                </div>
                {/* Big number showing total storage (formatted) */}
                <h3 className="mb-1 fw-bold">
                  {formatFileSize(totalSize)}
                </h3>
                {/* Label */}
                <small className="text-muted">Total Size</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentStatistics;
