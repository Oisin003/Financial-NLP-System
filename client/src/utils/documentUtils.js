/**
 * Document Utility Functions
 * 
 * Helper functions for formatting and processing document data
 * Used throughout the document management system
 */

import API_URL from '../config';

/**
 * Convert bytes to human-readable file size
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
 * @returns {string} Formatted date 
 * 
 * Shows: day, short month, year, hours, minutes
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IE', {
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
 * @returns {Object} Documents grouped by month 
 * 
 * Purpose: Organize documents into monthly folders for better navigation
 * 
 * Example output:
 * {
 *   "January 2026": [doc1, doc2],
 *   "December 2025": [doc3]
 * }
 */
export function groupDocumentsByMonth(documents) {
  // Create an empty object to hold our grouped documents
  const documentsByMonth = {};

  // Loop through each document one at a time
  for (let i = 0; i < documents.length; i++) {
    const currentDocument = documents[i];
    
    // Get the upload date and convert it to a Date object
    const uploadDate = new Date(currentDocument.uploadDate);
    
    // Create a readable month-year string like "January 2026"
    const monthYearString = uploadDate.toLocaleDateString('en-IE', { 
      month: 'long', 
      year: 'numeric' 
    });
    
    // Check if this month already exists in our grouped object
    const monthAlreadyExists = documentsByMonth[monthYearString] !== undefined;
    
    if (!monthAlreadyExists) {
      // If this is the first document for this month, create an empty array
      documentsByMonth[monthYearString] = [];
    }
    
    // Add the current document to its month's array
    documentsByMonth[monthYearString].push(currentDocument);
  }

  return documentsByMonth;
}

/**
 * Download a document file from the server
 * 
 * @param {number} documentId - Database ID of the document
 * @param {string} originalName - Original filename for download
 * @returns {Promise<void>}
 * 
 * How this works:
 * 1. Fetch the file data from the server (with authentication)
 * 2. Convert the response to a "blob" (binary data)
 * 3. Create a temporary link element
 * 4. Set the link to download the blob as a file
 * 5. Click the link programmatically to start download
 * 6. Clean up the temporary link
 */
export async function downloadDocument(documentId, originalName) {
  try {
    // Step 1: Get the authentication token
    const authToken = localStorage.getItem('token');
    
    // Step 2: Fetch the file from the server
    const serverResponse = await fetch(`${API_URL}/api/documents/${documentId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    // Step 3: Check if the request was successful
    if (!serverResponse.ok) {
      alert('Failed to download document');
      return;
    }
    
    // Step 4: Convert response to binary data (blob)
    const fileData = await serverResponse.blob();
    
    // Step 5: Create a temporary URL for the blob
    const temporaryUrl = window.URL.createObjectURL(fileData);
    
    // Step 6: Create a temporary link element
    const downloadLink = document.createElement('a');
    downloadLink.href = temporaryUrl;
    downloadLink.download = originalName;  // Set the filename for download
    
    // Step 7: Add link to page, click it, then remove it
    document.body.appendChild(downloadLink);
    downloadLink.click();
    
    // Step 8: Clean up - remove the temporary URL and link
    window.URL.revokeObjectURL(temporaryUrl);
    document.body.removeChild(downloadLink);
    
  } catch (networkError) {
    console.error('Download error:', networkError);
    alert('Network error. Please try again.');
  }
}
