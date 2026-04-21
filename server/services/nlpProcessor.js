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
import path from 'path';  // For working with file paths
import { fileURLToPath } from 'url';  // For ESM __dirname equivalent

// Derive __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check whether Tesseract OCR is available in the local runtimes folder.
// Uses the same detection logic as scripts/startTika.js so the two stay in sync.
function findLocalTesseractDir() {
  const runtimesDir = path.join(__dirname, '..', '..', 'runtimes');
  const baseDir = path.join(runtimesDir, 'tesseract');
  const candidates = [
    // Local runtimes folder 
    baseDir,
    path.join(baseDir, 'bin'),
    path.join(baseDir, 'Tesseract-OCR'),
    // Default Windows system install locations used when the installer picks its own target
    'C:\\Program Files\\Tesseract-OCR',
    'C:\\Program Files (x86)\\Tesseract-OCR'
  ];
  return candidates.find((dir) => fs.existsSync(path.join(dir, 'tesseract.exe'))) || null;
}
const isTesseractAvailable = findLocalTesseractDir() !== null;
if (!isTesseractAvailable) {
  console.warn('nlpProcessor: Tesseract not found in runtimes/tesseract. OCR fallback will be skipped for image-only PDFs.');
}

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
// These thresholds are set to accept shorter documents like receipts or brief statements
const MIN_TEXT_LENGTH = 30;  // Must have at least 30 characters
const MIN_WORDS = 10;  // Must have at least 10 words
const MIN_PRINTABLE_RATIO = 0.8;  // At least 80% must be readable characters

// Basic audit thresholds for risk flagging
const AUDIT_THRESHOLDS = {
  turnover: 350000  // £350k threshold for RAG classification
};

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
  const rawLength = (text || '').length;
  const trimmedText = (text || '').trim();

  // CHECK 1: Is the text long enough?
  if (trimmedText.length < MIN_TEXT_LENGTH) {
    // Provide more specific error message if PDF had lots of whitespace but no content
    if (rawLength > 0 && trimmedText.length === 0) {
      return { 
        ok: false, 
        reason: `Document contains only whitespace/blank pages (no readable text). This PDF may contain only images or be truly blank. If this is a scanned document with images, the OCR system was unable to recognize any text from the images.` 
      };
    }
    return { 
      ok: false, 
      reason: `Document text is too short (${trimmedText.length} characters). Need at least ${MIN_TEXT_LENGTH} characters for reliable NLP analysis.` 
    };
  }

  // CHECK 2: Does it have enough words?
  // Split by whitespace and remove empty strings
  const words = trimmedText.split(/\s+/).filter(Boolean);
  if (words.length < MIN_WORDS) {
    return { 
      ok: false, 
      reason: `Document has too few words (${words.length} words). Need at least ${MIN_WORDS} words for meaningful analysis.` 
    };
  }

  // CHECK 3: Is the text mostly image placeholders?
  // Pattern: [image: imageX.jp2] or similar
  const imageTagPattern = /\[image:\s*image\d+\.(jp2|jpg|jpeg|png|gif)\]/gi;
  const imageMatches = trimmedText.match(imageTagPattern);
  console.log(`Image placeholder check: found ${imageMatches ? imageMatches.length : 0} image tags`);
  
  if (imageMatches && imageMatches.length > 5) {
    // If more than 5 image placeholders, likely an image-based PDF
    const textWithoutImages = trimmedText.replace(imageTagPattern, '').trim();
    const remainingWords = textWithoutImages.split(/\s+/).filter(Boolean).length;
    console.log(`After removing image tags: ${remainingWords} words remain`);
    
    if (remainingWords < MIN_WORDS) {
      return {
        ok: false,
        reason: `Document contains ${imageMatches.length} images but no extractable text. This PDF appears to be composed entirely of images without a text layer. To process this document, you need to:\n\n1. Use OCR software (like Adobe Acrobat) to convert it to a searchable PDF\n2. Re-create the document with actual text instead of images\n3. Export from the source application with text preservation enabled`
      };
    }
  }

  // CHECK 3: Is the text readable (not garbage characters)?
  // Count how many printable characters there are
  const printableChars = trimmedText.replace(/[^\x20-\x7E\n\r\t]/g, '').length;
  // Calculate the ratio of printable to total characters
  const printableRatio = printableChars / trimmedText.length;
  if (printableRatio < MIN_PRINTABLE_RATIO) {
    return { 
      ok: false, 
      reason: `Document contains too many unreadable characters (${Math.round(printableRatio * 100)}% readable). Need at least ${Math.round(MIN_PRINTABLE_RATIO * 100)}% readable text.` 
    };
  }

  // All checks passed!
  return { ok: true };
}

function parseNumericValue(value) {
  if (!value) {
    return null;
  }

  let cleaned = value.replace(/[£$,]/g, '');
  const hasParens = cleaned.includes('(') && cleaned.includes(')');
  cleaned = cleaned.replace(/[()]/g, '');

  const number = parseFloat(cleaned);
  if (Number.isNaN(number)) {
    return null;
  }

  if (hasParens || cleaned.startsWith('-')) {
    return -Math.abs(number);
  }

  return number;
}

function extractNumberFromLine(line) {
  const matches = line.match(/\(?-?(?:£|\$)?\d[\d,]*(?:\.\d+)?\)?/g);
  if (!matches || matches.length === 0) {
    return null;
  }

  const candidates = [];
  for (let i = 0; i < matches.length; i++) {
    const raw = matches[i];
    const value = parseNumericValue(raw);
    if (value === null) {
      continue;
    }

    const hasCurrency = /[£$]/.test(raw);
    const hasThousandsComma = raw.includes(',');
    const digitsOnly = raw.replace(/[^\d]/g, '');

    if (digitsOnly.length < 4 && !hasCurrency && !hasThousandsComma) {
      continue;
    }

    const absValue = Math.abs(value);
    const looksLikeYear = !hasCurrency && !hasThousandsComma && absValue >= 1900 && absValue <= 2100;
    if (looksLikeYear) {
      continue;
    }

    candidates.push(value);
  }

  if (candidates.length === 0) {
    return null;
  }

  return candidates[0];
}

function normalizeTextLines(text) {
  return (text || '')
    .split(/\r?\n/)
    .map(function(line) { return line.trim(); })
    .filter(Boolean);
}

function lineHasKeywords(line, keywords) {
  const lower = line.toLowerCase();
  return keywords.every(function(keyword) {
    return lower.includes(keyword);
  });
}

function findLineValue(lines, keywordSets) {
  for (let i = 0; i < keywordSets.length; i++) {
    const keywords = keywordSets[i];
    for (let j = 0; j < lines.length; j++) {
      const line = lines[j];
      if (lineHasKeywords(line, keywords)) {
        let value = extractNumberFromLine(line);
        if (value !== null) {
          // If line contains "loss" (e.g., "Loss before tax"), treat as negative
          const lower = line.toLowerCase();
          if (lower.includes('loss') && value > 0) {
            value = -value;
          }
          return { value, line };
        }
      }
    }
  }

  return null;
}

function extractGrossMarginPercents(lines) {
  const values = [];
  const percentRegex = /(\d+(?:\.\d+)?)\s*%/g;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.toLowerCase().includes('gross margin')) {
      continue;
    }

    let match = percentRegex.exec(line);
    while (match) {
      const value = parseFloat(match[1]);
      if (!Number.isNaN(value)) {
        values.push({ value, line });
      }
      match = percentRegex.exec(line);
    }
  }

  return values;
}

function formatEvidenceLine(line) {
  if (!line) {
    return null;
  }

  const withoutImages = line.replace(/\[image:[^\]]+\]/gi, '');
  const collapsed = withoutImages.replace(/\s+/g, ' ').trim();
  if (!collapsed) {
    return null;
  }

  if (collapsed.length <= 240) {
    return collapsed;
  }

  return `${collapsed.slice(0, 237)}...`;
}

function formatCurrency(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 'N/A';
  }

  const absolute = Math.abs(value).toLocaleString();
  if (value < 0) {
    return `-£${absolute}`;
  }

  return `£${absolute}`;
}

function findLineContainingAnyPhrase(lines, phrases) {
  for (let i = 0; i < lines.length; i++) {
    const lower = lines[i].toLowerCase();
    for (let j = 0; j < phrases.length; j++) {
      if (lower.includes(phrases[j])) {
        return lines[i];
      }
    }
  }

  return null;
}

function getLineFromMetric(metricResult) {
  if (!metricResult) {
    return null;
  }

  return metricResult.line;
}

function getRagSeverity(status) {
  if (status === 'red') {
    return 'high';
  }

  if (status === 'amber') {
    return 'medium';
  }

  return 'low';
}

// Convert env-style values into booleans.
// Accepted truthy values: "1", "true", "yes", "on".
function parseBooleanFlag(value, fallback) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  const normalized = String(value).trim().toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on';
}

// Resolve audit rule toggles using (1) explicit options, then (2) env vars, then defaults.
// Defaults preserve current production behavior.
function getAuditAblationConfig(options = {}) {
  return {
    enableRagRule: options.enableRagRule ?? parseBooleanFlag(process.env.ABLATION_ENABLE_RAG_RULE, true),
    enableIncompleteDataRule: options.enableIncompleteDataRule ?? parseBooleanFlag(process.env.ABLATION_ENABLE_INCOMPLETE_DATA_RULE, true),
    enableDebtBurdenRule: options.enableDebtBurdenRule ?? parseBooleanFlag(process.env.ABLATION_ENABLE_DEBT_BURDEN_RULE, true),
    enableGrossMarginRule: options.enableGrossMarginRule ?? parseBooleanFlag(process.env.ABLATION_ENABLE_GROSS_MARGIN_RULE, true),
    enableGoingConcernRule: options.enableGoingConcernRule ?? parseBooleanFlag(process.env.ABLATION_ENABLE_GOING_CONCERN_RULE, true)
  };
}

function determineRagResult(turnoverValue, profitValue, netAssetsValue) {
  const hasTurnover = turnoverValue !== null;
  const hasProfit = profitValue !== null;
  const hasNetAssets = netAssetsValue !== null;

  const lowTurnover = hasTurnover && turnoverValue < AUDIT_THRESHOLDS.turnover;
  const negativeProfitBeforeTax = hasProfit && profitValue < 0;
  const netLiabilities = hasNetAssets && netAssetsValue < 0;

  let ragStatus = 'unknown';
  let ragReason = '';

  if (lowTurnover) {
    ragStatus = 'red';
    ragReason = `Turnover (${formatCurrency(turnoverValue)}) is below £350,000 threshold`;
  } else if (netLiabilities && negativeProfitBeforeTax) {
    ragStatus = 'red';
    ragReason = 'Net liabilities combined with negative profit before tax';
  } else if (negativeProfitBeforeTax) {
    ragStatus = 'amber';
    ragReason = `Negative profit before tax (${formatCurrency(profitValue)})`;
  } else if (netLiabilities) {
    ragStatus = 'amber';
    ragReason = `Net liabilities position (${formatCurrency(netAssetsValue)})`;
  } else if (hasTurnover && hasProfit && hasNetAssets) {
    const turnoverIsHealthy = turnoverValue >= AUDIT_THRESHOLDS.turnover;
    const profitIsHealthy = profitValue >= 0;
    const netAssetsAreHealthy = netAssetsValue >= 0;

    if (turnoverIsHealthy && profitIsHealthy && netAssetsAreHealthy) {
      ragStatus = 'green';
      ragReason = 'All financial indicators are positive';
    }
  }

  return {
    ragStatus,
    ragReason,
    hasTurnover,
    hasProfit,
    hasNetAssets,
    lowTurnover,
    negativeProfitBeforeTax,
    netLiabilities
  };
}

export function analyzeAuditFlags(text, options = {}) {
  const config = getAuditAblationConfig(options);
  const flags = [];
  const lines = normalizeTextLines(text);
  if (lines.length === 0) {
    return flags;
  }

  // ==========================================
  // EXTRACT KEY FINANCIAL METRICS
  // ==========================================

  // 1. TURNOVER (Revenue/Sales)
  const turnover = findLineValue(lines, [
    ['turnover'],
    ['total', 'revenue'],
    ['revenue'],
    ['net', 'sales'],
    ['sales'],
    ['total', 'sales']
  ]);

  // 2. PROFIT BEFORE TAX
  const profitBeforeTax = findLineValue(lines, [
    ['profit', 'before', 'tax'],
    ['profit', 'before', 'taxation'],
    ['loss', 'before', 'tax'],
    ['loss', 'before', 'taxation'],
    ['profit/(loss)', 'before', 'tax'],
    ['pre-tax', 'profit'],
    ['pre-tax', 'income'],
    ['pretax', 'profit'],
    ['pretax', 'income'],
    ['income', 'before', 'tax'],
    ['earnings', 'before', 'tax']
  ]);

  // 3. NET ASSETS (negative = net liabilities)
  const netAssets = findLineValue(lines, [
    ['net', 'assets'],
    ['total', 'net', 'assets'],
    ['net', 'liabilities'],
    ['total', 'equity'],
    ['shareholders', 'funds'],
    ['shareholder', 'funds'],
    ['stockholders', 'equity'],
    ['total', 'shareholders', 'equity'],
    ['members', 'funds']
  ]);

  // 4. TOTAL BORROWINGS / DEBT (for debt burden checks)
  const borrowings = findLineValue(lines, [
    ['loans', 'and', 'borrowings'],
    ['total', 'borrowings'],
    ['bank', 'borrowings'],
    ['borrowings']
  ]);

  // ==========================================
  // RAG CLASSIFICATION LOGIC
  // ==========================================
  // R (Red)   = turnover < 350k OR [net liabilities AND negative profit before tax]
  // A (Amber) = negative profit before tax OR negative net assets (net liabilities)
  // G (Green) = turnover > 350k AND positive profit before tax AND positive net assets

  const turnoverValue = turnover ? turnover.value : null;
  const profitValue = profitBeforeTax ? profitBeforeTax.value : null;
  const netAssetsValue = netAssets ? netAssets.value : null;

  const ragResult = determineRagResult(turnoverValue, profitValue, netAssetsValue);
  const hasTurnover = ragResult.hasTurnover;
  const hasProfit = ragResult.hasProfit;
  const hasNetAssets = ragResult.hasNetAssets;
  const borrowingsValue = borrowings ? borrowings.value : null;
  const ragStatus = ragResult.ragStatus;
  const ragReason = ragResult.ragReason;

  // ==========================================
  // BUILD RAG FLAG
  // ==========================================

  if (config.enableRagRule && ragStatus !== 'unknown') {
    const ragSeverity = getRagSeverity(ragStatus);

    flags.push({
      id: 'rag-status',
      severity: ragSeverity,
      title: `RAG Status: ${ragStatus.toUpperCase()}`,
      message: ragReason,
      evidence: {
        turnover: turnoverValue,
        profitBeforeTax: profitValue,
        netAssets: netAssetsValue,
        turnoverLine: formatEvidenceLine(getLineFromMetric(turnover)),
        profitBeforeTaxLine: formatEvidenceLine(getLineFromMetric(profitBeforeTax)),
        netAssetsLine: formatEvidenceLine(getLineFromMetric(netAssets)),
        ragStatus
      }
    });
  } else if (config.enableIncompleteDataRule) {
    // Missing data - couldn't determine RAG status
    const missingMetrics = [];
    if (!hasTurnover) missingMetrics.push('turnover');
    if (!hasProfit) missingMetrics.push('profit before tax');
    if (!hasNetAssets) missingMetrics.push('net assets');

    if (missingMetrics.length > 0) {
      flags.push({
        id: 'incomplete-data',
        severity: 'medium',
        title: 'Incomplete Financial Data',
        message: `Unable to determine RAG status. Missing: ${missingMetrics.join(', ')}.`,
        evidence: {
          missingMetrics,
          foundMetrics: {
            turnover: turnoverValue,
            profitBeforeTax: profitValue,
            netAssets: netAssetsValue
          }
        }
      });
    }
  }

  // ==========================================
  // EXTRA AUDIT RULE 1: DEBT BURDEN
  // ==========================================
  // Red   = borrowings / turnover >= 1.0
  // Amber = borrowings / turnover >= 0.7
  if (config.enableDebtBurdenRule && borrowingsValue !== null && hasTurnover && Math.abs(turnoverValue) > 0) {
    const debtRatio = Math.abs(borrowingsValue) / Math.abs(turnoverValue);
    const debtPct = (debtRatio * 100).toFixed(1);

    if (debtRatio >= 1.0) {
      flags.push({
        id: 'debt-burden',
        severity: 'high',
        title: 'Debt Burden Risk (Red)',
        message: `Borrowings (${formatCurrency(borrowingsValue)}) exceed turnover (${formatCurrency(turnoverValue)}), ratio ${debtPct}%.`,
        evidence: {
          borrowings: borrowingsValue,
          turnover: turnoverValue,
          debtToTurnoverRatio: Number(debtRatio.toFixed(4)),
          borrowingsLine: formatEvidenceLine(borrowings?.line),
          turnoverLine: formatEvidenceLine(turnover?.line)
        }
      });
    } else if (debtRatio >= 0.7) {
      flags.push({
        id: 'debt-burden',
        severity: 'medium',
        title: 'Debt Burden Watch (Amber)',
        message: `Borrowings are high relative to turnover (ratio ${debtPct}%).`,
        evidence: {
          borrowings: borrowingsValue,
          turnover: turnoverValue,
          debtToTurnoverRatio: Number(debtRatio.toFixed(4)),
          borrowingsLine: formatEvidenceLine(borrowings?.line),
          turnoverLine: formatEvidenceLine(turnover?.line)
        }
      });
    }
  }

  // ==========================================
  // EXTRA AUDIT RULE 2: GROSS MARGIN DETERIORATION
  // ==========================================
  // Red   = decline >= 10 percentage points
  // Amber = decline >= 5 percentage points
  const grossMarginValues = extractGrossMarginPercents(lines);
  if (config.enableGrossMarginRule && grossMarginValues.length >= 2) {
    const latestMargin = grossMarginValues[0].value;
    const priorMargin = grossMarginValues[1].value;
    const change = latestMargin - priorMargin;

    if (change <= -10) {
      flags.push({
        id: 'gross-margin-deterioration',
        severity: 'high',
        title: 'Gross Margin Deterioration (Red)',
        message: `Gross margin fell from ${priorMargin.toFixed(2)}% to ${latestMargin.toFixed(2)}% (${change.toFixed(2)}pp).`,
        evidence: {
          latestMargin,
          priorMargin,
          marginChangePctPoints: Number(change.toFixed(2)),
          line: formatEvidenceLine(grossMarginValues[0].line)
        }
      });
    } else if (change <= -5) {
      flags.push({
        id: 'gross-margin-deterioration',
        severity: 'medium',
        title: 'Gross Margin Deterioration (Amber)',
        message: `Gross margin declined by ${Math.abs(change).toFixed(2)} percentage points year-on-year.`,
        evidence: {
          latestMargin,
          priorMargin,
          marginChangePctPoints: Number(change.toFixed(2)),
          line: formatEvidenceLine(grossMarginValues[0].line)
        }
      });
    }
  }

  // ==========================================
  // EXTRA AUDIT RULE 3: GOING-CONCERN WORDING RISK
  // ==========================================
  const textLower = lines.join(' ').toLowerCase();
  const hasGoingConcern = textLower.includes('going concern');

  if (config.enableGoingConcernRule && hasGoingConcern) {
    const severePhrases = [
      'material uncertainty',
      'significant doubt',
      'may cast significant doubt',
      'unable to continue as a going concern'
    ];

    const moderatePhrases = [
      'repayable on demand',
      'dependent upon',
      'dependent on',
      'continuing support',
      'overdraft facility'
    ];

    const matchedSevere = severePhrases.find(function(phrase) { return textLower.includes(phrase); });
    const matchedModerate = moderatePhrases.find(function(phrase) { return textLower.includes(phrase); });

    if (matchedSevere) {
      flags.push({
        id: 'going-concern-risk',
        severity: 'high',
        title: 'Going Concern Risk (Red)',
        message: `Going-concern disclosure includes high-risk wording: "${matchedSevere}".`,
        evidence: {
          matchedPhrase: matchedSevere,
          line: formatEvidenceLine(findLineContainingAnyPhrase(lines, ['going concern', matchedSevere]))
        }
      });
    } else if (matchedModerate) {
      flags.push({
        id: 'going-concern-risk',
        severity: 'medium',
        title: 'Going Concern Watch (Amber)',
        message: `Going-concern note references liquidity dependency: "${matchedModerate}".`,
        evidence: {
          matchedPhrase: matchedModerate,
          line: formatEvidenceLine(findLineContainingAnyPhrase(lines, ['going concern', matchedModerate]))
        }
      });
    }
  }

  return flags;
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
  // Optional OCR tuning
  const ocrStrategy = options.ocrStrategy;
  // Check if we should try the alternative extraction method
  const useAlternative = options.alternative === true;

  // Set up the HTTP headers for the request
  const headers = {
    'Content-Type': 'application/pdf',
    'Accept': 'text/plain'
  };

  // If OCR is enabled, tell Tika to use English language recognition
  if (useOcr) {
    headers['X-Tika-OCRLanguage'] = 'eng';
  }

  // Allow callers to control OCR strategy and tuning parameters
  if (ocrStrategy) {
    headers['X-Tika-PDFOcrStrategy'] = ocrStrategy;
  } else if (useOcr) {
    // Default to OCR + text for OCR attempts
    headers['X-Tika-PDFOcrStrategy'] = 'ocr_and_text';
  }


  
  // Try alternative extraction settings for problematic PDFs
  // This attempts to extract text more aggressively without using inline OCR
  if (useAlternative) {
    headers['X-Tika-PDFextractInlineImages'] = 'true';
    headers['X-Tika-PDFextractUniqueInlineImagesOnly'] = 'false';
    if (!headers['X-Tika-PDFOcrStrategy']) {
      headers['X-Tika-PDFOcrStrategy'] = 'no_ocr';  // Don't use OCR on extracted images
    }
  }

  try {
    // Log file information for debugging
    const fileStats = fs.statSync(filePath);
    const method = useAlternative ? ' (alternative method)' : (useOcr ? ' with OCR' : '');
    const strategyInfo = headers['X-Tika-PDFOcrStrategy'] ? ` [${headers['X-Tika-PDFOcrStrategy']}]` : '';
    console.log(`Extracting text from PDF: ${path.basename(filePath)} (${fileStats.size} bytes)${method}`);
    
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
    console.log(`Tika returned ${text.length} characters${method}${strategyInfo}`);
    
    // If text is empty and we haven't tried OCR yet, provide helpful feedback
    if (text.length === 0 && !useOcr) {
      console.warn('Warning: PDF returned zero characters.');
    }

    // CLEAN UP THE TEXT:
    // Sometimes Tika returns text with XML/HTML tags, so remove them
    text = text.replace(/<[^>]+>/g, '\n'); // Remove tags while preserving separation
    const normalizedLines = text
      .split(/\r?\n/)
      .map(function(line) { return line.replace(/[ \t]+/g, ' ').trim(); })
      .filter(Boolean);
    text = normalizedLines.join('\n');

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
  let rawText = '';
  try {
    rawText = await extractTextWithTika(filePath);
  } catch (attempt1Error) {
    // Don't abort here — fall through to OCR fallbacks below
    console.warn(`Initial extraction failed (${attempt1Error.message}), attempting OCR fallback...`);
  }
  const validation = validateExtractedText(rawText);

  // Check if the extracted text is good enough
  if (!validation.ok) {
    // If not, try OCR (for scanned documents or images)
    console.warn(`Text extraction validation failed, attempting OCR fallback: ${validation.reason}`);

    // ocrText is declared here so the final error-message block can reference it
    // regardless of whether OCR was attempted.
    let ocrText = '';

    if (isTesseractAvailable) {
      // ATTEMPT 2: Try with OCR enabled
      ocrText = await extractTextWithTika(filePath, {
        ocr: true,
        ocrStrategy: 'ocr_and_text'
      });
      const ocrValidation = validateExtractedText(ocrText);

      // Check if OCR text is good
      if (ocrValidation.ok) {
        console.log('OCR extraction successful');
        return ocrText;
      }

      // ATTEMPT 3: Force OCR-only (for image-only/scanned PDFs)
      console.warn('OCR extraction failed, attempting forced OCR-only extraction...');
      const forcedOcrText = await extractTextWithTika(filePath, {
        ocr: true,
        ocrStrategy: 'ocr_only'
      });
      const forcedOcrValidation = validateExtractedText(forcedOcrText);
      if (forcedOcrValidation.ok) {
        console.log('Forced OCR-only extraction successful');
        return forcedOcrText;
      }
    } else {
      console.warn('Tesseract OCR is not available; skipping OCR attempts. Install Tesseract to runtimes/tesseract/ to enable OCR on image-only PDFs.');
    }

    // ATTEMPT 4: Try alternative extraction method
    // This uses special Tika features to extract inline images
    console.warn('Forced OCR-only extraction failed, attempting alternative extraction method...');
    let altValidation;
    try {
      const altText = await extractTextWithTika(filePath, { alternative: true });
      altValidation = validateExtractedText(altText);
      
      // Check if alternative extraction worked
      if (altValidation.ok) {
        console.log('Alternative extraction successful');
        return altText;
      }
      
      // If validation failed with a specific reason (like image detection), use that
      if (altValidation && altValidation.reason) {
        throw new Error(altValidation.reason);
      }
    } catch (altError) {
      // Alternative method failed (likely Tika configuration issue or corrupted PDF)
      console.warn(`Alternative extraction failed: ${altError.message}`);
      // If this is a validation error with a specific message, re-throw it
      if (altError.message.includes('images but no extractable text') || 
          altError.message.includes('re-create the document')) {
        throw altError;
      }
    }
    
    // All three attempts failed - provide detailed error message
    const trimmedRawText = (rawText || '').trim();
    const trimmedOcrText = (ocrText || '').trim();
    
    // Check if PDF returned only whitespace (common with graphics-based PDFs)
    if (trimmedRawText.length === 0 && trimmedOcrText.length === 0) {
      throw new Error(`Unable to extract any readable text from this PDF. The document contains only whitespace/blank content. This typically happens when:\n\n1. Text is rendered as vector graphics or flattened images (not actual text)\n2. The PDF uses custom fonts that aren't properly embedded\n3. The document is corrupted or encrypted\n\nSuggested solutions:\n• Re-export the PDF with "Embed all fonts" and "Preserve text" options enabled\n• Try converting to Word format first, then save as a new PDF\n• Use OCR software to create a searchable PDF from the original\n• Verify the PDF opens correctly and text can be selected/copied in a PDF reader`);
    }
    
    // If we got some text but not enough, provide different guidance
    throw new Error(`Unable to extract sufficient text from this document (${trimmedRawText.length} characters extracted). This may occur with scanned images, blank pages, very short documents, or PDFs with text rendered as graphics. Please ensure your PDF contains readable text content.`);
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

  // ===== STEP 8: Basic audit-style risk flags =====
  console.log('Step 8: Detecting audit flags...');
  const auditFlags = analyzeAuditFlags(rawText);

  // ===== Return all the results =====
  console.log('Processing complete!');
  return {
    rawText: rawText,                      // The original extracted text
    processedTokens: lemmatizedTokens,     // All the processed words
    wordFrequency: wordFrequency,          // Object with word counts
    topWords: topWords,                    // Array of top 20 words with counts
    entities: entities,                    // Array of named entities
    auditFlags: auditFlags                 // Array of audit risk flags
  };
}

// Export the main function as default
export default { processDocument };
