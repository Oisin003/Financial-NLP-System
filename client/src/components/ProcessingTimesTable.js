/**
 * Processing Times Table Component
 * 
 * Displays a table showing all document processing times with details like:
 * - Document name
 * - User who processed it
 * - Upload date
 * - Start/end times
 * - Processing duration
 */

import React from 'react';
import { styles } from './ProcessingTimes.styles';
import { formatDate, formatTime } from './ProcessingTimes.utils';

function ProcessingTimesTable({ timingData }) {
  return (
    <div style={styles.tableContainer}>
      <table style={styles.table}>
        {/* Table Header */}
        <thead>
          <tr style={styles.headerRow}>
            <th style={styles.th}>Document</th>
            <th style={styles.th}>User</th>
            <th style={styles.th}>Upload Date</th>
            <th style={styles.th}>Start Time</th>
            <th style={styles.th}>End Time</th>
            <th style={styles.th}>Duration (s)</th>
          </tr>
        </thead>

        {/* Table Body - One row per document */}
        <tbody>
          {timingData.map((doc) => (
            <tr key={doc.id} style={styles.row}>
              {/* Document name */}
              <td style={styles.td}>{doc.originalName}</td>

              {/* User email */}
              <td style={styles.td}>{doc.user.email}</td>

              {/* Upload date (formatted) */}
              <td style={styles.td}>
                {formatDate(doc.uploadDate)}
              </td>

              {/* Processing start time */}
              <td style={styles.td}>
                {formatTime(doc.timing.startTime)}
              </td>

              {/* Processing end time */}
              <td style={styles.td}>
                {formatTime(doc.timing.endTime)}
              </td>

              {/* Processing duration in a badge */}
              <td style={styles.td}>
                <span style={styles.durationBadge}>
                  {doc.timing.duration.toFixed(3)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ProcessingTimesTable;
