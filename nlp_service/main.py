
from fastapi import FastAPI  # FastAPI is a modern, fast web framework for Python
from pydantic import BaseModel  # Pydantic is used for data validation and settings management
import spacy  # spaCy is a popular NLP library
import nltk # Natural Language Toolkit for text processing
from nltk.corpus import stopwords # For stopword removal
import string # For string manipulation
from sklearn.feature_extraction.text import TfidfVectorizer # For text vectorization
from sklearn.decomposition import LatentDirichletAllocation # For topic modeling
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np # For numerical operations
import time # For measuring processing time
import re

# Create the FastAPI app instance
app = FastAPI()

# Load the small English spaCy model at startup (for NER and other NLP tasks)
nlp = spacy.load("en_core_web_sm")

# Ensure NLTK stopwords are downloaded: its important for text preprocessing
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

# Custom stopword list: financial terms
# NOTE: Keep this list in sync with server/services/nlpProcessor.js

# Custom stopword list: financial terms to retain during preprocessing
# NOTE: Keep this list in sync with server/services/nlpProcessor.js
default_stopwords = set(stopwords.words('english'))
financial_terms = {
    # Income Statement Terms
    'revenue', 'revenues', 'sales', 'income', 'profit', 'loss', 'earnings', 'expense', 'expenses',
    'cost', 'costs', 'margin', 'ebitda', 'ebit', 'operating', 'nonoperating', 'gross', 'net',
    'pretax', 'aftertax', 'posttax', 'eps', 'diluted', 'basic', 'profitability',
    
    # Balance Sheet Terms
    'asset', 'assets', 'liability', 'liabilities', 'equity', 'capital', 'cash', 'inventory',
    'receivable', 'receivables', 'payable', 'payables', 'current', 'noncurrent', 'longterm',
    'shortterm', 'goodwill', 'intangible', 'tangible', 'property', 'plant', 'equipment', 'ppe',
    'retained', 'accumulated', 'shareholder', 'shareholders', 'stockholder', 'stockholders',
    
    # Cash Flow Terms
    'cashflow', 'financing', 'investing', 'operational', 'fcf', 'freecashflow', 'capex',
    'dividends', 'dividend', 'payout', 'buyback', 'repurchase',
    
    # Financial Ratios & Metrics
    'ratio', 'ratios', 'roi', 'roe', 'roa', 'roce', 'roic', 'liquidity', 'solvency', 'leverage',
    'coverage', 'turnover', 'yield', 'return', 'returns', 'valuation', 'multiple', 'pe', 'pb',
    'ps', 'ev', 'enterprise', 'wacc', 'capm', 'beta', 'alpha', 'volatility', 'sharpe',
    
    # Time Periods
    'fiscal', 'quarter', 'quarterly', 'annual', 'annually', 'year', 'period', 'ytd', 'mtd',
    'q1', 'q2', 'q3', 'q4', 'fy', 'yoy', 'qoq', 'mom', 'yoy', 'cagr',
    
    # Financial Instruments
    'stock', 'stocks', 'share', 'shares', 'bond', 'bonds', 'debt', 'loan', 'credit',
    'derivative', 'derivatives', 'option', 'options', 'future', 'futures', 'forward', 'forwards',
    'swap', 'swaps', 'hedge', 'hedging', 'warrant', 'warrants', 'convertible', 'preferred',
    'common', 'securities', 'portfolio', 'fund', 'etf', 'mutual', 'index',
    
    # Corporate Actions & Events
    'acquisition', 'merger', 'divestiture', 'spinoff', 'ipo', 'offering', 'issuance',
    'refinancing', 'restructuring', 'bankruptcy', 'liquidation', 'dissolution', 'dilution',
    'split', 'reverse', 'consolidation', 'consolidated', 'subsidiary', 'subsidiaries',
    'parent', 'affiliate', 'joint', 'venture', 'partnership',
    
    # Accounting & Reporting
    'balance', 'sheet', 'statement', 'report', 'disclosure', 'footnote', 'note', 'notes',
    'comprehensive', 'amortization', 'depreciation', 'impairment', 'writeoff', 'writedown',
    'provision', 'reserve', 'accrual', 'deferred', 'contingency', 'commitment', 'obligation',
    'restatement', 'adjustment', 'reclassification', 'fair', 'value', 'book', 'carrying',
    'market', 'historical', 'materiality', 'material',
    
    # Regulatory & Compliance
    'gaap', 'ifrs', 'us-gaap', 'ias', 'fasb', 'iasb', 'sec', 'sox', 'sarbanes-oxley',
    'compliance', 'regulation', 'regulatory', 'audit', 'auditor', 'audited', 'reviewed',
    'unaudited', 'opinion', 'qualified', 'unqualified', 'adverse', 'disclaimer',
    
    # SEC Filings
    '10-k', '10-q', '8-k', '10k', '10q', '8k', 'proxy', 'def14a', '20-f', '40-f', 's-1',
    'prospectus', 'registration', 'filing', 'exhibit', 'schedule',
    
    # Market & Trading
    'market', 'trading', 'price', 'pricing', 'exchange', 'traded', 'listed', 'delisted',
    'ticker', 'symbol', 'quotation', 'bid', 'ask', 'spread', 'volume', 'outstanding',
    'float', 'capitalization', 'marketcap', 'liquidity',
    
    # Risk & Treasury
    'risk', 'risks', 'exposure', 'hedge', 'hedging', 'counterparty', 'credit', 'default',
    'rating', 'ratings', 'agency', 'moodys', 'sp', 'fitch', 'benchmark', 'libor', 'sofr',
    'treasury', 'forex', 'fx', 'currency', 'currencies', 'foreign', 'translation', 'transaction',
    
    # Strategy & Planning
    'guidance', 'forecast', 'projection', 'estimate', 'estimates', 'outlook', 'target', 'goal',
    'budget', 'plan', 'strategy', 'strategic', 'initiative', 'growth', 'expansion', 'organic',
    'inorganic', 'synergy', 'synergies', 'efficiency', 'optimization',
    
    # Segments & Operations
    'segment', 'segments', 'geographic', 'geographical', 'regional', 'business', 'unit', 'division',
    'operations', 'operational', 'management', 'discussion', 'analysis', 'md&a', 'mda',
    'discontinued', 'continuing', 'core', 'noncore',
    
    # Tax
    'tax', 'taxes', 'taxation', 'taxable', 'deductible', 'dtl', 'dta', 'nol', 'carryforward',
    'carryback', 'effective', 'statutory', 'rate', 'jurisdiction', 'domestic', 'international',
    
    # Additional Common Terms
    'covenant', 'covenants', 'notional', 'nominal', 'contract', 'contractual', 'agreement',
    'arrangement', 'transaction', 'transactions', 'proceeds', 'disbursement', 'payment',
    'settlement', 'maturity', 'principal', 'interest', 'coupon', 'amortize', 'accrete',
    'appreciate', 'depreciate', 'recognize', 'recognition', 'measurement', 'remeasurement'
}
custom_stopwords = default_stopwords - financial_terms

# Preprocessing function
# This function cleans up text by:
# 1. Converting to lowercase
# 2. Removing punctuation
# 3. Removing stopwords (but keeping financial terms)
def preprocess(text):
    # Step 1: Split text into words and convert to lowercase
    words = text.split()
    lowercase_words = [word.lower() for word in words]
    
    # Step 2: Remove punctuation from each word
    words_without_punctuation = [word.strip(string.punctuation) for word in lowercase_words]
    
    # Step 3: Keep words that are not empty AND not in our stopwords list
    cleaned_words = []
    for word in words_without_punctuation:
        is_not_empty = word != ''
        is_not_stopword = word not in custom_stopwords
        if is_not_empty and is_not_stopword:
            cleaned_words.append(word)
    
    # Step 4: Join words back into a single string
    cleaned_text = ' '.join(cleaned_words)
    return cleaned_text

def split_sentences(text):
    # Keep sentence splitting conservative to avoid breaking financial rows
    candidates = re.split(r'(?<=[.!?])\s+|\n+', text)
    cleaned = []
    seen = set()

    for sentence in candidates:
        normalized = re.sub(r'\s+', ' ', sentence).strip()
        if len(normalized) < 25:
            continue

        signature = normalized.lower()
        if signature in seen:
            continue

        seen.add(signature)
        cleaned.append(normalized)

    return cleaned

def sentence_financial_weight(sentence):
    lower = sentence.lower()
    score = 1.0

    financial_keywords = [
        'turnover', 'revenue', 'sales', 'profit', 'loss', 'gross', 'operating', 'tax',
        'assets', 'liabilities', 'equity', 'cash', 'debt', 'borrowings', 'creditors',
        'debtors', 'income', 'expenses', 'interest', 'margin'
    ]

    keyword_hits = sum(1 for keyword in financial_keywords if keyword in lower)
    if keyword_hits > 0:
        score += min(0.8, keyword_hits * 0.12)

    if re.search(r'£\s*\d|\d{1,3}(?:,\d{3})+', sentence):
        score += 0.35

    return score

def textrank_summary(text, max_sentences=4):
    sentences = split_sentences(text)
    if len(sentences) == 0:
        return text.strip()
    if len(sentences) <= max_sentences:
        return ' '.join(sentences)

    vectorizer = TfidfVectorizer(stop_words='english')
    tfidf = vectorizer.fit_transform(sentences)

    sim_matrix = cosine_similarity(tfidf)
    np.fill_diagonal(sim_matrix, 0.0)

    # Normalize rows to make a stochastic matrix
    row_sums = sim_matrix.sum(axis=1, keepdims=True)
    row_sums[row_sums == 0] = 1.0
    transition = sim_matrix / row_sums

    n = len(sentences)
    scores = np.ones(n) / n
    damping = 0.85

    for _ in range(30):
        scores = (1 - damping) / n + damping * transition.T.dot(scores)

    weighted_scores = []
    for idx, sentence in enumerate(sentences):
        weighted_scores.append((idx, scores[idx] * sentence_financial_weight(sentence)))

    top_indices = [idx for idx, _ in sorted(weighted_scores, key=lambda item: item[1], reverse=True)[:max_sentences]]
    top_indices.sort()

    return ' '.join(sentences[idx] for idx in top_indices)

def extract_financial_figures(text, limit=40):
    amount_pattern = re.compile(r'(?<!\w)(?:£\s*)?\(?-?\d{1,3}(?:,\d{3})+(?:\.\d+)?\)?(?!\w)|(?<!\w)(?:£\s*)?\(?-?\d{4,}(?:\.\d+)?\)?(?!\w)')
    financial_keywords = [
        'turnover', 'revenue', 'sales', 'profit', 'loss', 'gross', 'operating', 'tax',
        'assets', 'liabilities', 'equity', 'cash', 'debt', 'borrowings', 'creditors',
        'debtors', 'income', 'expenses', 'interest', 'margin', 'shareholders', 'funds'
    ]

    figures = []
    seen_values = set()

    for match in amount_pattern.finditer(text):
        raw_value = match.group().strip()
        normalized_value = raw_value.replace(' ', '')

        numeric = re.sub(r'[£,()\s]', '', raw_value)
        if numeric.startswith('-'):
            numeric_abs = numeric[1:]
        else:
            numeric_abs = numeric

        try:
            num_val = float(numeric_abs)
        except ValueError:
            continue

        has_currency = '£' in raw_value
        has_comma = ',' in raw_value
        if not has_currency and not has_comma and 1900 <= num_val <= 2100:
            continue

        context_start = max(0, match.start() - 80)
        context_end = min(len(text), match.end() + 80)
        context = text[context_start:context_end]
        context_lower = context.lower()

        if not any(keyword in context_lower for keyword in financial_keywords):
            continue

        if normalized_value in seen_values:
            continue

        seen_values.add(normalized_value)
        figures.append({
            "text": raw_value,
            "start_char": match.start(),
            "end_char": match.end(),
            "context": re.sub(r'\s+', ' ', context).strip()
        })

        if len(figures) >= limit:
            break

    return figures

# Health check endpoint: lets you verify the service is running
@app.get("/")
def read_root():
    return {"message": "The NER microservice is running :)"}

# Define the expected request body for the /ner endpoint
class TextRequest(BaseModel):
    text: str  # The text to analyze for named entities

# NER endpoint: receives text and returns detected entities
# NER = Named Entity Recognition (finding names, places, money amounts, etc.)
@app.post("/ner")
def extract_entities(request: TextRequest):
    # Process the text using spaCy's NLP model
    processed_document = nlp(request.text)
    
    # Extract all entities found in the text
    found_entities = []
    for entity in processed_document.ents:
        entity_info = {
            "text": entity.text,              # The actual text (e.g., "$1,000")
            "label": entity.label_,           # The type (e.g., "MONEY", "PERSON")
            "start_char": entity.start_char,  # Where it starts in the text
            "end_char": entity.end_char       # Where it ends in the text
        }
        found_entities.append(entity_info)
    
    return {"entities": found_entities, "input": request.text}


# --- Full Financial Document Analysis Endpoint ---
# This endpoint performs complete NLP analysis on financial documents
@app.post("/analyze")
def analyze_document(request: TextRequest):
    # Record start time to measure how long processing takes
    start_time = time.time()
    original_text = request.text

    # ========== STEP 1: Preprocess the text ==========
    # Clean up the text by removing stopwords but keeping financial terms
    cleaned_text = preprocess(original_text)

    # ========== STEP 2: Extract Named Entities (NER) ==========
    # Use spaCy to find entities like people, organizations, money amounts
    processed_document = nlp(original_text)
    
    # Build list of all entities found
    all_entities = []
    for entity in processed_document.ents:
        entity_info = {
            "text": entity.text,
            "label": entity.label_,
            "start_char": entity.start_char,
            "end_char": entity.end_char
        }
        all_entities.append(entity_info)

    # ========== STEP 3: Extract Financial Figures ==========
    # Use regex + nearby financial context for cleaner, more reliable values
    financial_figures = extract_financial_figures(original_text)

    # Keep non-money entities for entity panels (financial figures are already separate)
    non_money_entities = [entity for entity in all_entities if entity["label"] != "MONEY"]

    # ========== STEP 4: Topic Modeling (LDA) ==========
    # Find the main topics discussed in the document
    from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS
    
    # Split text into sentences
    sentences = re.split(r'(?<=[.!?]) +', original_text)
    
    # Clean each sentence
    processed_sentences = []
    for sentence in sentences:
        if sentence.strip():  # Only process non-empty sentences
            cleaned_sentence = preprocess(sentence)
            processed_sentences.append(cleaned_sentence)
    
    # LDA needs at least 2 documents to work
    if len(processed_sentences) < 2:
        processed_sentences = [cleaned_text, cleaned_text]
    
    # Create TF-IDF vectors from sentences
    all_stopwords = list(custom_stopwords | ENGLISH_STOP_WORDS)
    vectorizer = TfidfVectorizer(stop_words=all_stopwords)
    tfidf_matrix = vectorizer.fit_transform(processed_sentences)
    
    # Run LDA to find 2 main topics
    lda_model = LatentDirichletAllocation(n_components=2, random_state=42)
    lda_model.fit(tfidf_matrix)
    
    # Get the top 5 keywords for each topic
    topic_words = []
    feature_names = vectorizer.get_feature_names_out()
    
    for topic_number, topic_weights in enumerate(lda_model.components_):
        # Get indices of top 5 words for this topic
        top_word_indices = topic_weights.argsort()[-5:][::-1]
        # Convert indices to actual words
        top_keywords = [feature_names[index] for index in top_word_indices]
        topic_words.append({
            "topic": topic_number + 1,
            "keywords": top_keywords
        })

    # ========== STEP 5: Create Summary ==========
    summary = textrank_summary(original_text, max_sentences=4)

    # ========== STEP 6: Calculate Processing Time ==========
    end_time = time.time()
    processing_time = end_time - start_time

    # ========== Return Results ==========
    return {
        "entities": non_money_entities,
        "financial_figures": financial_figures,
        "topics": topic_words,
        "summary": summary,
        "processing_time_seconds": round(processing_time, 3),
        "input": original_text
    }

# https://www.geeksforgeeks.org/python/testing-fastapi-application/