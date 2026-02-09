// Shared styles for NLPAnalysis UI
export const styles = {
  container: {
    background: 'white',
    borderRadius: '8px',
    padding: '20px',
    maxWidth: '1000px',
    margin: '0 auto',
    maxHeight: '90vh',
    overflow: 'auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '15px',
    borderBottom: '2px solid #e0e0e0'
  },
  closeBtn: {
    background: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    marginLeft: '10px'
  },
  reprocessBtn: {
    background: '#007bff',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  section: {
    background: '#f8f9fa',
    padding: '20px',
    borderRadius: '8px'
  },
  auditList: {
    marginTop: '15px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  auditItem: {
    background: 'white',
    borderRadius: '6px',
    padding: '12px 14px',
    borderLeft: '4px solid #dc3545'
  },
  auditTitle: {
    fontWeight: '700',
    marginBottom: '4px',
    color: '#842029'
  },
  auditMeta: {
    fontSize: '12px',
    color: '#6c757d',
    marginBottom: '6px'
  },
  auditToggleBtn: {
    background: '#fff3cd',
    color: '#664d03',
    border: '1px solid #ffecb5',
    padding: '8px 14px',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  auditPanelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  auditCloseBtn: {
    background: '#6c757d',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  auditMessage: {
    margin: 0,
    color: '#5c1c1c'
  },
  auditEvidence: {
    marginTop: '6px',
    fontSize: '12px',
    color: '#6c757d'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '15px',
    marginTop: '15px'
  },
  statCard: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center'
  },
  statValue: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '5px'
  },
  statLabel: {
    fontSize: '14px',
    opacity: 0.9
  },
  wordList: {
    marginTop: '15px'
  },
  wordItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px',
    marginBottom: '5px',
    background: 'white',
    borderRadius: '4px'
  },
  // --- Financial Figures Styles ---
  financialFiguresList: {
    marginTop: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  financialFigureItem: {
    background: '#e3f7e8',
    borderRadius: '4px',
    padding: '8px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontWeight: 500,
    fontSize: '16px',
  },
  financialFigureText: {
    color: '#218838',
    fontWeight: 600,
    fontSize: '16px',
  },
  financialFigureMeta: {
    color: '#555',
    fontSize: '13px',
    marginLeft: '8px',
  },
  // --- Timing Information Styles ---
  timingInfo: {
    marginTop: '15px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  timingItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 15px',
    background: 'white',
    borderRadius: '4px',
    borderLeft: '4px solid #17a2b8'
  },
  timingLabel: {
    fontWeight: '600',
    color: '#555',
    fontSize: '14px'
  },
  timingValue: {
    color: '#17a2b8',
    fontWeight: 'bold',
    fontSize: '16px'
  },
  // -------------------------------
  rank: {
    color: '#999',
    fontSize: '12px',
    width: '40px'
  },
  word: {
    flex: 1,
    fontWeight: '600',
    color: '#333'
  },
  count: {
    background: '#007bff',
    color: 'white',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '12px'
  },
  textBox: {
    background: 'white',
    padding: '15px',
    borderRadius: '4px',
    maxHeight: '300px',
    overflow: 'auto',
    whiteSpace: 'pre-wrap',
    lineHeight: '1.6',
    marginTop: '15px'
  },
  tokenBox: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '15px'
  },
  token: {
    background: '#007bff',
    color: 'white',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px'
  },
  tokenMore: {
    background: '#6c757d',
    color: 'white',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px'
  },
  description: {
    color: '#666',
    fontSize: '14px',
    margin: '10px 0 0 0'
  },
  loading: {
    textAlign: 'center',
    padding: '60px 20px'
  },
  spinner: {
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #007bff',
    borderRadius: '50%',
    width: '50px',
    height: '50px',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 20px'
  },
  // --- Error Display Styles ---
  errorContainer: {
    background: '#fff3cd',
    border: '2px solid #ffc107',
    borderRadius: '8px',
    padding: '30px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '20px',
    margin: '20px 0'
  },
  errorIcon: {
    fontSize: '48px',
    color: '#ff9800',
    flexShrink: 0
  },
  errorTitle: {
    color: '#856404',
    marginTop: 0,
    marginBottom: '10px'
  },
  errorMessage: {
    color: '#856404',
    lineHeight: '1.6',
    marginBottom: '15px'
  },
  retryBtn: {
    background: '#007bff',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'  }
};