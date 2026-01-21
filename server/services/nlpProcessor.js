/**
 * Simple NLP Processor Service
 * 
 * Extracts and analyzes text from PDF documents using Natural Language Processing
 * 
 * References:
 * - pdf-parse: https://www.npmjs.com/package/pdf-parse
 * - natural.js: https://github.com/NaturalNode/natural
 * - Lancaster Stemmer: http://www.comp.lancs.ac.uk/computing/research/stemming/
 */

import { createRequire } from 'module';
import natural from 'natural';
import fs from 'fs';

// pdf-parse is CommonJS, so we need to use require
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

// Initialize NLP tools from natural.js library
const tokenizer = new natural.WordTokenizer();
const { LancasterStemmer } = natural;

// Common English stopwords - words that don't add meaning (like "the", "a", "is")
const stopwords = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he',
  'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'will', 'with'
]);

/**
 * Step 1: Extract text from PDF file
 * Uses pdf-parse library to read PDF and extract text content
 */
export async function extractTextFromPDF(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const pdfData = await pdfParse(dataBuffer);
  return pdfData.text;
}

/**
 * Step 2: Tokenize - split text into individual words
 * Converts to lowercase and keeps only alphabetic words longer than 1 character
 */
export function tokenizeText(text) {
  const tokens = tokenizer.tokenize(text.toLowerCase());
  return tokens.filter(token => /^[a-z]+$/.test(token) && token.length > 1);
}

/**
 * Step 3: Remove stopwords - filter out common words
 * This leaves only meaningful words for analysis
 */
export function removeStopwords(tokens) {
  return tokens.filter(token => !stopwords.has(token));
}

/**
 * Step 4: Lemmatize - reduce words to their base form
 * Example: "running" -> "run", "better" -> "bet"
 * Uses Lancaster Stemmer algorithm
 */
export function lemmatizeTokens(tokens) {
  return tokens.map(token => LancasterStemmer.stem(token));
}

/**
 * Main processing function - runs all NLP steps
 * Takes a PDF file path and returns analyzed results
 */
export async function processDocument(filePath) {
  // Run the 4-step NLP pipeline
  const rawText = await extractTextFromPDF(filePath);
  const tokens = tokenizeText(rawText);
  const filteredTokens = removeStopwords(tokens);
  const lemmatizedTokens = lemmatizeTokens(filteredTokens);
  
  // Calculate word frequencies
  const wordFrequency = {};
  lemmatizedTokens.forEach(token => {
    wordFrequency[token] = (wordFrequency[token] || 0) + 1;
  });
  
  // Get top 20 most common words
  const topWords = Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word, count]) => ({ word, count }));
  
  // Return all results
  return {
    rawText,
    processedTokens: lemmatizedTokens,
    wordFrequency,
    topWords
  };
}

export default { processDocument };
