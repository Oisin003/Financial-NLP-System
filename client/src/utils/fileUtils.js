/**
 * File Upload Utilities
 * Helper functions for file validation and formatting
 */

/**
 * Validate if a file is a valid PDF within size limits
 * @param {File} file - The file to validate
 * @returns {Object} - { valid: boolean, error: string }
 */
export function validateFile(file) {
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }

  // Check if it's a PDF
  if (file.type !== 'application/pdf') {
    return { valid: false, error: 'Only PDF files are allowed' };
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB in bytes
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }

  return { valid: true, error: '' };
}

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size (e.g., "2.5 MB")
 */
export function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

/**
 * Upload a file to the server
 * @param {File} file - The file to upload
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} - Server response
 */
export async function uploadFile(file, token) {
  const formData = new FormData();
  formData.append('document', file);

  const response = await fetch('http://localhost:8080/api/documents/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Upload failed');
  }
  
  return data;
}
