// Import React library - this is needed for all React components
import React, { useState } from 'react';
// Import the styling object that contains all CSS styles for this component
import { styles } from './NLPAnalysis.styles';

/**
 * NLPAnalysisView Component
 */
function NLPAnalysisView({ documentName, onClose, onReprocess, loading, nlpData }) {
    // Toggle for showing the audit flags card
    const [showAuditFlags, setShowAuditFlags] = useState(false);

    // LOADING STATE:
    // While data is loading, show a spinner and nothing else.
    if (loading) {
        return (
            <div style={styles.container}>
                {/* Header section with document name and close button */}
                <div style={styles.header}>
                    <h2>NLP Analysis: {documentName}</h2>
                    <button onClick={onClose} style={styles.closeBtn}>✕</button>
                </div>
                {/* Loading animation area */}
                <div style={styles.loading}>
                    <div style={styles.spinner}></div>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    // NOT PROCESSED STATE:
    // If the document is still processing or failed, show a message.
    const isProcessed = nlpData && nlpData.nlpProcessed;

    if (!isProcessed) {
        return (
            <div style={styles.container}>
                {/* Header section */}
                <div style={styles.header}>
                    <h2>NLP Analysis: {documentName}</h2>
                    <button onClick={onClose} style={styles.closeBtn}>✕</button>
                </div>

                {/* Show an error if the server provided one */}
                {(nlpData && nlpData.nlpError) ? (
                    // Show error message with a retry button
                    <div style={styles.errorContainer}>
                        {/* Bootstrap Icon for warning triangle */}
                        <i className="bi bi-exclamation-triangle-fill" style={styles.errorIcon}></i>
                        <div>
                            <h3 style={styles.errorTitle}>Processing Failed</h3>
                            {/* Display the actual error message from the server */}
                            <p style={styles.errorMessage}>{nlpData.nlpError}</p>
                            {/* Retry button - calls onReprocess function when clicked */}
                            <button onClick={onReprocess} style={styles.retryBtn}>
                                <i className="bi bi-arrow-clockwise me-2"></i>
                                Try Again
                            </button>
                        </div>
                    </div>
                ) : (
                    // No error yet: still processing
                    <div style={styles.loading}>
                        <div style={styles.spinner}></div>
                        <h3>Processing...</h3>
                        <p>Extracting and analyzing text from document</p>
                    </div>
                )}
            </div>
        );
    }

    // CALCULATE STATISTICS:
    // Build a simple stats object, with safe defaults if data is missing.
    const stats = {
        // Total number of characters in the extracted text
        // Use 0 as default if extractedText doesn't exist
        textLength: (nlpData.extractedText && nlpData.extractedText.length) || 0,
        // Total number of words (tokens) after processing
        totalWords: (nlpData.processedTokens && nlpData.processedTokens.length) || 0,
        // Number of unique/distinct words (count the keys in wordFrequency object)
        uniqueWords: Object.keys(nlpData.wordFrequency || {}).length
    };

    // Audit flags are optional; default to an empty list if missing.
    const auditFlags = Array.isArray(nlpData.auditFlags) ? nlpData.auditFlags : [];
    // Add a friendly label that includes the document ID when available.
    const documentLabel = nlpData && nlpData.documentId ? `${documentName} (#${nlpData.documentId})` : documentName;

    // MAIN RENDER:
    // This is what displays when data is successfully loaded and processed
    return (
        <div style={styles.container}>
            {/* ==================== HEADER SECTION ==================== */}
            <div style={styles.header}>
                <h2>NLP Analysis: {documentName}</h2>
                <div>
                    {/* Reprocess button - lets user run NLP analysis again */}
                    <button onClick={onReprocess} style={styles.reprocessBtn}>
                        <i className="bi bi-arrow-clockwise me-2"></i>
                        Reprocess
                    </button>
                    {/* Close button - closes this view and returns to document list */}
                    <button onClick={onClose} style={styles.closeBtn}>✕</button>
                </div>
            </div>

            {/* ==================== CONTENT SECTION ==================== */}
            {/* Everything below is the analysis output */}
            <div style={styles.content}>
                {/* ==================== STATISTICS SECTION ==================== */}
                {/* Quick overview: characters, words, and unique words */}
                <div style={styles.section}>
                    <h3>
                        <i className="bi bi-graph-up me-2"></i>
                        Statistics
                    </h3>
                    {/* Grid layout displays three stat cards side by side */}
                    <div style={styles.statsGrid}>
                        {/* Card 1: Character count */}
                        <div style={styles.statCard}>
                            {/* toLocaleString() adds commas for readability (e.g., 1,234) */}
                            <div style={styles.statValue}>{stats.textLength.toLocaleString()}</div>
                            <div style={styles.statLabel}>Characters</div>
                        </div>
                        {/* Card 2: Total words */}
                        <div style={styles.statCard}>
                            <div style={styles.statValue}>{stats.totalWords.toLocaleString()}</div>
                            <div style={styles.statLabel}>Words</div>
                        </div>
                        {/* Card 3: Unique words */}
                        <div style={styles.statCard}>
                            <div style={styles.statValue}>{stats.uniqueWords.toLocaleString()}</div>
                            <div style={styles.statLabel}>Unique Words</div>
                        </div>
                    </div>
                </div>

                {/* ==================== AUDIT FLAGS BUTTON ==================== */}
                <div style={styles.section}>
                    <h3>
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        Audit Flags
                    </h3>
                    <button
                        type="button"
                        style={styles.auditToggleBtn}
                        onClick={() => setShowAuditFlags(!showAuditFlags)}
                    >
                        {showAuditFlags ? 'Hide audit flags' : 'Show audit flags'}
                    </button>
                    {!showAuditFlags && (
                        <p style={styles.description}></p>
                    )}
                </div>

                {showAuditFlags && (
                    <div style={styles.section}>
                        <div style={styles.auditPanelHeader}>
                            <h3 style={{ margin: 0 }}>
                                <i className="bi bi-flag-fill me-2"></i>
                                Audit Flags for {documentLabel}
                            </h3>
                            <button
                                type="button"
                                style={styles.auditCloseBtn}
                                onClick={() => setShowAuditFlags(false)}
                            >
                                Close
                            </button>
                        </div>
                        {auditFlags.length > 0 ? (
                            <div style={styles.auditList}>
                                {auditFlags.map((flag, index) => (
                                    <div key={flag.id || index} style={styles.auditItem}>
                                        <div style={styles.auditMeta}>{documentLabel}</div>
                                        <div style={styles.auditTitle}>{flag.title || 'Audit flag'}</div>
                                        <p style={styles.auditMessage}>{flag.message}</p>
                                        {flag.evidence && flag.evidence.line && (
                                            <div style={styles.auditEvidence}>
                                                Evidence: {flag.evidence.line}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={styles.description}>No audit flags detected with current rules.</p>
                        )}
                    </div>
                )}

                {/* ==================== PROCESSING TIME SECTION ==================== */}
                {/* Only show this section if timing data exists */}
                {nlpData.timing && nlpData.timing.duration && (
                    <div style={styles.section}>
                        <h3>
                            <i className="bi bi-clock-history me-2"></i>
                            Processing Time
                        </h3>
                        <div style={styles.timingInfo}>
                            {/* Show how long processing took */}
                            <div style={styles.timingItem}>
                                <span style={styles.timingLabel}>Duration:</span>
                                {/* toFixed(3) shows 3 decimal places (e.g., 0.653s) */}
                                <span style={styles.timingValue}>{nlpData.timing.duration.toFixed(3)}s</span>
                            </div>
                            {/* Show when processing started */}
                            <div style={styles.timingItem}>
                                <span style={styles.timingLabel}>Started:</span>
                                <span style={styles.timingValue}>
                                    {/* Convert timestamp to Irish date/time format */}
                                    {new Date(nlpData.timing.startTime).toLocaleString('en-IE', { dateStyle: 'short', timeStyle: 'medium' })}
                                </span>
                            </div>
                            {/* Show when processing ended */}
                            <div style={styles.timingItem}>
                                <span style={styles.timingLabel}>End Time:</span>
                                <span style={styles.timingValue}>
                                    {new Date(nlpData.timing.endTime).toLocaleString('en-IE', { dateStyle: 'short', timeStyle: 'medium' })}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* ==================== FINANCIAL FIGURES SECTION ==================== */}
                {/* Only show if figures from the NLP service are available */}
                {Array.isArray(nlpData.financial_figures) && nlpData.financial_figures.length > 0 && (
                    <div style={styles.section}>
                        <h3>
                            <i className="bi bi-currency-dollar me-2"></i>
                            Financial Figures
                        </h3>
                        <div style={styles.financialFiguresList}>
                            {/* Loop through each financial figure and display it */}
                            {nlpData.financial_figures.map((fig, idx) => (
                                // Each item needs a unique "key" prop for React to track it
                                <div key={idx} style={styles.financialFigureItem}>
                                    {/* Display the actual financial text (e.g., "$1,234.56") */}
                                    <span style={styles.financialFigureText}>{fig.text}</span>
                                    {/* Show where in the document this figure was found */}
                                    <span style={styles.financialFigureMeta}>
                                        (chars {fig.start_char}–{fig.end_char})
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ==================== TOP WORDS SECTION ==================== */}
                {/* Shows the 20 most frequently appearing words */}
                <div style={styles.section}>
                    <h3>
                        <i className="bi bi-sort-down me-2"></i>
                        Top 20 Most Frequent Words
                    </h3>
                    <div style={styles.wordList}>
                        {/* Loop through the topWords array */}
                        {nlpData.topWords.map((item, index) => (
                            <div key={index} style={styles.wordItem}>
                                {/* Show ranking number (e.g., #1, #2, #3) */}
                                <span style={styles.rank}>#{index + 1}</span>
                                {/* Show the actual word */}
                                <span style={styles.word}>{item.word}</span>
                                {/* Show how many times it appeared */}
                                <span style={styles.count}>{item.count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ==================== EXTRACTED TEXT SECTION ==================== */}
                {/* Shows the full text that was extracted from the PDF */}
                <div style={styles.section}>
                    <h3>
                        <i className="bi bi-file-text me-2"></i>
                        Extracted Text
                    </h3>
                    {/* Scrollable text box with the raw extracted text */}
                    <div style={styles.textBox}>
                        {nlpData.extractedText}
                    </div>
                </div>

                {/* ==================== PROCESSED TOKENS SECTION ==================== */}
                {/* Shows individual words after NLP processing */}
                <div style={styles.section}>
                    <h3>
                        <i className="bi bi-tags me-2"></i>
                        Processed Tokens (First 100)
                    </h3>
                    <p style={styles.description}>
                        Words after tokenization, stopword removal, and lemmatization
                    </p>
                    <div style={styles.tokenBox}>
                        {/* Show only the first 100 tokens to keep the UI fast */}
                        {nlpData.processedTokens.slice(0, 100).map((token, index) => (
                            <span key={index} style={styles.token}>{token}</span>
                        ))}
                        {/* If there are more than 100 tokens, show how many more */}
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

// Export this component so other files can import and use it
export default NLPAnalysisView;
