import React, { useState } from 'react';
import { styles } from './NLPAnalysis.styles';

// Shows top-level NLP results: stats, summary, trace, timing, and extracted figures.
function NLPAnalysisOverviewSection({ nlpData, stats, summaryText, financialFigures }) {
  const [showTechnicalReasons, setShowTechnicalReasons] = useState(false);

  function buildPlainSentenceReason(item) {
    const signals = item && item.signals ? item.signals : {};
    const reasons = [];

    if ((signals.figure_hits || 0) > 0) {
      reasons.push('It includes important financial amounts');
    }
    if ((signals.entity_hits || 0) > 0) {
      reasons.push('It references key entities in the document');
    }
    if ((signals.keyword_hits || 0) > 0) {
      reasons.push('It contains high-value business terms');
    }
    if (signals.contains_number) {
      reasons.push('It adds numeric evidence to the summary');
    }

    if (reasons.length === 0) {
      return 'It captures a central idea that helps explain the document.';
    }

    return `${reasons.join('. ')}.`;
  }

  function buildPlainHighlightReason(kind) {
    if (kind === 'figure') {
      return 'Highlighted because it appears to be a financially relevant amount in context.';
    }
    return 'Highlighted because it is a key named entity related to the document context.';
  }

  function buildPlainTraceReason(decision) {
    const features = decision && decision.scoring_features ? decision.scoring_features : {};
    const reasons = [];

    if ((features.figure_hits || 0) > 0) {
      reasons.push('Prioritized for including important financial figures');
    }
    if ((features.entity_hits || 0) > 0) {
      reasons.push('Includes key entities that anchor the document context');
    }
    if ((features.keyword_hits || 0) > 0) {
      reasons.push('Contains high-value business terms');
    }
    if (features.contains_number) {
      reasons.push('Adds numeric evidence to support interpretation');
    }

    if (reasons.length === 0) {
      return 'Selected because it is central to the overall meaning of the document.';
    }

    return `${reasons.join('. ')}.`;
  }

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
  const detail = hasSummaryEvaluation && summaryEvaluation.detail ? summaryEvaluation.detail : null;
  const selectedSentenceCount = detail && typeof detail.selected_sentence_count === 'number'
    ? detail.selected_sentence_count
    : 0;
  const compressionRatio = detail && typeof detail.compression_ratio === 'number'
    ? detail.compression_ratio
    : null;
  const sentenceCoverageRatio = detail && typeof detail.sentence_coverage_ratio === 'number'
    ? detail.sentence_coverage_ratio
    : null;
  const keyEntities = detail && Array.isArray(detail.key_entities) ? detail.key_entities : [];
  const keyFinancialFigures = detail && Array.isArray(detail.key_financial_figures) ? detail.key_financial_figures : [];
  const keyEntityHighlights = detail && Array.isArray(detail.key_entity_highlights)
    ? detail.key_entity_highlights
    : [];
  const keyFigureHighlights = detail && Array.isArray(detail.key_figure_highlights)
    ? detail.key_figure_highlights
    : [];
  const selectionExplanations = detail && Array.isArray(detail.selection_explanations)
    ? detail.selection_explanations
    : [];
  const candidateSentences = hasSummaryEvaluation && Array.isArray(summaryEvaluation.candidate_sentences)
    ? summaryEvaluation.candidate_sentences
    : [];

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
          <div style={styles.summaryToggleRow}>
            <span style={styles.summaryToggleNote}>Showing plain-language rationale by default.</span>
            <button
              type="button"
              style={styles.summaryToggleBtn}
              onClick={() => setShowTechnicalReasons((prev) => !prev)}
            >
              {showTechnicalReasons ? 'Hide technical scoring details' : 'Show technical scoring details'}
            </button>
          </div>
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

          {(selectedSentenceCount > 0 || compressionRatio !== null || sentenceCoverageRatio !== null) && (
            <div style={styles.summaryDetailGrid}>
              <div style={styles.summaryDetailCard}>
                <span style={styles.summaryDetailLabel}>Selected Sentences</span>
                <span style={styles.summaryDetailValue}>{selectedSentenceCount}</span>
              </div>
              {compressionRatio !== null && (
                <div style={styles.summaryDetailCard}>
                  <span style={styles.summaryDetailLabel}>Compression Ratio</span>
                  <span style={styles.summaryDetailValue}>{(compressionRatio * 100).toFixed(1)}%</span>
                </div>
              )}
              {sentenceCoverageRatio !== null && (
                <div style={styles.summaryDetailCard}>
                  <span style={styles.summaryDetailLabel}>Sentence Coverage</span>
                  <span style={styles.summaryDetailValue}>{(sentenceCoverageRatio * 100).toFixed(1)}%</span>
                </div>
              )}
            </div>
          )}

          {keyFinancialFigures.length > 0 && (
            <div style={styles.summaryMetaSection}>
              <div style={styles.summaryMetaTitle}>Key Figures In Summary Context</div>
              <div style={styles.summaryMetaTags}>
                {keyFinancialFigures.map((value) => (
                  <span key={value} style={styles.summaryMetaTag}>{value}</span>
                ))}
              </div>

              {keyFigureHighlights.length > 0 && (
                <div style={styles.summaryReasonList}>
                  {keyFigureHighlights.map((item) => (
                    <div key={`figure-${item.text}`} style={styles.summaryReasonItem}>
                      <strong>{item.text}:</strong> {buildPlainHighlightReason('figure')}
                      {showTechnicalReasons && (
                        <div style={styles.summaryTechnicalLine}>Technical: {item.why_highlighted}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {keyEntities.length > 0 && (
            <div style={styles.summaryMetaSection}>
              <div style={styles.summaryMetaTitle}>Key Entities</div>
              <div style={styles.summaryMetaTags}>
                {keyEntities.map((value) => (
                  <span key={value} style={styles.summaryMetaTag}>{value}</span>
                ))}
              </div>

              {keyEntityHighlights.length > 0 && (
                <div style={styles.summaryReasonList}>
                  {keyEntityHighlights.map((item) => (
                    <div key={`entity-${item.text}`} style={styles.summaryReasonItem}>
                      <strong>{item.text}:</strong> {buildPlainHighlightReason('entity')}
                      {showTechnicalReasons && (
                        <div style={styles.summaryTechnicalLine}>Technical: {item.why_highlighted}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {candidateSentences.length > 0 && (
            <div style={styles.summaryMetaSection}>
              <div style={styles.summaryMetaTitle}>Selected Summary Sentences</div>
              <div style={styles.summarySentenceList}>
                {candidateSentences.map((sentence, index) => (
                  <div key={`${index}-${sentence.slice(0, 24)}`} style={styles.summarySentenceItem}>
                    <span style={styles.summarySentenceIndex}>#{index + 1}</span>
                    <span>{sentence}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectionExplanations.length > 0 && (
            <div style={styles.summaryMetaSection}>
              <div style={styles.summaryMetaTitle}>Why These Sentences Were Chosen</div>
              <div style={styles.summaryReasonList}>
                {selectionExplanations.map((item) => (
                  <div key={`reason-${item.sentence_id}`} style={styles.summaryReasonItem}>
                    <strong>Sentence #{item.sentence_id}:</strong> {buildPlainSentenceReason(item)}
                    {showTechnicalReasons && (
                      <>
                        <div style={styles.summaryTechnicalLine}>Technical: {item.why_selected}</div>
                        <div style={styles.summaryTechnicalLine}>
                          Signals: figure hits {item.signals.figure_hits}, entity hits {item.signals.entity_hits}, keyword hits {item.signals.keyword_hits}, contains number {item.signals.contains_number ? 'yes' : 'no'}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
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
                  {showTechnicalReasons && <span style={styles.traceItemScore}>Score {decision.final_score}</span>}
                </div>
                <div style={styles.traceItemText}>{decision.text}</div>
                <div style={styles.tracePlainReason}>{buildPlainTraceReason(decision)}</div>
                {showTechnicalReasons && (
                  <div style={styles.summaryTechnicalLine}>
                    Technical signals: figure hits {decision.scoring_features?.figure_hits || 0}, entity hits {decision.scoring_features?.entity_hits || 0}, keyword hits {decision.scoring_features?.keyword_hits || 0}, contains number {decision.scoring_features?.contains_number ? 'yes' : 'no'}
                  </div>
                )}
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
