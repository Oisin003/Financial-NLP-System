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
  summaryBox: {
    marginTop: '12px',
    background: 'white',
    borderLeft: '4px solid #0d6efd',
    borderRadius: '6px',
    padding: '14px 16px',
    lineHeight: '1.6',
    color: '#1f2937'
  },
  evaluationGrid: {
    marginTop: '12px',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px'
  },
  summaryToggleRow: {
    marginTop: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
    flexWrap: 'wrap'
  },
  summaryToggleNote: {
    fontSize: '12px',
    color: '#475569'
  },
  summaryToggleBtn: {
    background: '#0f766e',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '6px 10px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  evaluationCard: {
    background: 'white',
    borderRadius: '6px',
    borderLeft: '4px solid #198754',
    padding: '10px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  evaluationLabel: {
    fontSize: '12px',
    color: '#475569',
    fontWeight: '600'
  },
  evaluationValue: {
    fontSize: '16px',
    color: '#0f172a',
    fontWeight: '700'
  },
  summaryDetailGrid: {
    marginTop: '12px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
    gap: '10px'
  },
  summaryDetailCard: {
    background: '#eef6ff',
    border: '1px solid #cfe5ff',
    borderRadius: '6px',
    padding: '10px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  summaryDetailLabel: {
    fontSize: '12px',
    color: '#1d4e89',
    fontWeight: '600'
  },
  summaryDetailValue: {
    fontSize: '17px',
    color: '#0f172a',
    fontWeight: '700'
  },
  summaryMetaSection: {
    marginTop: '12px',
    background: 'white',
    borderRadius: '6px',
    padding: '10px 12px',
    border: '1px solid #e2e8f0'
  },
  summaryMetaTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#334155',
    marginBottom: '8px'
  },
  summaryMetaTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px'
  },
  summaryMetaTag: {
    background: '#f1f5f9',
    border: '1px solid #cbd5e1',
    borderRadius: '999px',
    padding: '3px 10px',
    fontSize: '12px',
    color: '#1e293b',
    fontWeight: '600'
  },
  summarySentenceList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  summarySentenceItem: {
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-start',
    background: '#f8fafc',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    padding: '8px 10px',
    lineHeight: '1.5',
    color: '#1f2937'
  },
  summaryReasonList: {
    marginTop: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  summaryReasonItem: {
    background: '#f8fafc',
    border: '1px solid #dbe7f5',
    borderRadius: '6px',
    padding: '8px 10px',
    color: '#1e293b',
    fontSize: '13px',
    lineHeight: '1.5'
  },
  summaryTechnicalLine: {
    marginTop: '6px',
    fontSize: '12px',
    color: '#334155',
    background: '#eef2f7',
    borderRadius: '4px',
    padding: '4px 6px'
  },
  summarySentenceIndex: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#0d6efd',
    minWidth: '26px'
  },
  traceRuleBox: {
    marginTop: '12px',
    background: 'white',
    borderRadius: '6px',
    borderLeft: '4px solid #6f42c1',
    padding: '10px 12px',
    color: '#1e293b'
  },
  traceList: {
    marginTop: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  traceItem: {
    background: 'white',
    borderRadius: '6px',
    padding: '10px 12px',
    borderLeft: '4px solid #6f42c1'
  },
  traceItemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px'
  },
  traceItemTitle: {
    fontWeight: '700',
    color: '#334155',
    fontSize: '13px'
  },
  traceItemScore: {
    fontWeight: '600',
    color: '#6f42c1',
    fontSize: '12px'
  },
  traceItemText: {
    color: '#1f2937',
    lineHeight: '1.5',
    fontSize: '14px'
  },
  tracePlainReason: {
    marginTop: '8px',
    fontSize: '13px',
    color: '#334155',
    lineHeight: '1.45'
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
  auditGroupsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  auditGroupSection: {
    background: 'rgba(255, 255, 255, 0.65)',
    borderRadius: '8px',
    padding: '10px 12px'
  },
  auditGroupTitle: {
    margin: '0 0 8px 0',
    fontSize: '14px',
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: '0.4px'
  },
  auditEvidenceList: {
    margin: '8px 0 0 0',
    paddingLeft: '18px',
    color: '#475569',
    fontSize: '12px'
  },
  auditEvidenceItem: {
    marginBottom: '4px',
    lineHeight: '1.4'
  },
  auditEvidenceWrapper: {
    marginTop: '8px'
  },
  auditEvidenceToggleBtn: {
    background: '#e2e8f0',
    color: '#1e293b',
    border: '1px solid #cbd5e1',
    borderRadius: '5px',
    padding: '4px 10px',
    fontSize: '12px',
    cursor: 'pointer'
  },
  fullDetailsBtn: {
    marginTop: '12px',
    background: '#0d6efd',
    color: 'white',
    border: 'none',
    padding: '10px 14px',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  detailCard: {
    background: '#ffffff',
    border: '1px solid #dbe2ea',
    borderRadius: '8px',
    padding: '16px'
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
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '4px',
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
    marginLeft: '0',
  },
  financialFigureContext: {
    color: '#334155',
    fontSize: '12px',
    lineHeight: '1.4',
    opacity: 0.9
  },
  // --- Named Entities Styles ---
  entitiesContainer: {
    marginTop: '15px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  entityTypeGroup: {
    background: 'white',
    borderRadius: '6px',
    padding: '12px 15px',
    borderLeft: '4px solid #6c757d'
  },
  entityTypeHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px'
  },
  entityTypeLabel: {
    fontWeight: '600',
    fontSize: '14px',
    color: '#333',
    textTransform: 'uppercase'
  },
  entityTypeCount: {
    background: '#6c757d',
    color: 'white',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '11px'
  },
  entityTagsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px'
  },
  entityTag: {
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '500'
  },
  // Entity type color variations
  entityTagORG: {
    background: '#e3f2fd',
    color: '#1565c0'
  },
  entityTagPERSON: {
    background: '#fce4ec',
    color: '#c2185b'
  },
  entityTagGPE: {
    background: '#e8f5e9',
    color: '#2e7d32'
  },
  entityTagDATE: {
    background: '#fff3e0',
    color: '#ef6c00'
  },
  entityTagCARDINAL: {
    background: '#f3e5f5',
    color: '#7b1fa2'
  },
  entityTagPERCENT: {
    background: '#e0f7fa',
    color: '#00838f'
  },
  entityTagLOC: {
    background: '#e8eaf6',
    color: '#3949ab'
  },
  entityTagPRODUCT: {
    background: '#fbe9e7',
    color: '#d84315'
  },
  entityTagEVENT: {
    background: '#fff8e1',
    color: '#ff8f00'
  },
  entityTagLAW: {
    background: '#efebe9',
    color: '#5d4037'
  },
  entityTagDefault: {
    background: '#f5f5f5',
    color: '#616161'
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