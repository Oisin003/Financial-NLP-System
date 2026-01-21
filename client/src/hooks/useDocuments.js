/**
 * Custom Hook: useDocuments
 * 
 * Manages all document-related operations in one place:
 * - Fetching documents from the server
 * - Deleting documents
 * - Loading and error states
 * - Current user information
 * 
 * Benefits:
 * - Separates data logic from UI components
 * - Reusable across different components
 * - Easier to test and maintain
 */

import { useState, useEffect } from 'react';

export const useDocuments = () => {
  // State for storing the list of documents
  const [documents, setDocuments] = useState([]);
  
  // Loading state while fetching from server
  const [loading, setLoading] = useState(true);
  
  // Error message if something goes wrong
  const [error, setError] = useState('');
  
  // Track which document is being deleted (for spinner)
  const [deletingId, setDeletingId] = useState(null);
  
  // Store current logged-in user info
  const [currentUser, setCurrentUser] = useState(null);

  /**
   * Fetch all documents when component mounts
   * Also loads current user from localStorage
   */
  useEffect(() => {
    // Get logged-in user information
    const userData = localStorage.getItem('user');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
    
    // Load documents from server
    fetchDocuments();
  }, []);

  /**
   * Fetch documents from the server
   * 
   * Process:
   * 1. Get authentication token from localStorage
   * 2. Send request to backend API
   * 3. Update documents state with response
   * 4. Handle any errors that occur
   */
  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/documents', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents);
      } else {
        setError('Failed to load documents');
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Network error. Please try again.');
    } finally {
      // Stop loading spinner
      setLoading(false);
    }
  };

  /**
   * Delete a document
   * 
   * @param {number} documentId - ID of document to delete
   * 
   * Process:
   * 1. Ask user to confirm deletion
   * 2. Send DELETE request to server
   * 3. Remove document from local state if successful
   * 4. Show error if deletion fails
   */
  const handleDelete = async (documentId) => {
    // Safety check: confirm with user before deleting
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    // Show loading spinner on delete button
    setDeletingId(documentId);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Remove document from UI immediately
        setDocuments(documents.filter(doc => doc.id !== documentId));
      } else {
        alert('Failed to delete document');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Network error. Please try again.');
    } finally {
      // Hide loading spinner
      setDeletingId(null);
    }
  };

  // Return all state and functions for components to use
  return {
    documents,
    loading,
    error,
    deletingId,
    currentUser,
    handleDelete,
    fetchDocuments
  };
};
