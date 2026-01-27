import React from 'react';
import { styles } from './NLPAnalysis.styles';

function NLPAnalysisView({ documentName, onClose, onReprocess, loading, nlpData }) {
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

    const stats = {
        textLength: nlpData.extractedText?.length || 0,
        totalWords: nlpData.processedTokens?.length || 0,
        uniqueWords: Object.keys(nlpData.wordFrequency || {}).length
    };

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

                <div style={styles.section}>
                    <h3>
                        <i className="bi bi-file-text me-2"></i>
                        Extracted Text
                    </h3>
                    <div style={styles.textBox}>
                        {nlpData.extractedText}
                    </div>
                </div>

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

export default NLPAnalysisView;
