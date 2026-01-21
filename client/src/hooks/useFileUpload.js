/**
 * Custom Hook for File Upload Logic
 * Handles all file upload state and operations
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateFile, uploadFile } from '../utils/fileUtils';

export function useFileUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  // Validate and store the selected file
  const selectFile = (file) => {
    const validation = validateFile(file);
    
    if (!validation.valid) {
      setMessage({ type: 'danger', text: validation.error });
      return;
    }

    setSelectedFile(file);
    setMessage({ type: '', text: '' });
  };

  // Remove the currently selected file
  const removeFile = () => {
    setSelectedFile(null);
    const fileInput = document.getElementById('fileInput');
    if (fileInput) fileInput.value = '';
  };

  // Upload the file to the server
  const upload = async () => {
    if (!selectedFile) {
      setMessage({ type: 'warning', text: 'Please select a file first' });
      return;
    }

    setUploading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      await uploadFile(selectedFile, token);
      
      setMessage({ 
        type: 'success', 
        text: 'Document uploaded successfully! Processing with NLP...' 
      });
      
      removeFile();
      
      // Go to documents page after 2 seconds
      setTimeout(() => navigate('/documents'), 2000);
    } catch (error) {
      console.error('Upload error:', error);
      setMessage({ 
        type: 'danger', 
        text: error.message || 'Network error. Please try again.' 
      });
    } finally {
      setUploading(false);
    }
  };

  return {
    selectedFile,
    uploading,
    message,
    selectFile,
    removeFile,
    upload,
    setMessage
  };
}
