import React from 'react';
import { styles } from './NLPAnalysis.styles';

// Renders lower-page detail sections: frequency, raw text, and processed tokens.
function NLPAnalysisDocumentSections({ nlpData }) {
  const topWords = Array.isArray(nlpData?.topWords) ? nlpData.topWords : [];
  const processedTokens = Array.isArray(nlpData?.processedTokens) ? nlpData.processedTokens : [];

  return (
    <>
      {/* Frequent term table for quick lexical pattern review. */}
      <div style={styles.section}>
        <h3>
          <i className="bi bi-sort-down me-2"></i>
          Top 20 Most Frequent Words
        </h3>
        <div style={styles.wordList}>
          {topWords.map((item, index) => (
            <div key={index} style={styles.wordItem}>
              <span style={styles.rank}>#{index + 1}</span>
              <span style={styles.word}>{item.word}</span>
              <span style={styles.count}>{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Full extracted text displayed for manual verification. */}
      <div style={styles.section}>
        <h3>
          <i className="bi bi-file-text me-2"></i>
          Extracted Text
        </h3>
        <div style={styles.textBox}>{nlpData.extractedText}</div>
      </div>

      {/* Token sample used to inspect preprocessing output quickly. */}
      <div style={styles.section}>
        <h3>
          <i className="bi bi-tags me-2"></i>
          Processed Tokens (First 100)
        </h3>
        <p style={styles.description}>
          Words after tokenization, stopword removal, and lemmatization
        </p>
        <div style={styles.tokenBox}>
          {processedTokens.slice(0, 100).map((token, index) => (
            <span key={index} style={styles.token}>{token}</span>
          ))}
          {processedTokens.length > 100 && (
            <span style={styles.tokenMore}>+{processedTokens.length - 100} more</span>
          )}
        </div>
      </div>
    </>
  );
}

export default NLPAnalysisDocumentSections;
