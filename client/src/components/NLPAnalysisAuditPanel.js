import React, { useState } from 'react';
import { styles } from './NLPAnalysis.styles';
import { formatAuditEvidenceItems, getSeverityColors, groupAuditFlags } from './NLPAnalysis.utils';

// Displays RAG status and grouped audit flags with collapsible evidence details.
function NLPAnalysisAuditPanel({ auditFlags, documentLabel }) {
  // Controls panel visibility for audit flags section.
  const [showAuditFlags, setShowAuditFlags] = useState(false);
  // Stores expanded state for individual flag evidence blocks.
  const [expandedAuditFlags, setExpandedAuditFlags] = useState({});

  // Flag groups are precomputed by utility helpers for consistent categorization.
  const { ragFlag, nonRagFlags, financialRiskFlags, narrativeRiskFlags } = groupAuditFlags(auditFlags);

  const toggleAuditEvidence = (flagKey) => {
    setExpandedAuditFlags(prev => ({
      ...prev,
      [flagKey]: !prev[flagKey]
    }));
  };

  // Renders one grouped list of flags and handles per-flag evidence expansion.
  const renderAuditFlagList = (flagsToRender, emptyMessage) => {
    if (!flagsToRender || flagsToRender.length === 0) {
      return <p style={styles.description}>{emptyMessage}</p>;
    }

    return (
      <div style={styles.auditList}>
        {flagsToRender.map((flag, index) => {
          const colors = getSeverityColors(flag.severity);
          const evidenceItems = formatAuditEvidenceItems(flag);
          const flagKey = `${flag.id || 'flag'}-${index}`;
          const isExpanded = !!expandedAuditFlags[flagKey];

          return (
            <div
              key={flag.id || index}
              style={{
                ...styles.auditItem,
                borderLeft: `4px solid ${colors.border}`,
                background: colors.bg
              }}
            >
              <div style={styles.auditMeta}>
                <span
                  style={{
                    background: colors.border,
                    color: flag.severity === 'medium' ? 'black' : 'white',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase'
                  }}
                >
                  {flag.severity}
                </span>
              </div>

              <div style={styles.auditTitle}>{flag.title || 'Audit flag'}</div>
              <p style={styles.auditMessage}>{flag.message}</p>

              {evidenceItems.length > 0 && (
                <div style={styles.auditEvidenceWrapper}>
                  <button
                    type="button"
                    style={styles.auditEvidenceToggleBtn}
                    onClick={() => toggleAuditEvidence(flagKey)}
                  >
                    {isExpanded ? 'Hide details' : 'Why flagged?'}
                  </button>

                  {isExpanded && (
                    <ul style={styles.auditEvidenceList}>
                      {evidenceItems.map((item, itemIndex) => (
                        <li key={`${flag.id || index}-evidence-${itemIndex}`} style={styles.auditEvidenceItem}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
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
        {!showAuditFlags && <p style={styles.description}></p>}
      </div>

      {showAuditFlags && (
        <div style={styles.section}>
          <div style={styles.auditPanelHeader}>
            <h3 style={{ margin: 0 }}>
              <i className="bi bi-flag-fill me-2"></i>
              RAG Audit Status for {documentLabel}
            </h3>
            <button
              type="button"
              style={styles.auditCloseBtn}
              onClick={() => setShowAuditFlags(false)}
            >
              Close
            </button>
          </div>

          {(() => {
            if (ragFlag && ragFlag.evidence && ragFlag.evidence.ragStatus) {
              const status = ragFlag.evidence.ragStatus;
              const ragColors = {
                red: { bg: '#dc3545', text: 'white', icon: 'bi-x-circle-fill' },
                amber: { bg: '#ffc107', text: 'black', icon: 'bi-exclamation-triangle-fill' },
                green: { bg: '#28a745', text: 'white', icon: 'bi-check-circle-fill' }
              };
              const color = ragColors[status] || ragColors.amber;

              return (
                <div
                  style={{
                    background: color.bg,
                    color: color.text,
                    padding: '20px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    textAlign: 'center'
                  }}
                >
                  <i
                    className={`bi ${color.icon}`}
                    style={{ fontSize: '2rem', marginBottom: '10px', display: 'block' }}
                  ></i>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '5px' }}>
                    RAG Status: {status.toUpperCase()}
                  </div>
                  <div style={{ fontSize: '0.9rem' }}>{ragFlag.message}</div>
                  <div style={{ marginTop: '15px', fontSize: '0.85rem', opacity: 0.9 }}>
                    {ragFlag.evidence.turnover !== null && (
                      <span style={{ marginRight: '15px' }}>
                        Turnover: £{ragFlag.evidence.turnover?.toLocaleString() || 'N/A'}
                      </span>
                    )}
                    {ragFlag.evidence.profitBeforeTax !== null && (
                      <span style={{ marginRight: '15px' }}>
                        PBT: £{ragFlag.evidence.profitBeforeTax?.toLocaleString() || 'N/A'}
                      </span>
                    )}
                    {ragFlag.evidence.netAssets !== null && (
                      <span>
                        Net Assets: £{ragFlag.evidence.netAssets?.toLocaleString() || 'N/A'}
                      </span>
                    )}
                  </div>
                </div>
              );
            }

            return null;
          })()}

          {nonRagFlags.length > 0 ? (
            <div style={styles.auditGroupsContainer}>
              <div style={styles.auditGroupSection}>
                <h4 style={styles.auditGroupTitle}>Financial Risk Flags</h4>
                {renderAuditFlagList(financialRiskFlags, 'No additional financial risk flags.')}
              </div>
              <div style={styles.auditGroupSection}>
                <h4 style={styles.auditGroupTitle}>Narrative Risk Flags</h4>
                {renderAuditFlagList(narrativeRiskFlags, 'No narrative risk wording flags.')}
              </div>
            </div>
          ) : (
            !ragFlag && <p style={styles.description}>No audit flags detected with current rules.</p>
          )}
        </div>
      )}
    </>
  );
}

export default NLPAnalysisAuditPanel;
