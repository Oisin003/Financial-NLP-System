import React from 'react';
import { styles } from './NLPAnalysis.styles';
import { formatAuditEvidenceItems, getSeverityColors } from './NLPAnalysis.utils';

function NLPAnalysisAuditFlagList({
  flagsToRender,
  emptyMessage,
  expandedAuditFlags,
  onToggleAuditEvidence
}) {
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
                  onClick={() => onToggleAuditEvidence(flagKey)}
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
}

export default NLPAnalysisAuditFlagList;
