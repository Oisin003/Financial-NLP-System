/**
 * NLP (Natural Language Processing) Service
 * 
 * This file processes PDF financial documents and extracts meaningful information.
 * 
 * What it does:
 * 1. Extracts text from PDF files
 * 2. Cleans and processes the text (tokenization, removing common words)
 * 3. Finds the most important/frequent words
 * 4. Returns word statistics for analysis
 * 
 * NLP Pipeline Steps:
 * - Extract text → Tokenize → Remove stopwords → Lemmatize → Count frequencies
 * 
 * Used by: Document upload routes (runs automatically after PDF upload)
 */

import natural from 'natural';  // NLP library with tokenization and stemming
import fs from 'fs';
import pdfParse from 'pdf-parse';  // PDF text extraction library

// --- NLP TOOLS SETUP ---

// Tokenizer: splits text into individual words
const tokenizer = new natural.WordTokenizer();

// Stemmer: reduces words to their root form (e.g., "running" → "run")
const { LancasterStemmer } = natural;

// Stopwords: common words we want to ignore (they don't add meaning)
// Words like "the", "a", "and", "is", etc. are too common to be useful
const stopwords = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he',
  'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'will', 'with'
]);

/**
 * Step 1: Extract Text from PDF
 * 
 * Reads a PDF file and extracts all text content.
 * 
 * @param {string} filePath - Full path to the PDF file
 * @returns {Promise<string>} - All text from the PDF as a single string
 */
export async function extractTextFromPDF(filePath) {
  // Read the PDF file as a buffer (raw binary data)
  const dataBuffer = fs.readFileSync(filePath);
  
  // Parse the PDF and extract text
  const pdfData = await pdfParse(dataBuffer);
  
  // Return the extracted text
  return pdfData.text;
}

/**
 * Step 2: Tokenize Text
 * 
 * Splits text into individual words and cleans them up.
 * 
 * What it does:
 * - Converts to lowercase (so "Finance" and "finance" are the same)
 * - Splits text into individual words (tokens)
 * - Removes punctuation and numbers
 * - Removes very short words (single letters)
 * 
 * @param {string} text - The text to tokenize
 * @returns {string[]} - Array of cleaned words
 * 
 * Example:
 *   Input:  "Financial Report 2024: Revenue is $1.5M"
 *   Output: ["financial", "report", "revenue"]
 */
export function tokenizeText(text) {
  // Convert to lowercase and split into words
  const tokens = tokenizer.tokenize(text.toLowerCase());
  
  // Keep only words that:
  // - Are made of letters only (no numbers or punctuation)
  // - Are longer than 1 character
  return tokens.filter(token => 
    /^[a-z]+$/.test(token) &&  // Only letters
    token.length > 1            // At least 2 characters
  );
}

/**
 * Step 3: Remove Stopwords
 * 
 * Filters out common words that don't carry meaningful information.
 * 
 * Stopwords are words like "the", "a", "is" that appear frequently
 * but don't tell us much about the document's content.
 * 
 * @param {string[]} tokens - Array of words
 * @returns {string[]} - Array of words with stopwords removed
 * 
 * Example:
 *   Input:  ["the", "financial", "report", "is", "complete"]
 *   Output: ["financial", "report", "complete"]
 */
export function removeStopwords(tokens) {
  return tokens.filter(token => !stopwords.has(token));
}

/**
 * Step 4: Lemmatize Tokens (Stemming)
 * 
 * Reduces words to their root form so different forms of the same word
 * are counted together.
 * 
 * Uses Lancaster Stemmer algorithm.
 * 
 * @param {string[]} tokens - Array of words
 * @returns {string[]} - Array of stemmed words
 * 
 * Examples:
 *   "financial" → "fin"
 *   "finances" → "fin"
 *   "financing" → "fin"
 *   "running" → "run"
 *   "runs" → "run"
 */
export function lemmatizeTokens(tokens) {
  return tokens.map(token => LancasterStemmer.stem(token));
}

/**
 * Main Processing Function
 * 
 * Runs the complete NLP pipeline on a PDF document.
 * 
 * Complete process:
 * 1. Extract text from PDF
 * 2. Tokenize (split into words)
 * 3. Remove stopwords (common words)
 * 4. Lemmatize (reduce to root forms)
 * 5. Count word frequencies
 * 6. Find top 20 most common words
 * 
 * @param {string} filePath - Path to PDF file
 * @returns {Promise<Object>} - Object containing:
 *   - rawText: Original text from PDF
 *   - processedTokens: Array of processed words
 *   - wordFrequency: Object with word counts {word: count, ...}
 *   - topWords: Array of top 20 words [{word, count}, ...]
 */
export async function processDocument(filePath) {
  // Step 1: Extract text from PDF
  const rawText = await extractTextFromPDF(filePath);
  
  // Step 2: Tokenize (split into words)
  const tokens = tokenizeText(rawText);
  
  // Step 3: Remove stopwords
  const filteredTokens = removeStopwords(tokens);
  
  // Step 4: Lemmatize (reduce to root forms)
  const lemmatizedTokens = lemmatizeTokens(filteredTokens);
  
  // Step 5: Count word frequencies
  // Create an object like: {"finance": 45, "report": 23, "revenue": 18, ...}
  const wordFrequency = {};
  lemmatizedTokens.forEach(token => {
    wordFrequency[token] = (wordFrequency[token] || 0) + 1;
  });
  
  // Step 6: Find top 20 most common words
  // Convert to array, sort by count (highest first), take top 20
  const topWords = Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])  // Sort by count descending
    .slice(0, 20)                 // Take first 20
    .map(([word, count]) => ({ word, count }));  // Convert to objects
  
  // Return all results
  return { 
    rawText,              // Original text
    processedTokens: lemmatizedTokens,  // All processed words
    wordFrequency,        // Word counts
    topWords              // Top 20 words
  };
}

// Export the main function as default
export default { processDocument };
