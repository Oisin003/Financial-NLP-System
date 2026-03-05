import React from 'react';
import { styles } from './NLPAnalysis.styles';
import NLPAnalysisAuditPanel from './NLPAnalysisAuditPanel';
import NLPAnalysisContentSections from './NLPAnalysisContentSections';
import { buildStats, getFinancialFigures, getSummaryText } from './NLPAnalysis.utils';

/**
 * Main page for NLP analysis results.
 *
 * Beginner note:
 * - This component decides WHICH screen to show (loading, error, processing, or final results).
 * - Child components render the detailed UI sections.
 */
function NLPAnalysisView({ documentName, onClose, onReprocess, loading, nlpData }) {
    // 1) Show loading UI while we are fetching data.
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

    // 2) If NLP is not finished yet, show either an error card or a processing state.
    const hasProcessedData = nlpData && nlpData.nlpProcessed;

    if (!hasProcessedData) {
        return (
            <div style={styles.container}>
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

    // 3) NLP finished successfully: prepare values once, then pass to child sections.
    const stats = buildStats(nlpData);
    const auditFlags = Array.isArray(nlpData.auditFlags) ? nlpData.auditFlags : [];
    const auditDocumentLabel = nlpData && nlpData.documentId
        ? `${documentName} (#${nlpData.documentId})`
        : documentName;
    const summaryText = getSummaryText(nlpData);
    const financialFigures = getFinancialFigures(nlpData);

    // 4) Final results screen.
    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2>NLP Analysis: {documentName}</h2>
                <div>
                    <button onClick={onReprocess} style={styles.reprocessBtn}>
                        <i className="bi bi-arrow-clockwise me-2"></i>
                        Reprocess
                    </button>
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
                    documentLabel={auditDocumentLabel}
                />
            </div>
        </div>
    );
}

export default NLPAnalysisView;
