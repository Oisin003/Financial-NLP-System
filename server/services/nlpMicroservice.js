// Calls the Python NLP microservice /analyze endpoint for full analysis (including financial figures)
import fetch from 'node-fetch';

/**
 * Calls the /analyze endpoint of the Python NLP microservice
 * @param {string} text - The text to analyze
 * @returns {Promise<Object>} - The full analysis result
 */
export async function getFullNLPAnalysis(text) {
  const response = await fetch('http://127.0.0.1:8000/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  if (!response.ok) {
    throw new Error('NLP microservice /analyze error');
  }
  return response.json();
}
