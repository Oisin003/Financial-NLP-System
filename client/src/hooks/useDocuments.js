// Import React hooks for state management and side effects
import { useState, useEffect } from 'react';
// Import the API base URL from configuration
import API_URL from '../config';

/**
 * useDocuments Custom Hook
 * 
 * This is a CUSTOM HOOK - a reusable function that manages document-related state and logic.
 * Custom hooks let multiple components share the same stateful logic without repeating code.
 * 
 * WHAT IT DOES:
 * - Fetches the list of documents from the server
 * - Manages loading states and errors
 * - Handles document deletion
 * - Tracks the currently logged-in user
 * 
 * WHAT IT RETURNS:
 * An object with: documents array, loading status, error messages, delete function, etc.
 * Components can use these by calling: const { documents, loading } = useDocuments();
 */
export const useDocuments = () => {
  // ==================== STATE DECLARATIONS ====================
  // STATE is data that can change over time and causes re-renders when updated

  // Array of document objects fetched from the server
  // Initial value is an empty array []
  const [documents, setDocuments] = useState([]);

  // Boolean flag: true while fetching data, false when done
  // Starts as true because data loads immediately on mount
  const [loading, setLoading] = useState(true);

  // String to store error messages (empty string means no error)
  const [error, setError] = useState('');

  // ID of the document currently being deleted (null means nothing is being deleted)
  // This is used to show a loading spinner on the specific delete button
  const [deletingId, setDeletingId] = useState(null);

  // Object containing the logged-in user's data (username, role, etc.)
  // null means no user is logged in
  const [currentUser, setCurrentUser] = useState(null);

  // ==================== SIDE EFFECT: RUN ONCE ON MOUNT ====================
  // useEffect runs code after the component renders
  // The empty array [] means this runs only ONCE when the component first loads
  useEffect(() => {
    // Try to get user data from browser's localStorage (data that persists after refresh)
    const userData = localStorage.getItem('user');
    // If user data exists, parse the JSON string and save it to state
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }

    // Fetch the documents from the server
    fetchDocuments();
  }, []); // Empty dependency array = run only once on component mount

  // ==================== FETCH DOCUMENTS FUNCTION ====================
  /**
   * Fetches all documents from the server
   * 
   * This is an ASYNC function because it needs to wait for the server response
   * The "await" keyword pauses execution until the fetch is complete
   */
  const fetchDocuments = async () => {
    try {
      // TRY block: code that might fail (like network requests)

      // Get the authentication token from browser storage
      // This token proves the user is logged in
      const token = localStorage.getItem('token');

      // If no token exists, user is not logged in
      if (!token) {
        setError('Please login to view documents');
        setLoading(false); // Stop showing loading spinner
        return; // Exit the function early
      }

      // Make an HTTP GET request to the documents endpoint
      // Include the auth token in the headers so the server knows who is requesting
      const response = await fetch(`${API_URL}/api/documents`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Check if the server returned 401 (Unauthorized)
      // This means the token expired or is invalid
      if (response.status === 401) {
        // Clear old login data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setError('Session expired. Please login again.');
        // Redirect user to login page
        window.location.href = '/login';
        return;
      }

      // Check if the request was successful (status 200-299)
      if (response.ok) {
        // Parse the JSON response body into a JavaScript object
        const data = await response.json();
        // Update the documents state with the fetched data
        setDocuments(data.documents);
      } else {
        // Request failed (status 400-599)
        setError('Failed to load documents');
      }
    } catch (err) {
      // CATCH block: handles any errors that occurred in the TRY block
      // This catches network errors, parsing errors, etc.
      setError('Network error. Please try again.');
    } finally {
      // FINALLY block: runs whether try/catch succeeded or failed
      // Stop showing the loading spinner
      setLoading(false);
    }
  };

  // ==================== DELETE DOCUMENT FUNCTION ====================
  /**
   * Deletes a document from the server and updates the local list
   * 
   * @param {number} documentId - The ID of the document to delete
   */
  const handleDelete = async (documentId) => {
    // Show a confirmation dialog to prevent accidental deletions
    // window.confirm() returns true if user clicks "OK", false if "Cancel"
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    // Set this document ID as "currently deleting" to show a loading indicator
    setDeletingId(documentId);

    try {
      // Get the auth token (needed for server to verify the user's permission)
      const token = localStorage.getItem('token');

      // Make an HTTP DELETE request to remove the document
      // The document ID is included in the URL path
      const response = await fetch(`${API_URL}/api/documents/${documentId}`, {
        method: 'DELETE', // Specify this is a DELETE operation
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Check if deletion was successful
      if (response.ok) {
        // Update the local documents array by filtering out the deleted document
        // .filter() creates a new array containing only items that pass the test
        // Here: keep all documents EXCEPT the one that matches documentId
        const updatedDocuments = documents.filter(function(doc) {
          return doc.id !== documentId;
        });
        setDocuments(updatedDocuments);
      } else {
        // Server returned an error (403 Forbidden, 404 Not Found, etc.)
        alert('Failed to delete document');
      }
    } catch (err) {
      // Handle network errors or other exceptions
      alert('Network error. Please try again.');
    } finally {
      // Clear the "deleting" state (removes loading indicator from button)
      // This runs whether deletion succeeded or failed
      setDeletingId(null);
    }
  };

  // ==================== RETURN VALUES ====================
  // Return an object containing all the state and functions
  // Components that use this hook can access these values
  // Example: const { documents, loading, handleDelete } = useDocuments();
  return {
    documents,       // Array of document objects
    loading,         // Boolean: true while fetching
    error,           // String: error message or empty
    deletingId,      // Number or null: ID of document being deleted
    currentUser,     // Object or null: logged-in user data
    handleDelete,    // Function: delete a document
    fetchDocuments   // Function: refresh the document list
  };
};
