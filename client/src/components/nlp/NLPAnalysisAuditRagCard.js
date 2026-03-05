import React from 'react';

function NLPAnalysisAuditRagCard({ ragFlag }) {
  if (!ragFlag || !ragFlag.evidence || !ragFlag.evidence.ragStatus) {
    return null;
  }

  const ragStatusColors = {
    red: { bg: '#dc3545', text: 'white', icon: 'bi-x-circle-fill' },
    amber: { bg: '#ffc107', text: 'black', icon: 'bi-exclamation-triangle-fill' },
    green: { bg: '#28a745', text: 'white', icon: 'bi-check-circle-fill' }
  };

  const status = ragFlag.evidence.ragStatus;
  const color = ragStatusColors[status] || ragStatusColors.amber;

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

export default NLPAnalysisAuditRagCard;
