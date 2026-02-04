/**
 * Summary Cards Component
 * 
 * Displays the two statistics cards at the top of the page:
 * - Total documents processed
 * - Average processing time
 */

import React from 'react';
import { styles } from './ProcessingTimes.styles';

function SummaryCards({ totalDocuments, averageTime }) {
  return (
    <div style={styles.summaryCards}>
      {/* Card 1: Total Documents */}
      <div style={styles.summaryCard}>
        <div style={styles.summaryValue}>{totalDocuments}</div>
        <div style={styles.summaryLabel}>Total Documents Processed</div>
      </div>

      {/* Card 2: Average Time */}
      <div style={styles.summaryCard}>
        <div style={styles.summaryValue}>{averageTime}s</div>
        <div style={styles.summaryLabel}>Average Processing Time</div>
      </div>
    </div>
  );
}

export default SummaryCards;
