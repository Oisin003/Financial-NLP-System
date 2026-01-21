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
      const response = await fetch(`http://localhost:8080/api/documents/${documentId}/nlp`, {
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
      await fetch(`http://localhost:8080/api/documents/${documentId}/reprocess`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setNlpData({ nlpProcessed: false });
      setLoading(true);
    } catch (err) {
      console.error('Error reprocessing:', err);
    }
  };

  // Show loading spinner
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h2>NLP Analysis: {documentName}</h2>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show processing status
  if (!nlpData?.nlpProcessed) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h2>NLP Analysis: {documentName}</h2>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          <h3>Processing...</h3>
          <p>Extracting and analyzing text from document</p>
        </div>
      </div>
    );
  }

  // Calculate simple statistics
  const stats = {
    textLength: nlpData.extractedText?.length || 0,
    totalWords: nlpData.processedTokens?.length || 0,
    uniqueWords: Object.keys(nlpData.wordFrequency || {}).length
  };

  return (
    <div style={styles.container}>
      {/* Header with title and buttons */}
      <div style={styles.header}>
        <h2>NLP Analysis: {documentName}</h2>
        <div>
          <button onClick={reprocessDocument} style={styles.reprocessBtn}>
            <i className="bi bi-arrow-clockwise me-2"></i>
            Reprocess
          </button>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>
      </div>

      <div style={styles.content}>
        {/* Statistics Section */}
        <div style={styles.section}>
          <h3>
            <i className="bi bi-graph-up me-2"></i>
            Statistics
          </h3>
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{stats.textLength.toLocaleString()}</div>
              <div style={styles.statLabel}>Characters</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{stats.totalWords.toLocaleString()}</div>
              <div style={styles.statLabel}>Words</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{stats.uniqueWords.toLocaleString()}</div>
              <div style={styles.statLabel}>Unique Words</div>
            </div>
          </div>
        </div>

        {/* Top Words Section */}
        <div style={styles.section}>
          <h3>
            <i className="bi bi-sort-down me-2"></i>
            Top 20 Most Frequent Words
          </h3>
          <div style={styles.wordList}>
            {nlpData.topWords.map((item, index) => (
              <div key={index} style={styles.wordItem}>
                <span style={styles.rank}>#{index + 1}</span>
                <span style={styles.word}>{item.word}</span>
                <span style={styles.count}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Extracted Text Section */}
        <div style={styles.section}>
          <h3>
            <i className="bi bi-file-text me-2"></i>
            Extracted Text
          </h3>
          <div style={styles.textBox}>
            {nlpData.extractedText}
          </div>
        </div>

        {/* Processed Tokens Section */}
        <div style={styles.section}>
          <h3>
            <i className="bi bi-tags me-2"></i>
            Processed Tokens (First 100)
          </h3>
          <p style={styles.description}>
            Words after tokenization, stopword removal, and lemmatization
          </p>
          <div style={styles.tokenBox}>
            {nlpData.processedTokens.slice(0, 100).map((token, index) => (
              <span key={index} style={styles.token}>{token}</span>
            ))}
            {nlpData.processedTokens.length > 100 && (
              <span style={styles.tokenMore}>
                +{nlpData.processedTokens.length - 100} more
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple inline styles
const styles = {
  container: {
    background: 'white',
    borderRadius: '8px',
    padding: '20px',
    maxWidth: '1000px',
    margin: '0 auto',
    maxHeight: '90vh',
    overflow: 'auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '15px',
    borderBottom: '2px solid #e0e0e0'
  },
  closeBtn: {
    background: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    marginLeft: '10px'
  },
  reprocessBtn: {
    background: '#007bff',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  section: {
    background: '#f8f9fa',
    padding: '20px',
    borderRadius: '8px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '15px',
    marginTop: '15px'
  },
  statCard: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center'
  },
  statValue: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '5px'
  },
  statLabel: {
    fontSize: '14px',
    opacity: 0.9
  },
  wordList: {
    marginTop: '15px'
  },
  wordItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px',
    marginBottom: '5px',
    background: 'white',
    borderRadius: '4px'
  },
  rank: {
    color: '#999',
    fontSize: '12px',
    width: '40px'
  },
  word: {
    flex: 1,
    fontWeight: '600',
    color: '#333'
  },
  count: {
    background: '#007bff',
    color: 'white',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '12px'
  },
  textBox: {
    background: 'white',
    padding: '15px',
    borderRadius: '4px',
    maxHeight: '300px',
    overflow: 'auto',
    whiteSpace: 'pre-wrap',
    lineHeight: '1.6',
    marginTop: '15px'
  },
  tokenBox: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '15px'
  },
  token: {
    background: '#007bff',
    color: 'white',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px'
  },
  tokenMore: {
    background: '#6c757d',
    color: 'white',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px'
  },
  description: {
    color: '#666',
    fontSize: '14px',
    margin: '10px 0 0 0'
  },
  loading: {
    textAlign: 'center',
    padding: '60px 20px'
  },
  spinner: {
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #007bff',
    borderRadius: '50%',
    width: '50px',
    height: '50px',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 20px'
  }
};

export default NLPAnalysis;
