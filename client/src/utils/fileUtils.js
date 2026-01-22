import API_URL from '../config';

export function validateFile(file) {
  if (!file) return { valid: false, error: 'No file selected' };
  if (file.type !== 'application/pdf') return { valid: false, error: 'Only PDF files are allowed' };
  if (file.size > 10 * 1024 * 1024) return { valid: false, error: 'File size must be less than 10MB' };
  return { valid: true, error: '' };
}

export function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

export async function uploadFile(file, token) {
  if (!token) {
    throw new Error('Please login to upload files');
  }

  const formData = new FormData();
  formData.append('document', file);

  const response = await fetch(`${API_URL}/api/documents/upload`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });

  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    throw new Error('Session expired. Please login again.');
  }

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Upload failed');
  return data;
}
