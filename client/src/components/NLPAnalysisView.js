import React from 'react';
import { styles } from './NLPAnalysis.styles';
import NLPAnalysisAuditPanel from './NLPAnalysisAuditPanel';
import NLPAnalysisContentSections from './NLPAnalysisContentSections';
import { buildStats, getFinancialFigures, getSummaryText } from './NLPAnalysis.utils';

/**
 * Container view for NLP analysis output.
 * This file coordinates high-level state views and delegates detailed sections.
 */
function NLPAnalysisView({ documentName, onClose, onReprocess, loading, nlpData }) {
    // Loading state: display header and spinner while data is requested.
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

    // Not-processed state: covers in-progress and failed processing outputs.
    const isProcessed = nlpData && nlpData.nlpProcessed;

    if (!isProcessed) {
        return (
            <div style={styles.container}>
                {/* Header section */}
                <div style={styles.header}>
                    <h2>NLP Analysis: {documentName}</h2>
                    <button onClick={onClose} style={styles.closeBtn}>✕</button>
                </div>

                {(nlpData && nlpData.nlpError) ? (
                    <div style={styles.errorContainer}>
                        <i className="bi bi-exclamation-triangle-fill" style={styles.errorIcon}></i>
                        <div>
                            <h3 style={styles.errorTitle}>Processing Failed</h3>
                            <p style={styles.errorMessage}>{nlpData.nlpError}</p>
                            <button onClick={onReprocess} style={styles.retryBtn}>
                                <i className="bi bi-arrow-clockwise me-2"></i>
                                Try Again
                            </button>
                        </div>
                    </div>
                ) : (
                    <div style={styles.loading}>
                        <div style={styles.spinner}></div>
                        <h3>Processing...</h3>
                        <p>Extracting and analyzing text from document</p>
                    </div>
                )}
            </div>
        );
    }
    // Derived values are computed once and passed to child components.
    // This keeps presentation components focused on rendering instead of data shaping.
    const stats = buildStats(nlpData);
    const auditFlags = Array.isArray(nlpData.auditFlags) ? nlpData.auditFlags : [];
    const documentLabel = nlpData && nlpData.documentId ? `${documentName} (#${nlpData.documentId})` : documentName;
    const summaryText = getSummaryText(nlpData);
    const financialFigures = getFinancialFigures(nlpData);

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

            <div style={styles.content}>
                <NLPAnalysisContentSections
                    nlpData={nlpData}
                    stats={stats}
                    summaryText={summaryText}
                    financialFigures={financialFigures}
                />

                <NLPAnalysisAuditPanel
                    auditFlags={auditFlags}
                    documentLabel={documentLabel}
                />
            </div>
        </div>
    );
}

// Export this component so other files can import and use it
export default NLPAnalysisView;
