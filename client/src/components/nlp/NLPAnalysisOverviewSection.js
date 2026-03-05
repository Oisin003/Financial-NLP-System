import React from 'react';
import { styles } from './NLPAnalysis.styles';

// Shows top-level NLP results: stats, summary, trace, timing, and extracted figures.
function NLPAnalysisOverviewSection({ nlpData, stats, summaryText, financialFigures }) {
  // Optional evaluation block returned by backend.
  const summaryEvaluation = nlpData && nlpData.summary_evaluation ? nlpData.summary_evaluation : null;
  const hasSummaryEvaluation = !!summaryEvaluation;

  // Safe counts with defaults for missing values.
  const candidateTokenCount = hasSummaryEvaluation && Array.isArray(summaryEvaluation.candidate_tokens)
    ? summaryEvaluation.candidate_tokens.length
    : 0;
  const sourceSentenceCount = hasSummaryEvaluation && summaryEvaluation.source_sentence_count
    ? summaryEvaluation.source_sentence_count
    : 0;

  // Optional explainability block describing sentence selection.
  const decisionTraceSummary = nlpData && nlpData.decision_trace && nlpData.decision_trace.summary
    ? nlpData.decision_trace.summary
    : null;
  const selectedTraceDecisions = decisionTraceSummary && Array.isArray(decisionTraceSummary.sentence_decisions)
    ? decisionTraceSummary.sentence_decisions.filter(function(decision) {
      return decision.selected;
    })
    : [];

  // Timing section appears only when duration exists.
  const hasTiming = nlpData && nlpData.timing && nlpData.timing.duration;

  return (
    <>
      {/* Quick snapshot numbers for the document. */}
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

      {/* Auto-generated summary returned by backend. */}
      {summaryText && (
        <div style={styles.section}>
          <h3>
            <i className="bi bi-card-text me-2"></i>
            Executive Summary
          </h3>
          <div style={styles.summaryBox}>{summaryText}</div>
        </div>
      )}

      {hasSummaryEvaluation && (
        <div style={styles.section}>
          <h3>
            <i className="bi bi-check2-square me-2"></i>
            Summary Evaluation Pack
          </h3>
          <div style={styles.evaluationGrid}>
            <div style={styles.evaluationCard}>
              <span style={styles.evaluationLabel}>Candidate Tokens</span>
              <span style={styles.evaluationValue}>{candidateTokenCount}</span>
            </div>
            <div style={styles.evaluationCard}>
              <span style={styles.evaluationLabel}>Source Sentences</span>
              <span style={styles.evaluationValue}>{sourceSentenceCount}</span>
            </div>
            <div style={styles.evaluationCard}>
              <span style={styles.evaluationLabel}>Metrics Ready</span>
              <span style={styles.evaluationValue}>ROUGE + BLEU</span>
            </div>
          </div>
        </div>
      )}

      {decisionTraceSummary && (
        <div style={styles.section}>
          <h3>
            <i className="bi bi-diagram-3 me-2"></i>
            Explainability Trace
          </h3>
          <div style={styles.traceRuleBox}>
            <strong>Summary rule:</strong> {decisionTraceSummary.rule}
          </div>
          <div style={styles.traceList}>
            {selectedTraceDecisions.map((decision) => (
              <div key={decision.id} style={styles.traceItem}>
                <div style={styles.traceItemHeader}>
                  <span style={styles.traceItemTitle}>Sentence #{decision.id}</span>
                  <span style={styles.traceItemScore}>Score {decision.final_score}</span>
                </div>
                <div style={styles.traceItemText}>{decision.text}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Processing runtime details. */}
      {hasTiming && (
        <div style={styles.section}>
          <h3>
            <i className="bi bi-clock-history me-2"></i>
            Processing Time
          </h3>
          <div style={styles.timingInfo}>
            <div style={styles.timingItem}>
              <span style={styles.timingLabel}>Duration:</span>
              <span style={styles.timingValue}>{nlpData.timing.duration.toFixed(3)}s</span>
            </div>
            <div style={styles.timingItem}>
              <span style={styles.timingLabel}>Started:</span>
              <span style={styles.timingValue}>
                {new Date(nlpData.timing.startTime).toLocaleString('en-IE', { dateStyle: 'short', timeStyle: 'medium' })}
              </span>
            </div>
            <div style={styles.timingItem}>
              <span style={styles.timingLabel}>End Time:</span>
              <span style={styles.timingValue}>
                {new Date(nlpData.timing.endTime).toLocaleString('en-IE', { dateStyle: 'short', timeStyle: 'medium' })}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Extracted figures that may support financial review. */}
      {financialFigures.length > 0 && (
        <div style={styles.section}>
          <h3>
            <i className="bi bi-currency-dollar me-2"></i>
            Financial Figures
          </h3>
          <div style={styles.financialFiguresList}>
            {financialFigures.map((fig, idx) => (
              <div key={idx} style={styles.financialFigureItem}>
                <span style={styles.financialFigureText}>{fig.text}</span>
                <span style={styles.financialFigureMeta}>
                  (chars {fig.start_char}–{fig.end_char})
                </span>
                {fig.context && <div style={styles.financialFigureContext}>{fig.context}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default NLPAnalysisOverviewSection;
