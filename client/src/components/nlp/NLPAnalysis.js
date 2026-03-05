/**
 * Simple NLP Analysis Component
 * 
 * Displays Natural Language Processing results for a PDF document
 * Shows extracted text, processed tokens, and word frequencies
 * 
 * Reference: Natural Language Processing basics
 * https://en.wikipedia.org/wiki/Natural_language_processing
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import API_URL from '../../config';
import NLPAnalysisView from './NLPAnalysisView';

// Small helper that knows how to fetch NLP data for a single document.
// This keeps the main component focused on "when" to load data,
// instead of "how" the HTTP request is made.
async function fetchNlpDataFromApi(documentId, token) {
  const response = await fetch(`${API_URL}/api/documents/${documentId}/nlp`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  // 202 means the document has been accepted but is still being processed.
  if (response.status === 202) {
    return { nlpProcessed: false };
  }

  // For other status codes we assume the backend returns JSON with details.
  const data = await response.json();
  return data;
}

// Helper used when the user requests a manual reprocess.
async function requestReprocess(documentId, token) {
  const response = await fetch(`${API_URL}/api/documents/${documentId}/reprocess`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('Failed to start reprocessing');
  }
}

function NLPAnalysis({ documentId, documentName, onClose }) {
  // === STATE ===
  // nlpData: the analysis result returned by the backend (text, tokens, flags, etc.).
  const [nlpData, setNlpData] = useState(null);
  // loading: true whenever we are waiting for a response from the server.
  const [loading, setLoading] = useState(true);

  // latestNlpDataRef lets us read the "current" nlpData value inside
  // callbacks (like setInterval) without depending directly on state.
  const latestNlpDataRef = useRef(null);

  // Keep the ref updated whenever nlpData changes.
  useEffect(() => {
    latestNlpDataRef.current = nlpData;
  }, [nlpData]);

  // This function loads NLP data once, given the current document id.
  // useCallback is used so that React sees a stable function reference,
  // which helps when we list it in the dependency array for useEffect.
  const loadNlpData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const data = await fetchNlpDataFromApi(documentId, token);
      setNlpData(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching NLP data:', err);
      setLoading(false);
    }
  }, [documentId]);

  // When the component mounts (or documentId changes), fetch NLP data.
  // Also set up a simple polling interval that keeps checking the server
  // while the document is still being processed.
  useEffect(() => {
    loadNlpData();

    const intervalId = setInterval(() => {
      const current = latestNlpDataRef.current;
      // If we know processing is still ongoing, ask for an update.
      if (current && !current.nlpProcessed) {
        loadNlpData();
      }
    }, 3000);

    // Cleanup function: stop the interval when component unmounts
    // or when documentId/loadNlpData changes.
    return () => clearInterval(intervalId);
  }, [loadNlpData]);

  // Called when the user presses the "Reprocess" button inside the view.
  const handleReprocess = async () => {
    try {
      const token = localStorage.getItem('token');
      await requestReprocess(documentId, token);

      // Set state so the UI clearly shows that processing has started again.
      setNlpData({ nlpProcessed: false });
      setLoading(true);

      // Kick off a fresh fetch.
      loadNlpData();
    } catch (err) {
      console.error('Error reprocessing:', err);
    }
  };

  // Delegate all the actual UI rendering to NLPAnalysisView.
  // This component is now focused just on data loading and state.
  return (
    <NLPAnalysisView
      documentName={documentName}
      onClose={onClose}
      onReprocess={handleReprocess}
      loading={loading}
      nlpData={nlpData}
    />
  );
}

export default NLPAnalysis;
