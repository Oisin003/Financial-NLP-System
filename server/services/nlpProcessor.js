/**
 * NLP (Natural Language Processing) Service
 * 
 * This file processes PDF financial documents and extracts meaningful information.
 * It reads PDFs, breaks text into words, removes common words, and finds patterns.
 */

// Import required libraries
import natural from 'natural';  // For tokenizing and stemming words
import fs from 'fs';  // For reading files from disk
import fetch from 'node-fetch';  // For making HTTP requests

/**
 * This function sends text to the Python NER (Named Entity Recognition) microservice
 * and gets back a list of entities (people, organizations, locations, etc.)
 * 
 * @param {string} text - The text to analyze
 * @returns {Promise<Array>} - Array of entities found in the text
 */
async function getEntitiesFromNER(text) {
  // Send a POST request to the NER service running on port 8000
  const response = await fetch('http://127.0.0.1:8000/ner', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  
  // Check if the request was successful
  if (!response.ok) {
    throw new Error('NER service error');
  }
  
  // Parse the JSON response
  const data = await response.json();
  
  // Return the entities array
  return data.entities;
}

// ==========================================
// SECTION 1: NLP TOOLS SETUP
// ==========================================

// Create a tokenizer object that will split text into individual words
// Example: "Hello world" becomes ["Hello", "world"]
const tokenizer = new natural.WordTokenizer();

// Create a stemmer that reduces words to their root form
// LancasterStemmer is aggressive (cuts more off words)
const { LancasterStemmer } = natural;

// ==========================================
// SECTION 2: STOPWORDS SETUP
// ==========================================

// Stopwords are common words that don't carry much meaning
// These are removed to focus on important words
const baseStopwords = [
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he',
  'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'will', 'with'
];

// List of important financial terms to KEEP (never remove)
// These words are important for understanding financial documents
// NOTE: Keep this list in sync with nlp_service/main.py
const financialTerms = [
  // Income Statement Terms
  'revenue', 'revenues', 'sales', 'income', 'profit', 'loss', 'earnings', 'expense', 'expenses',
  'cost', 'costs', 'margin', 'ebitda', 'ebit', 'operating', 'nonoperating', 'gross', 'net',
  'pretax', 'aftertax', 'posttax', 'eps', 'diluted', 'basic', 'profitability',
  
  // Balance Sheet Terms
  'asset', 'assets', 'liability', 'liabilities', 'equity', 'capital', 'cash', 'inventory',
  'receivable', 'receivables', 'payable', 'payables', 'current', 'noncurrent', 'longterm',
  'shortterm', 'goodwill', 'intangible', 'tangible', 'property', 'plant', 'equipment', 'ppe',
  'retained', 'accumulated', 'shareholder', 'shareholders', 'stockholder', 'stockholders',
  
  // Cash Flow Terms
  'cashflow', 'financing', 'investing', 'operational', 'fcf', 'freecashflow', 'capex',
  'dividends', 'dividend', 'payout', 'buyback', 'repurchase',
  
  // Financial Ratios & Metrics
  'ratio', 'ratios', 'roi', 'roe', 'roa', 'roce', 'roic', 'liquidity', 'solvency', 'leverage',
  'coverage', 'turnover', 'yield', 'return', 'returns', 'valuation', 'multiple', 'pe', 'pb',
  'ps', 'ev', 'enterprise', 'wacc', 'capm', 'beta', 'alpha', 'volatility', 'sharpe',
  
  // Time Periods
  'fiscal', 'quarter', 'quarterly', 'annual', 'annually', 'year', 'period', 'ytd', 'mtd',
  'q1', 'q2', 'q3', 'q4', 'fy', 'yoy', 'qoq', 'mom', 'yoy', 'cagr',
  
  // Financial Instruments
  'stock', 'stocks', 'share', 'shares', 'bond', 'bonds', 'debt', 'loan', 'credit',
  'derivative', 'derivatives', 'option', 'options', 'future', 'futures', 'forward', 'forwards',
  'swap', 'swaps', 'hedge', 'hedging', 'warrant', 'warrants', 'convertible', 'preferred',
  'common', 'securities', 'portfolio', 'fund', 'etf', 'mutual', 'index',
  
  // Corporate Actions & Events
  'acquisition', 'merger', 'divestiture', 'spinoff', 'ipo', 'offering', 'issuance',
  'refinancing', 'restructuring', 'bankruptcy', 'liquidation', 'dissolution', 'dilution',
  'split', 'reverse', 'consolidation', 'consolidated', 'subsidiary', 'subsidiaries',
  'parent', 'affiliate', 'joint', 'venture', 'partnership',
  
  // Accounting & Reporting
  'balance', 'sheet', 'statement', 'report', 'disclosure', 'footnote', 'note', 'notes',
  'comprehensive', 'amortization', 'depreciation', 'impairment', 'writeoff', 'writedown',
  'provision', 'reserve', 'accrual', 'deferred', 'contingency', 'commitment', 'obligation',
  'restatement', 'adjustment', 'reclassification', 'fair', 'value', 'book', 'carrying',
  'market', 'historical', 'materiality', 'material',
  
  // Regulatory & Compliance
  'gaap', 'ifrs', 'us-gaap', 'ias', 'fasb', 'iasb', 'sec', 'sox', 'sarbanes-oxley',
  'compliance', 'regulation', 'regulatory', 'audit', 'auditor', 'audited', 'reviewed',
  'unaudited', 'opinion', 'qualified', 'unqualified', 'adverse', 'disclaimer',
  
  // SEC Filings
  '10-k', '10-q', '8-k', '10k', '10q', '8k', 'proxy', 'def14a', '20-f', '40-f', 's-1',
  'prospectus', 'registration', 'filing', 'exhibit', 'schedule',
  
  // Market & Trading
  'market', 'trading', 'price', 'pricing', 'exchange', 'traded', 'listed', 'delisted',
  'ticker', 'symbol', 'quotation', 'bid', 'ask', 'spread', 'volume', 'outstanding',
  'float', 'capitalization', 'marketcap', 'liquidity',
  
  // Risk & Treasury
  'risk', 'risks', 'exposure', 'hedge', 'hedging', 'counterparty', 'credit', 'default',
  'rating', 'ratings', 'agency', 'moodys', 'sp', 'fitch', 'benchmark', 'libor', 'sofr',
  'treasury', 'forex', 'fx', 'currency', 'currencies', 'foreign', 'translation', 'transaction',
  
  // Strategy & Planning
  'guidance', 'forecast', 'projection', 'estimate', 'estimates', 'outlook', 'target', 'goal',
  'budget', 'plan', 'strategy', 'strategic', 'initiative', 'growth', 'expansion', 'organic',
  'inorganic', 'synergy', 'synergies', 'efficiency', 'optimization',
  
  // Segments & Operations
  'segment', 'segments', 'geographic', 'geographical', 'regional', 'business', 'unit', 'division',
  'operations', 'operational', 'management', 'discussion', 'analysis', 'md&a', 'mda',
  'discontinued', 'continuing', 'core', 'noncore',
  
  // Tax
  'tax', 'taxes', 'taxation', 'taxable', 'deductible', 'dtl', 'dta', 'nol', 'carryforward',
  'carryback', 'effective', 'statutory', 'rate', 'jurisdiction', 'domestic', 'international',
  
  // Additional Common Terms
  'covenant', 'covenants', 'notional', 'nominal', 'contract', 'contractual', 'agreement',
  'arrangement', 'transaction', 'transactions', 'proceeds', 'disbursement', 'payment',
  'settlement', 'maturity', 'principal', 'interest', 'coupon', 'amortize', 'accrete',
  'appreciate', 'depreciate', 'recognize', 'recognition', 'measurement', 'remeasurement'
];

// Build the final stopword list:
// Start with baseStopwords, but remove any that are financial terms
// This way, financial terms are never filtered out
const stopwordsWithoutFinancialTerms = baseStopwords.filter(function(word) {
  return !financialTerms.includes(word);
});
const stopwords = new Set(stopwordsWithoutFinancialTerms);

// ==========================================
// SECTION 3: TEXT EXTRACTION SETUP
// ==========================================

// URL where the Tika server is running (Tika extracts text from PDFs)
// If TIKA_URL environment variable is set, use it; otherwise use localhost
const TIKA_URL = process.env.TIKA_URL || 'http://localhost:9998/tika';

// Minimum requirements for extracted text to be considered valid
const MIN_TEXT_LENGTH = 100;  // Must have at least 100 characters
const MIN_WORDS = 50;  // Must have at least 50 words
const MIN_PRINTABLE_RATIO = 0.9;  // At least 90% must be readable characters

/**
 * This function checks if the extracted text is good enough to use
 * It checks: length, word count, and readability
 * 
 * @param {string} text - The extracted text to validate
 * @returns {Object} - { ok: true/false, reason: string }
 */
function validateExtractedText(text) {
  // First, trim whitespace from the text
  // If text is null or undefined, use empty string
  const trimmedText = (text || '').trim();

  // CHECK 1: Is the text long enough?
  if (trimmedText.length < MIN_TEXT_LENGTH) {
    return { ok: false, reason: 'Text too short' };
  }

  // CHECK 2: Does it have enough words?
  // Split by whitespace and remove empty strings
  const words = trimmedText.split(/\s+/).filter(Boolean);
  if (words.length < MIN_WORDS) {
    return { ok: false, reason: 'Too few words' };
  }

  // CHECK 3: Is the text readable (not garbage characters)?
  // Count how many printable characters there are
  const printableChars = trimmedText.replace(/[^\x20-\x7E\n\r\t]/g, '').length;
  // Calculate the ratio of printable to total characters
  const printableRatio = printableChars / trimmedText.length;
  if (printableRatio < MIN_PRINTABLE_RATIO) {
    return { ok: false, reason: 'Low readability detected (non-printable ratio)' };
  }

  // All checks passed!
  return { ok: true };
}

/**
 * This function sends a PDF file to Tika server and gets back the text
 * Reference: GeeksforGeeks - Extract Text from PDF using Apache Tika
 * http://geeksforgeeks.org/python/parsing-pdfs-in-python-with-tika/
 * 
 * @param {string} filePath - Path to the PDF file
 * @param {Object} options - Options object (optional)
 * @param {boolean} options.ocr - Whether to use OCR (Optical Character Recognition)
 * @returns {Promise<string>} - The extracted text
 */
async function extractTextWithTika(filePath, options) {
  // Set default options if not provided
  if (!options) {
    options = {};
  }
  
  // Read the PDF file into a buffer (binary data)
  const dataBuffer = fs.readFileSync(filePath);
  
  // Check if OCR should be used (for scanned documents)
  const useOcr = options.ocr === true;

  // Set up the HTTP headers for the request
  const headers = {
    'Content-Type': 'application/pdf',
    'Accept': 'text/plain'
  };

  // If OCR is enabled, tell Tika to use English language recognition
  if (useOcr) {
    headers['X-Tika-OCRLanguage'] = 'eng';
  }

  try {
    // Send the PDF to Tika server using HTTP PUT request
    const response = await fetch(TIKA_URL, {
      method: 'PUT',
      headers: headers,
      body: dataBuffer
    });

    // Check if the request was successful
    if (!response.ok) {
      const errorBody = await response.text().catch(function() { return ''; });
      throw new Error(`Tika extraction failed (${response.status})${errorBody ? `: ${errorBody}` : ''}`);
    }

    // Get the text from the response
    let text = await response.text();

    // CLEAN UP THE TEXT:
    // Sometimes Tika returns text with XML/HTML tags, so remove them
    text = text.replace(/<[^>]+>/g, ' '); // Remove any tags
    text = text.replace(/\s+/g, ' ').trim(); // Replace multiple spaces with single space

    return text;
  } catch (error) {
    // If something went wrong, log the error details
    console.error('Tika fetch failed', {
      tikaUrl: TIKA_URL,
      filePath: filePath,
      useOcr: useOcr,
      error: error?.message || String(error)
    });
    throw error;
  }
}

// ==========================================
// SECTION 4: MAIN NLP PIPELINE FUNCTIONS
// ==========================================

/**
 * STEP 1: Extract Text from PDF
 * 
 * This function reads a PDF file and extracts all the text from it.
 * If the text quality is poor, it automatically tries OCR (scanning the image).
 * 
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<string>} - The extracted text
 */
export async function extractTextFromPDF(filePath) {
  // ATTEMPT 1: Try normal text extraction
  const rawText = await extractTextWithTika(filePath);
  const validation = validateExtractedText(rawText);

  // Check if the extracted text is good enough
  if (!validation.ok) {
    // If not, try OCR (for scanned documents or images)
    console.warn(`Tika text validation failed, attempting OCR fallback: ${validation.reason}`);
    
    // ATTEMPT 2: Try with OCR enabled
    const ocrText = await extractTextWithTika(filePath, { ocr: true });
    const ocrValidation = validateExtractedText(ocrText);
    
    // Check if OCR text is good
    if (ocrValidation.ok) {
      return ocrText;
    }
    
    // If both attempts failed, throw an error
    throw new Error(`Text validation failed after OCR: ${ocrValidation.reason}`);
  }

  // Return the successfully extracted text
  return rawText;
}

/**
 * STEP 2: Tokenize Text
 * 
 * This function breaks text into individual words (tokens) and cleans them.
 * 
 * @param {string} text - The text to tokenize
 * @returns {Array<string>} - Array of cleaned word tokens
 */
export function tokenizeText(text) {
  // First, convert all text to lowercase
  // Example: "Hello" becomes "hello"
  const lowercaseText = text.toLowerCase();
  
  // Use the tokenizer to split text into words
  const tokens = tokenizer.tokenize(lowercaseText);
  
  // Filter to keep only good words:
  // 1. Must contain only letters (no numbers or punctuation)
  // 2. Must be at least 2 characters long
  const cleanedTokens = tokens.filter(function(token) {
    const onlyLetters = /^[a-z]+$/.test(token);  // Check if only letters
    const longEnough = token.length > 1;  // Check if at least 2 characters
    return onlyLetters && longEnough;
  });
  
  return cleanedTokens;
}

/**
 * STEP 3: Remove Stopwords
 * 
 * This function removes common words that don't carry important meaning.
 * BUT: it always keeps financial terms, even if they're normally stopwords.
 * 
 * @param {Array<string>} tokens - Array of word tokens
 * @returns {Array<string>} - Filtered array without stopwords
 */
export function removeStopwords(tokens) {
  const filteredTokens = tokens.filter(function(token) {
    // RULE 1: If the word is a financial term, ALWAYS keep it
    const isFinancialTerm = financialTerms.includes(token);
    if (isFinancialTerm) {
      return true;
    }
    
    // RULE 2: If the word is a stopword, remove it
    const isStopword = stopwords.has(token);
    if (isStopword) {
      return false;
    }
    
    // RULE 3: Otherwise, keep the word
    return true;
  });
  
  return filteredTokens;
}

/**
 * STEP 4: Lemmatize Tokens (Stemming)
 * 
 * This function reduces words to their root form.
 * This helps count different forms of the same word together.
 * 
 * @param {Array<string>} tokens - Array of word tokens
 * @returns {Array<string>} - Array of stemmed tokens
 */
export function lemmatizeTokens(tokens) {
  // Apply stemming to each token
  const stemmedTokens = tokens.map(function(token) {
    return LancasterStemmer.stem(token);
  });
  
  return stemmedTokens;
}

/**
 * MAIN PROCESSING FUNCTION
 * 
 * This function runs the complete NLP pipeline on a PDF document.
 * It goes through all 7 steps to extract and analyze the text.
 * 
 * @param {string} filePath - Path to the PDF file to process
 * @returns {Promise<Object>} - Object containing all analysis results
 */
export async function processDocument(filePath) {
  // ===== STEP 1: Extract text from PDF =====
  console.log('Step 1: Extracting text from PDF...');
  const rawText = await extractTextFromPDF(filePath);

  // ===== STEP 2: Split text into words (tokenize) =====
  console.log('Step 2: Tokenizing text...');
  const tokens = tokenizeText(rawText);

  // ===== STEP 3: Remove common words (stopwords) =====
  console.log('Step 3: Removing stopwords...');
  const filteredTokens = removeStopwords(tokens);

  // ===== STEP 4: Reduce words to root form (lemmatize) =====
  console.log('Step 4: Lemmatizing tokens...');
  const lemmatizedTokens = lemmatizeTokens(filteredTokens);

  // ===== STEP 5: Count how many times each word appears =====
  console.log('Step 5: Counting word frequencies...');
  const wordFrequency = {};
  for (let i = 0; i < lemmatizedTokens.length; i++) {
    const token = lemmatizedTokens[i];
    // If word exists in object, add 1; otherwise, start at 1
    if (wordFrequency[token]) {
      wordFrequency[token] = wordFrequency[token] + 1;
    } else {
      wordFrequency[token] = 1;
    }
  }

  // ===== STEP 6: Find the top 20 most common words =====
  console.log('Step 6: Finding top 20 words...');
  // Convert object to array of [word, count] pairs
  const wordFrequencyArray = Object.entries(wordFrequency);
  // Sort by count (highest first)
  wordFrequencyArray.sort(function(a, b) {
    return b[1] - a[1];  // b[1] - a[1] sorts descending
  });
  // Take only the first 20
  const top20Array = wordFrequencyArray.slice(0, 20);
  // Convert to array of objects with word and count properties
  const topWords = top20Array.map(function(item) {
    return { word: item[0], count: item[1] };
  });

  // ===== STEP 7: Get named entities (people, organizations, etc.) =====
  console.log('Step 7: Getting named entities from NER service...');
  let entities = [];
  try {
    entities = await getEntitiesFromNER(rawText);
  } catch (err) {
    console.error('NER microservice error:', err.message);
    // Continue even if NER fails (entities will be empty array)
  }

  // ===== Return all the results =====
  console.log('Processing complete!');
  return {
    rawText: rawText,                      // The original extracted text
    processedTokens: lemmatizedTokens,     // All the processed words
    wordFrequency: wordFrequency,          // Object with word counts
    topWords: topWords,                    // Array of top 20 words with counts
    entities: entities                     // Array of named entities
  };
}

// Export the main function as default
export default { processDocument };
