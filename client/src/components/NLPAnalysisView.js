// Import React library - this is needed for all React components
import React from 'react';
// Import the styling object that contains all CSS styles for this component
import { styles } from './NLPAnalysis.styles';

/**
 * NLPAnalysisView Component
 * 
 * This component displays the detailed NLP analysis results
 * for a document. It shows statistics, processing times, financial figures, word frequencies,
 * and the extracted text.
 * 
 * PROPS (inputs this component receives):
 * @param {string} documentName - The name of the PDF file being analyzed
 * @param {function} onClose - Function to call when user clicks the close button
 * @param {function} onReprocess - Function to call when user wants to reprocess the document
 * @param {boolean} loading - True if data is still being loaded, false when ready
 * @param {object} nlpData - The NLP analysis data returned from the server
 */
function NLPAnalysisView({ documentName, onClose, onReprocess, loading, nlpData }) {
    
    // LOADING STATE:
    // If data is still loading, show a spinner animation
    // "return" stops execution here and doesn't render anything else
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
    // If the document hasn't been processed yet OR processing failed,
    // show either an error message or a processing message
    // Check if nlpData exists first, then check if nlpProcessed is true
    const isProcessed = nlpData && nlpData.nlpProcessed;
    
    if (!isProcessed) {
        return (
            <div style={styles.container}>
                {/* Header section */}
                <div style={styles.header}>
                    <h2>NLP Analysis: {documentName}</h2>
                    <button onClick={onClose} style={styles.closeBtn}>✕</button>
                </div>
                
                {/* ERROR HANDLING: Check if there's an error message from the server */}
                {/* Check if nlpData exists and has an error */}
                {(nlpData && nlpData.nlpError) ? (
                    // IF there's an error, show error message with retry button
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
                    // IF no error, document is still being processed - show spinner
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
    // Create an object with key statistics from the NLP analysis
    // Check if data exists before accessing properties to avoid errors
    const stats = {
        // Total number of characters in the extracted text
        // Use 0 as default if extractedText doesn't exist
        textLength: (nlpData.extractedText && nlpData.extractedText.length) || 0,
        // Total number of words (tokens) after processing
        totalWords: (nlpData.processedTokens && nlpData.processedTokens.length) || 0,
        // Number of unique/distinct words (count the keys in wordFrequency object)
        uniqueWords: Object.keys(nlpData.wordFrequency || {}).length
    };

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
            {/* This div contains all the analysis results */}
            {/* This div contains all the analysis results */}
            <div style={styles.content}>
                {/* ==================== STATISTICS SECTION ==================== */}
                {/* Shows quick overview: character count, word count, unique words */}
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

                {/* ==================== PROCESSING TIME SECTION ==================== */}
                {/* Only show this section IF timing data exists */}
                {/* The "&&" operator means: if left side is true, render the right side */}
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
                                    {/* Convert timestamp to Irish date/time format (DD/MM/YYYY, 24-hour) */}
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
                {/* Only show IF financial figures array exists AND has items */}
                {/* Array.isArray() checks if it's actually an array */}
                {Array.isArray(nlpData.financial_figures) && nlpData.financial_figures.length > 0 && (
                    <div style={styles.section}>
                        <h3>
                            <i className="bi bi-currency-dollar me-2"></i>
                            Financial Figures
                        </h3>
                        <div style={styles.financialFiguresList}>
                            {/* .map() loops through each financial figure and creates a display element */}
                            {/* "fig" is the current item, "idx" is its index/position */}
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
                        {/* Each "item" has: { word: "example", count: 5 } */}
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
                        {/* .slice(0, 100) takes only the first 100 tokens */}
                        {/* .map() creates a <span> for each token */}
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
