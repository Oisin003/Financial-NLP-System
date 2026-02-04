/**
 * Styles for Processing Times Component
 * 
 * This file contains all CSS-in-JS styles used in the ProcessingTimes component.
 * Keeping styles separate makes the main component cleaner and easier to read.
 */

export const styles = {
  // Main container that wraps everything
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto'
  },

  // Grid layout for the two summary cards at the top
  summaryCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)', // Two equal columns
    gap: '20px',
    marginBottom: '30px'
  },

  // Individual summary card with gradient background
  summaryCard: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '30px',
    borderRadius: '8px',
    textAlign: 'center'
  },

  // Large number displayed in summary cards
  summaryValue: {
    fontSize: '48px',
    fontWeight: 'bold',
    marginBottom: '10px'
  },

  // Text label below the summary value
  summaryLabel: {
    fontSize: '16px',
    opacity: 0.9 // Slightly transparent for a softer look
  },

  // Container for the data table
  tableContainer: {
    background: 'white',
    borderRadius: '8px',
    overflow: 'hidden', // Keeps rounded corners clean
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)' // Subtle shadow for depth
  },

  // The actual table element
  table: {
    width: '100%',
    borderCollapse: 'collapse' // Removes space between table cells
  },

  // Header row at the top of the table
  headerRow: {
    background: '#f8f9fa' // Light gray background
  },

  // Table header cells (th = table header)
  th: {
    padding: '15px',
    textAlign: 'left',
    fontWeight: 'bold',
    borderBottom: '2px solid #dee2e6'
  },

  // Table data rows
  row: {
    borderBottom: '1px solid #dee2e6' // Line between rows
  },

  // Table data cells (td = table data)
  td: {
    padding: '12px 15px'
  },

  // Badge style for the duration value
  durationBadge: {
    background: '#17a2b8', // Teal/cyan color
    color: 'white',
    padding: '4px 12px',
    borderRadius: '12px', // Rounded pill shape
    fontWeight: 'bold'
  },

  // Error message box
  error: {
    background: '#f8d7da', // Light red background
    color: '#721c24', // Dark red text
    padding: '15px',
    borderRadius: '4px',
    marginTop: '20px'
  }
};
