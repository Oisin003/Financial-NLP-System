import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateFile, uploadFile } from '../utils/fileUtils';

export function useFileUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  const selectFile = (file) => {
    const validation = validateFile(file);
    if (!validation.valid) {
      setMessage({ type: 'danger', text: validation.error });
      return;
    }
    setSelectedFile(file);
    setMessage({ type: '', text: '' });
  };

  const removeFile = () => {
    setSelectedFile(null);
    const fileInput = document.getElementById('fileInput');
    if (fileInput) fileInput.value = '';
  };

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
      setMessage({ type: 'success', text: 'Document uploaded successfully!' });
      removeFile();
      setTimeout(() => navigate('/documents'), 2000);
    } catch (error) {
      setMessage({ type: 'danger', text: error.message || 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  return { selectedFile, uploading, message, selectFile, removeFile, upload, setMessage };
}
