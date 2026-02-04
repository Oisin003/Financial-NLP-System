/**
 * Helper Functions for Processing Times
 * 
 * This file contains utility functions that help calculate
 * statistics from the timing data.
 */

/**
 * Calculate the average processing time across all documents
 * 
 * @param {Array} timingData - Array of document objects with timing information
 * @returns {string} - Average time formatted to 3 decimal places (e.g., "2.345")
 */
export function calculateAverageTime(timingData) {
    // If no documents, return 0
    if (timingData.length === 0) {
        return '0.000';
    }

    // Add up all the durations
    const totalSeconds = timingData.reduce((sum, doc) => {
        return sum + doc.timing.duration;
    }, 0); // Start counting from 0

    // Divide total by number of documents to get average
    const average = totalSeconds / timingData.length;

    // Format to 3 decimal places
    return average.toFixed(3);
}

/**
 * Get the total number of processed documents
 * 
 * @param {Array} timingData - Array of document objects
 * @returns {number} - Count of documents
 */
export function getTotalDocuments(timingData) {
    return timingData.length;
}

/**
 * Format a date object to a readable date string
 * 
 * @param {string|Date} date - Date to format
 * @returns {string} - Formatted date
 */
export function formatDate(date) {
    return new Date(date).toLocaleDateString('en-IE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

/**
 * Format a date object to a readable time string
 * 
 * @param {string|Date} date - Date to format
 * @returns {string} - Formatted time 
 */
export function formatTime(date) {
    return new Date(date).toLocaleTimeString('en-IE', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
}
