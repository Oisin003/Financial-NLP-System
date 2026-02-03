/**
 * NLP (Natural Language Processing) Service
 * 
 * This file processes PDF financial documents and extracts meaningful information.
 */

import natural from 'natural';  // NLP library with tokenization and stemming
import fs from 'fs';
import fetch from 'node-fetch';
// Call the Python NER microservice
async function getEntitiesFromNER(text) {
  const response = await fetch('http://127.0.0.1:8000/ner', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  if (!response.ok) throw new Error('NER service error');
  const data = await response.json();
  return data.entities; // array of entities
}

// --- NLP TOOLS SETUP ---

// Tokenizer: splits text into individual words
const tokenizer = new natural.WordTokenizer();

// Stemmer: reduces words to their root form (e.g., "running" to "run")
const { LancasterStemmer } = natural;


// Stopwords: common words we want to ignore, but preserve important financial terms
// Financial terms will be retained even if they appear in stopword lists
const baseStopwords = [
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he',
  'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'will', 'with'
];

// List of important financial terms to always retain (case-insensitive, lowercased)
const financialTerms = [
  'revenue', 'profit', 'loss', 'asset', 'liability', 'equity', 'debt', 'dividend',
  'cash', 'expense', 'income', 'balance', 'sheet', 'statement', 'fiscal', 'quarter',
  'year', 'ebitda', 'margin', 'interest', 'tax', 'amortization', 'depreciation',
  'capital', 'investment', 'valuation', 'earnings', 'shareholder', 'stock', 'bond',
  'portfolio', 'fund', 'return', 'yield', 'ratio', 'liquidity', 'solvency',
  'current', 'noncurrent', 'payable', 'receivable', 'inventory', 'cost', 'gross',
  'net', 'operating', 'nonoperating', 'comprehensive', 'income', 'statement',
  'report', 'period', 'guidance', 'forecast', 'projection', 'budget', 'audit',
  'compliance', 'regulation', 'disclosure', 'material', 'event', 'restatement',
  'consolidated', 'subsidiary', 'parent', 'acquisition', 'merger', 'divestiture',
  'goodwill', 'impairment', 'writeoff', 'write-down', 'deferred', 'tax', 'asset',
  'liability', 'provision', 'contingency', 'derivative', 'hedge', 'swap', 'option',
  'future', 'forward', 'contract', 'notional', 'exposure', 'risk', 'credit',
  'counterparty', 'default', 'rating', 'agency', 'benchmark', 'index', 'market',
  'exchange', 'currency', 'foreign', 'translation', 'revenue', 'segment', 'operating',
  'segment', 'geographic', 'segment', 'business', 'unit', 'management', 'discussion',
  'analysis', 'md&a', 'sarbanes-oxley', 'sox', 'ifrs', 'gaap', 'us-gaap', 'ias', 'fasb',
  'iasb', 'sec', '10-k', '10-q', '8-k', '20-f', '40-f', 's-1', 'prospectus', 'ipo',
  'secondary', 'offering', 'private', 'placement', 'debt', 'covenant', 'leverage',
  'coverage', 'ratio', 'interest', 'coverage', 'debt', 'service', 'coverage', 'ratio'
];

// Build stopword set, but exclude financial terms
const stopwords = new Set(baseStopwords.filter(word => !financialTerms.includes(word)));

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

// Reference: GeeksforGeeks - Extract Text from PDF using Apache Tika
// http://geeksforgeeks.org/python/parsing-pdfs-in-python-with-tika/
const extractTextWithTika = async (filePath, options = {}) => {
  const dataBuffer = fs.readFileSync(filePath);
  const useOcr = options.ocr === true;

  // Request plain text output from Tika
  const headers = {
    'Content-Type': 'application/pdf',
    'Accept': 'text/plain'
  };

  if (useOcr) {
    headers['X-Tika-OCRLanguage'] = 'eng';
  }

  try {
    const response = await fetch(TIKA_URL, {
      method: 'PUT',
      headers,
      body: dataBuffer
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      throw new Error(`Tika extraction failed (${response.status})${errorBody ? `: ${errorBody}` : ''}`);
    }

    let text = await response.text();

    // Step 2: Remove any remaining markup (basic post-processing)
    // Remove XML/HTML tags if any slipped through
    text = text.replace(/<[^>]+>/g, ' '); // Remove tags
    text = text.replace(/\s+/g, ' ').trim(); // Collapse whitespace

    return text;
  } catch (error) {
    console.error('Tika fetch failed', {
      tikaUrl: TIKA_URL,
      filePath,
      useOcr,
      error: error?.message || String(error)
    });
    throw error;
  }
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
// Remove stopwords, but always retain financial terms (case-insensitive)
export function removeStopwords(tokens) {
  return tokens.filter(token => {
    // Always retain financial terms
    if (financialTerms.includes(token)) return true;
    // Remove if in stopwords
    return !stopwords.has(token);
  });
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
  const wordFrequency = {};
  lemmatizedTokens.forEach(token => {
    wordFrequency[token] = (wordFrequency[token] || 0) + 1;
  });

  // Step 6: Find top 20 most common words
  const topWords = Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word, count]) => ({ word, count }));

  // Step 7: Get NER entities from Python microservice
  let entities = [];
  try {
    entities = await getEntitiesFromNER(rawText);
  } catch (err) {
    console.error('NER microservice error:', err.message);
  }

  // Return all results
  return {
    rawText,              // Original text
    processedTokens: lemmatizedTokens,  // All processed words
    wordFrequency,        // Word counts
    topWords,             // Top 20 words
    entities              // NER entities
  };
}

// Export the main function as default
export default { processDocument };
