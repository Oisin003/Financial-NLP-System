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

// Small helper function that knows how to talk to the backend API.
// Keeping this outside the component makes the main component easier to read.
async function loadProcessingTimesFromApi(token) {
  const response = await fetch(`${API_URL}/api/documents/processing-times`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // If the user is not an admin, the server will respond with 403 (Forbidden).
  if (response.status === 403) {
    // We throw a special error message so the caller can show it to the user.
    throw new Error('Admin access required');
  }

  // For any other non-OK status we throw a generic error.
  if (!response.ok) {
    throw new Error('Failed to load processing times');
  }

  const data = await response.json();
  return data.documents || [];
}

function ProcessingTimes() {
  // === STATE MANAGEMENT ===
  // timingData: array with timing info for each document that has been processed.
  const [timingData, setTimingData] = useState([]);
  // loading: true while we are waiting for the server to respond.
  const [loading, setLoading] = useState(true);
  // error: holds a simple message if something goes wrong (network error, no admin rights, etc.).
  const [error, setError] = useState(null);

  // useEffect runs after the first render. The empty dependency array ([]) means:
  // "run this effect only once when the component is first shown".
  useEffect(() => {
    // Wrap our async call in a separate function (effects themselves cannot be async).
    const fetchProcessingTimes = async () => {
      try {
        const token = localStorage.getItem('token');

        // Call the helper function that actually performs the HTTP request.
        const documents = await loadProcessingTimesFromApi(token);

        // Save the documents in React state so the UI can use them.
        setTimingData(documents);
        setError(null);
      } catch (err) {
        // Any error from the helper function ends up here.
        console.error('Error fetching processing times:', err);
        setError(err.message || 'Failed to load processing times');
      } finally {
        // Whether it worked or failed, we are no longer loading.
        setLoading(false);
      }
    };

    fetchProcessingTimes();
  }, []);

  // === RENDER: LOADING STATE ===
  // While we are waiting for the server, show a very simple message.
  if (loading) {
    return (
      <div style={styles.container}>
        <h2>Processing Times (Admin)</h2>
        <p>Loading...</p>
      </div>
    );
  }

  // === RENDER: ERROR STATE ===
  // If we hit an error (for example, the user is not an admin), show a message.
  if (error) {
    return (
      <div style={styles.container}>
        <h2>Processing Times (Admin)</h2>
        <div style={styles.error}>{error}</div>
      </div>
    );
  }

  // === RENDER: SUCCESS STATE ===
  // At this point we have valid timing data and can show the main content.
  return (
    <div style={styles.container}>
      {/* Page Title */}
      <h2>
        <i className="bi bi-clock-history me-2"></i>
        NLP Processing Times (Admin View)
      </h2>

      {/* SummaryCards is a child component that only cares about totals.
          We pass simple numbers so this component stays easy to understand. */}
      <SummaryCards
        totalDocuments={getTotalDocuments(timingData)}
        averageTime={calculateAverageTime(timingData)}
      />

      {/* ProcessingTimesTable is another child component that knows how to
          render a table. We keep that logic separate from the data loading
          logic in this parent component. */}
      <ProcessingTimesTable timingData={timingData} />
    </div>
  );
}

// Export the component so it can be used in other files
export default ProcessingTimes;
