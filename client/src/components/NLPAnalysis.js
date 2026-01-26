/**
 * Simple NLP Analysis Component
 * 
 * Displays Natural Language Processing results for a PDF document
 * Shows extracted text, processed tokens, and word frequencies
 * 
 * Reference: Natural Language Processing basics
 * https://en.wikipedia.org/wiki/Natural_language_processing
 */

import React, { useState, useEffect } from 'react';
import API_URL from '../config';
import NLPAnalysisView from './NLPAnalysisView';

function NLPAnalysis({ documentId, documentName, onClose }) {
  // State to store NLP data from the server
  const [nlpData, setNlpData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch NLP data when component loads
  useEffect(() => {
    fetchNLPData();
    
    // Check every 3 seconds if document is still processing
    const interval = setInterval(() => {
      if (!nlpData?.nlpProcessed) {
        fetchNLPData();
      }
    }, 3000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId]);

  // Get NLP analysis from the server
  const fetchNLPData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/documents/${documentId}/nlp`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // 202 means still processing
      if (response.status === 202) {
        setNlpData({ nlpProcessed: false });
        setLoading(false);
        return;
      }

      const data = await response.json();
      setNlpData(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching NLP data:', err);
      setLoading(false);
    }
  };

  // Request server to reprocess the document
  const reprocessDocument = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/api/documents/${documentId}/reprocess`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setNlpData({ nlpProcessed: false });
      setLoading(true);
    } catch (err) {
      console.error('Error reprocessing:', err);
    }
  };

  return (
    <NLPAnalysisView
      documentName={documentName}
      onClose={onClose}
      onReprocess={reprocessDocument}
      loading={loading}
      nlpData={nlpData}
    />
  );
}

export default NLPAnalysis;
