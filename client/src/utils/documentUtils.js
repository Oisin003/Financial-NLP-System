/**
 * Document Utility Functions
 * 
 * Helper functions for formatting and processing document data
 * Used throughout the document management system
 */

import API_URL from '../config';

/**
 * Convert bytes to human-readable file size
 * 
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size (e.g., "2.5 MB", "150 KB")
 * 
 * Examples:
 * - 500 bytes → "500 B"
 * - 2048 bytes → "2.00 KB"
 * - 1048576 bytes → "1.00 MB"
 */
export const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
};

/**
 * Format date for display in user interface
 * 
 * @param {string} dateString - ISO date string from database
 * @returns {string} Formatted date (e.g., "21 Jan 2026, 10:30 AM")
 * 
 * Shows: day, short month, year, hours, minutes
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Group documents by their upload month and year
 * 
 * @param {Array} documents - Array of document objects with uploadDate
 * @returns {Object} Documents grouped by month (e.g., { "January 2026": [...docs] })
 * 
 * Purpose: Organize documents into monthly folders for better navigation
 */
export const groupDocumentsByMonth = (documents) => {
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

/**
 * Download a document file from the server
 * 
 * @param {number} documentId - Database ID of the document
 * @param {string} originalName - Original filename for download
 * @returns {Promise<void>}
 * 
 * Process:
 * 1. Fetch file from server with authentication
 * 2. Create temporary download link
 * 3. Trigger browser download
 * 4. Clean up temporary resources
 */
export const downloadDocument = async (documentId, originalName) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/documents/${documentId}`, {
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
