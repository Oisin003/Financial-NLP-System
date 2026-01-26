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
  }
};
