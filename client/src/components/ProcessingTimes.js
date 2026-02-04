/**
 * Processing Times Component (Admin Only)
 * 
 * This component shows all NLP processing times for documents in the system.
 * Only administrators can view this page.
 * 
 * What it does:
 * 1. Fetches timing data from the server
 * 2. Displays summary statistics (total docs, average time)
 * 3. Shows a detailed table of all processed documents
 */

// Import React hooks for state management and side effects
import React, { useState, useEffect } from 'react';

// Import the API base URL from config
import API_URL from '../config';

// Import separated components
import SummaryCards from './SummaryCards';
import ProcessingTimesTable from './ProcessingTimesTable';

// Import styles and helper functions
import { styles } from './ProcessingTimes.styles';
import { calculateAverageTime, getTotalDocuments } from './ProcessingTimes.utils';

function ProcessingTimes() {
  // STATE MANAGEMENT
  // useState creates variables that can change and trigger re-renders
  
  // Array to store all timing data from the server
  const [timingData, setTimingData] = useState([]);
  
  // Boolean to track if we're still loading data
  const [loading, setLoading] = useState(true);
  
  // String to store any error messages
  const [error, setError] = useState(null);

  // SIDE EFFECT - Runs when component first loads
  // useEffect runs code after the component renders
  useEffect(() => {
    // Fetch the timing data from the server
    fetchProcessingTimes();
  }, []); // Empty array means this only runs once on mount

  /**
   * Fetch processing times from the backend API
   * This is an async function because we need to wait for the server response
   */
  const fetchProcessingTimes = async () => {
    try {
      // Get the authentication token from browser storage
      const token = localStorage.getItem('token');
      
      // Make a GET request to the server
      const response = await fetch(`${API_URL}/api/documents/processing-times`, {
        headers: { 
          'Authorization': `Bearer ${token}` // Include token for authentication
        }
      });

      // Check if user doesn't have admin access
      if (response.status === 403) {
        setError('Admin access required');
        setLoading(false);
        return;
      }

      // Convert response to JSON format
      const data = await response.json();
      
      // Update state with the fetched data
      setTimingData(data.documents);
      setLoading(false);
      
    } catch (err) {
      // If something goes wrong, log it and show error message
      console.error('Error fetching processing times:', err);
      setError('Failed to load processing times');
      setLoading(false);
    }
  };

  // LOADING STATE
  // Show a simple loading message while data is being fetched
  if (loading) {
    return (
      <div style={styles.container}>
        <h2>Processing Times (Admin)</h2>
        <p>Loading...</p>
      </div>
    );
  }

  // ERROR STATE
  // Show error message if something went wrong
  if (error) {
    return (
      <div style={styles.container}>
        <h2>Processing Times (Admin)</h2>
        <div style={styles.error}>{error}</div>
      </div>
    );
  }

  // MAIN RENDER
  // This is what users see when data loads successfully
  return (
    <div style={styles.container}>
      {/* Page Title */}
      <h2>
        <i className="bi bi-clock-history me-2"></i>
        NLP Processing Times (Admin View)
      </h2>

      {/* Summary Statistics Cards */}
      <SummaryCards 
        totalDocuments={getTotalDocuments(timingData)}
        averageTime={calculateAverageTime(timingData)}
      />

      {/* Detailed Data Table */}
      <ProcessingTimesTable timingData={timingData} />
    </div>
  );
}

// Export the component so it can be used in other files
export default ProcessingTimes;
