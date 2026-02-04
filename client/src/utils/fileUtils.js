// Import the API base URL from configuration
import API_URL from '../config';

/**
 * Validates if a file meets upload requirements
 * Returns an object with validation result and error message if invalid
 */
export function validateFile(file) {
  // Check if file exists
  if (!file) return { valid: false, error: 'No file selected' };
  
  // Check if file is a PDF
  if (file.type !== 'application/pdf') return { valid: false, error: 'Only PDF files are allowed' };
  
  // Check file size (10MB = 10 * 1024 * 1024 bytes)
  if (file.size > 10 * 1024 * 1024) return { valid: false, error: 'File size must be less than 10MB' };
  
  // All checks passed
  return { valid: true, error: '' };
}

/**
 * Converts bytes to human-readable format (B, KB, or MB)
 * Example: 2048 bytes becomes "2.00 KB"
 */
export function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

/**
 * Uploads a file to the server
 * Returns the server response data on success, throws error on failure
 */
export async function uploadFile(file, token) {
  // Check if user is logged in
  if (!token) {
    throw new Error('Please login to upload files');
  }

  // Create FormData object to send the file
  const formData = new FormData();
  formData.append('document', file);

  // Send POST request to upload endpoint
  const response = await fetch(`${API_URL}/api/documents/upload`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });

  // Handle expired session (401 Unauthorized)
  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    throw new Error('Session expired. Please login again.');
  }

  // Parse response and handle errors
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Upload failed');
  return data;
}
