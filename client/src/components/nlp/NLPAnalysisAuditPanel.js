import React, { useState } from 'react';
import { styles } from './NLPAnalysis.styles';
import { groupAuditFlags } from './NLPAnalysis.utils';
import NLPAnalysisAuditRagCard from './NLPAnalysisAuditRagCard';
import NLPAnalysisAuditFlagList from './NLPAnalysisAuditFlagList';

// Shows RAG status + grouped audit flags (with optional evidence details).
function NLPAnalysisAuditPanel({
  auditFlags,
  documentLabel,
  startOpen = false,
  hidePanelToggle = false,
  defaultExpandEvidence = false
}) {
  // Controls whether the audit panel is visible.
  const [showAuditFlags, setShowAuditFlags] = useState(startOpen);

  // Tracks which individual flags have expanded evidence.
  const [expandedAuditFlags, setExpandedAuditFlags] = useState({});

  // Utility groups flags into RAG, financial-risk, and narrative-risk buckets.
  const { ragFlag, nonRagFlags, financialRiskFlags, narrativeRiskFlags } = groupAuditFlags(auditFlags);

  // Toggle evidence for one specific flag row.
  const toggleAuditEvidence = (flagKey) => {
    setExpandedAuditFlags(prev => ({
      ...prev,
      [flagKey]: !prev[flagKey]
    }));
  };

  const toggleAuditPanel = () => setShowAuditFlags(!showAuditFlags);

  const closeAuditPanel = () => setShowAuditFlags(false);

  // Render both groups beneath the RAG card.
  const renderGroupedFlags = () => {
    if (nonRagFlags.length === 0) {
      if (!ragFlag) {
        return <p style={styles.description}>No audit flags detected with current rules.</p>;
      }
      return null;
    }

    return (
      <div style={styles.auditGroupsContainer}>
        <div style={styles.auditGroupSection}>
          <h4 style={styles.auditGroupTitle}>Financial Risk Flags</h4>
          <NLPAnalysisAuditFlagList
            flagsToRender={financialRiskFlags}
            emptyMessage="No additional financial risk flags."
            expandedAuditFlags={expandedAuditFlags}
            onToggleAuditEvidence={toggleAuditEvidence}
            expandAllEvidence={defaultExpandEvidence}
          />
        </div>
        <div style={styles.auditGroupSection}>
          <h4 style={styles.auditGroupTitle}>Narrative Risk Flags</h4>
          <NLPAnalysisAuditFlagList
            flagsToRender={narrativeRiskFlags}
            emptyMessage="No narrative risk wording flags."
            expandedAuditFlags={expandedAuditFlags}
            onToggleAuditEvidence={toggleAuditEvidence}
            expandAllEvidence={defaultExpandEvidence}
          />
        </div>
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
        {!hidePanelToggle && (
          <button
            type="button"
            style={styles.auditToggleBtn}
            onClick={toggleAuditPanel}
          >
            {showAuditFlags ? 'Hide audit flags' : 'Show audit flags'}
          </button>
        )}
        {!showAuditFlags && <p style={styles.description}></p>}
      </div>

      {showAuditFlags && (
        <div style={styles.section}>
          <div style={styles.auditPanelHeader}>
            <h3 style={{ margin: 0 }}>
              <i className="bi bi-flag-fill me-2"></i>
              RAG Audit Status for {documentLabel}
            </h3>
            {!hidePanelToggle && (
              <button
                type="button"
                style={styles.auditCloseBtn}
                onClick={closeAuditPanel}
              >
                Close
              </button>
            )}
          </div>

          <NLPAnalysisAuditRagCard ragFlag={ragFlag} />
          {renderGroupedFlags()}
        </div>
      )}
    </>
  );
}

export default NLPAnalysisAuditPanel;
