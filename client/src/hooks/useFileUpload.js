// Import React hook for state management
import { useState } from 'react';
// Import navigation hook from React Router (used to redirect between pages)
import { useNavigate } from 'react-router-dom';
// Import utility functions for file validation and uploading
import { validateFile, uploadFile } from '../utils/fileUtils';

/**
 * useFileUpload Custom Hook
 * 
 * This CUSTOM HOOK manages the entire file upload workflow:
 * - Selecting and validating PDF files
 * - Tracking upload progress
 * - Showing success/error messages
 * - Redirecting to documents page after successful upload
 * 
 * WHAT IT RETURNS:
 * State values and functions that components can use to handle file uploads
 * Example usage: const { selectedFile, uploading, upload } = useFileUpload();
 */
export function useFileUpload() {
  // ==================== STATE DECLARATIONS ====================
  
  // Stores the File object that the user has selected
  // null means no file is currently selected
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Boolean flag: true while file is being uploaded, false when idle
  // Used to disable buttons and show loading indicators during upload
  const [uploading, setUploading] = useState(false);
  
  // Object containing message type and text to show to the user
  // type: 'success', 'danger', 'warning', or empty string
  // text: the actual message content
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Navigation function from React Router
  // Used to programmatically redirect the user to different pages
  // Example: navigate('/documents') sends user to the documents page
  const navigate = useNavigate();

  // ==================== SELECT FILE FUNCTION ====================
  /**
   * Validates and selects a file for upload
   * 
   * @param {File} file - The File object from the file input element
   * 
   * WHAT THIS DOES:
   * 1. Validates the file (checks size, type, etc.)
   * 2. If invalid, shows error message and stops
   * 3. If valid, saves the file and clears any previous messages
   */
  const selectFile = (file) => {
    // Call the validateFile utility function to check if file is acceptable
    // Returns an object like: { valid: true/false, error: 'message' }
    const validation = validateFile(file);
    
    // If validation failed (file is too large, wrong type, etc.)
    if (!validation.valid) {
      // Show the error message to the user
      // 'danger' type displays as a red alert
      setMessage({ type: 'danger', text: validation.error });
      return; // Exit the function without saving the file
    }
    
    // File passed validation - save it to state
    setSelectedFile(file);
    // Clear any previous error messages
    setMessage({ type: '', text: '' });
  };

  // ==================== REMOVE FILE FUNCTION ====================
  /**
   * Removes the currently selected file and resets the file input
   * 
   * This is called when user clicks the X button on the selected file card
   */
  const removeFile = () => {
    // Clear the selected file from state
    setSelectedFile(null);
    
    // Also reset the actual file input element in the DOM
    // This is necessary so the user can re-select the same file if they want
    const fileInput = document.getElementById('fileInput');
    if (fileInput) fileInput.value = ''; // Clear the input value
  };

  // ==================== UPLOAD FUNCTION ====================
  /**
   * Uploads the selected file to the server
   * 
   * This is an ASYNC function because it needs to wait for the server response
   * The entire upload process includes:
   * 1. Validation check
   * 2. Upload to server
   * 3. Show success message
   * 4. Redirect to documents page after 2 seconds
   */
  const upload = async () => {
    // Safety check: make sure a file is selected
    if (!selectedFile) {
      setMessage({ type: 'warning', text: 'Please select a file first' });
      return; // Exit early if no file
    }

    // Set uploading flag to true (shows loading spinner, disables button)
    setUploading(true);
    // Clear any previous messages
    setMessage({ type: '', text: '' });

    try {
      // TRY block: code that might fail (network request)
      
      // Get the authentication token from browser storage
      // The server needs this to verify the user's identity
      const token = localStorage.getItem('token');
      
      // Call the uploadFile utility function to send the file to the server
      // This function handles the FormData creation and fetch request
      // "await" pauses execution until the upload is complete
      await uploadFile(selectedFile, token);
      
      // If upload succeeded, show success message
      // 'success' type displays as a green alert
      setMessage({ type: 'success', text: 'Document uploaded successfully!' });
      
      // Clear the selected file
      removeFile();
      
      // Wait 2 seconds (2000 milliseconds) then redirect to documents page
      // setTimeout() schedules a function to run after a delay
      // This gives the user time to see the success message
      setTimeout(() => navigate('/documents'), 2000);
      
    } catch (error) {
      // CATCH block: handles any errors that occurred during upload
      // Possible errors: network failure, server error, file too large, etc.
      
      // Show the error message to the user
      // error.message is the error text from the server or utility function
      setMessage({ type: 'danger', text: error.message || 'Upload failed' });
      
    } finally {
      // FINALLY block: runs whether upload succeeded or failed
      // Set uploading back to false (removes loading spinner, re-enables button)
      setUploading(false);
    }
  };

  // ==================== RETURN VALUES ====================
  // Return an object with all state and functions
  // Components that use this hook can destructure these values
  // Example: const { selectedFile, upload } = useFileUpload();
  return { 
    selectedFile,  // File object or null
    uploading,     // Boolean: true during upload
    message,       // Object: { type, text } for displaying alerts
    selectFile,    // Function: validate and select a file
    removeFile,    // Function: clear the selected file
    upload,        // Function: upload the file to server
    setMessage     // Function: manually set a message (used for clearing messages)
  };
}
