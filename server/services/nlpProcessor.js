/**
 * NLP (Natural Language Processing) Service
 * 
 * This file processes PDF financial documents and extracts meaningful information.
 */

import natural from 'natural';  // NLP library with tokenization and stemming
import fs from 'fs';

// --- NLP TOOLS SETUP ---

// Tokenizer: splits text into individual words
const tokenizer = new natural.WordTokenizer();

// Stemmer: reduces words to their root form (e.g., "running" → "run")
const { LancasterStemmer } = natural;

// Stopwords: common words we want to ignore 
// Words like "the", "a", "and", "is", etc. are too common to be useful
const stopwords = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he',
  'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'will', 'with'
]); // Need to add more financial stopwords later

// --- TEXT EXTRACTION SETUP ---

// Tika server endpoint 
const TIKA_URL = process.env.TIKA_URL || 'http://localhost:9998/tika';// Remember to check if this works in the college 

// Simple validation thresholds for extracted text
const MIN_TEXT_LENGTH = 100;// Minimum number of characters
const MIN_WORDS = 50;// Minimum number of words
const MIN_PRINTABLE_RATIO = 0.9;// At least 90% printable characters

const validateExtractedText = (text) => {
  const trimmed = (text || '').trim();

  // Check 1: minimum character length
  if (trimmed.length < MIN_TEXT_LENGTH) {
    return { ok: false, reason: 'Text too short' };
  }

  // Check 2: minimum word count
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length < MIN_WORDS) {
    return { ok: false, reason: 'Too few words' };
  }

  // Check 3: readable characters ratio
  const printableChars = trimmed.replace(/[^\x20-\x7E\n\r\t]/g, '').length;
  const printableRatio = printableChars / trimmed.length;
  if (printableRatio < MIN_PRINTABLE_RATIO) {
    return { ok: false, reason: 'Low readability (non-printable ratio)' };
  }

  return { ok: true };
};

const extractTextWithTika = async (filePath, options = {}) => {
  const dataBuffer = fs.readFileSync(filePath);
  const useOcr = options.ocr === true;

  const headers = {
    'Content-Type': 'application/pdf'
  };

  if (useOcr) {
    headers['X-Tika-OCRLanguage'] = 'eng';
  }

  const response = await fetch(TIKA_URL, {
    method: 'PUT',
    headers,
    body: dataBuffer
  });

  if (!response.ok) {
    throw new Error(`Tika extraction failed (${response.status})`);
  }

  return response.text();
};

/**
 * Step 1: Extract Text from PDF
 * 
 * Reads a PDF file and extracts all text content.
 * 
 */
export async function extractTextFromPDF(filePath) {
  // First pass: standard Tika extraction
  const rawText = await extractTextWithTika(filePath);
  const validation = validateExtractedText(rawText);

  // Fallback: OCR if text is missing/low quality
  if (!validation.ok) {
    console.warn(`Tika text validation failed, attempting OCR fallback: ${validation.reason}`);
    const ocrText = await extractTextWithTika(filePath, { ocr: true });
    const ocrValidation = validateExtractedText(ocrText);
    if (ocrValidation.ok) {
      return ocrText;
    }
    throw new Error(`Text validation failed after OCR: ${ocrValidation.reason}`);
  }

  return rawText;
}

/**
 * Step 2: Tokenize Text
 * 
 * Splits text into individual words and cleans them up.
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
 */
export function lemmatizeTokens(tokens) {
  return tokens.map(token => LancasterStemmer.stem(token));
}

/**
 * Main Processing Function
 * 
 * Runs the complete NLP pipeline on a PDF document.]
 */
export async function processDocument(filePath) {
  // Step 1: Extract text from PDF
  const rawText = await extractTextFromPDF(filePath);
  
  // Step 2: Tokenize (split into words)
  const tokens = tokenizeText(rawText);
  
  // Step 3: Remove stopwords
  const filteredTokens = removeStopwords(tokens);
  
  // Step 4: Lemmatize 
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
